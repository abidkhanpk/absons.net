<?php
/**
 * Custom wpdb drop-in to force mysqli SSL for TiDB Serverless and similar hosts.
 * WordPress core does not call mysqli_ssl_set() even when MYSQL_SSL_CA is defined.
 */

require_once ABSPATH . WPINC . '/class-wpdb.php';

class wpdb_ssl extends wpdb {
	public function db_connect( $allow_bail = true ) {
		$this->is_mysql = true;

		$client_flags = defined( 'MYSQL_CLIENT_FLAGS' ) ? MYSQL_CLIENT_FLAGS : 0;
		error_log( 'wpdb_ssl db_connect: host=' . $this->dbhost . ' user=' . $this->dbuser . ' flags=' . $client_flags );

		mysqli_report( MYSQLI_REPORT_OFF );

		$this->dbh = mysqli_init();
		// Disable server cert verification (TiDB Serverless uses SSL but verification can fail locally).
		if ( defined( 'MYSQLI_OPT_SSL_VERIFY_SERVER_CERT' ) ) {
			@mysqli_options( $this->dbh, MYSQLI_OPT_SSL_VERIFY_SERVER_CERT, false );
		}

		// Apply SSL settings before connect when provided.
		if ( defined( 'MYSQL_SSL_CA' ) || defined( 'MYSQL_SSL_CERT' ) || defined( 'MYSQL_SSL_KEY' ) ) {
			$ca   = defined( 'MYSQL_SSL_CA' ) ? MYSQL_SSL_CA : null;
			$cert = defined( 'MYSQL_SSL_CERT' ) ? MYSQL_SSL_CERT : null;
			$key  = defined( 'MYSQL_SSL_KEY' ) ? MYSQL_SSL_KEY : null;
			// mysqli_ssl_set signature: ($link, $key, $cert, $ca, $capath, $cipher)
			@mysqli_ssl_set( $this->dbh, $key, $cert, $ca, null, null );
			error_log( 'wpdb_ssl using SSL. ca=' . $ca . ' cert=' . $cert . ' key=' . $key );
		}

		$host    = $this->dbhost;
		$port    = null;
		$socket  = null;
		$is_ipv6 = false;

		$host_data = $this->parse_db_host( $this->dbhost );
		if ( $host_data ) {
			list( $host, $port, $socket, $is_ipv6 ) = $host_data;
		}

		if ( $is_ipv6 && extension_loaded( 'mysqlnd' ) ) {
			$host = "[$host]";
		}

		if ( WP_DEBUG ) {
			mysqli_real_connect( $this->dbh, $host, $this->dbuser, $this->dbpassword, null, $port, $socket, $client_flags );
		} else {
			// phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			@mysqli_real_connect( $this->dbh, $host, $this->dbuser, $this->dbpassword, null, $port, $socket, $client_flags );
		}

		if ( $this->dbh->connect_errno ) {
			error_log( 'wpdb_ssl connect error: ' . $this->dbh->connect_errno . ' ' . $this->dbh->connect_error );
			$this->dbh = null;
		}

		if ( ! $this->dbh && $allow_bail ) {
			return parent::db_connect( $allow_bail ); // fall back to core handling/bail message.
		} elseif ( $this->dbh ) {
			if ( ! $this->has_connected ) {
				$this->init_charset();
			}

			$this->has_connected = true;

			$this->set_charset( $this->dbh );

			$this->ready = true;
			$this->set_sql_mode();
			$this->select( $this->dbname, $this->dbh );

			return true;
		}

		return false;
	}
}

$GLOBALS['wpdb'] = new wpdb_ssl( DB_USER, DB_PASSWORD, DB_NAME, DB_HOST );
$GLOBALS['wpdb']->db_connect();
