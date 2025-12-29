<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/documentation/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** Resolve env values from multiple sources (getenv, $_ENV, $_SERVER). */
function slwp_env($key) {
  $value = getenv($key);
  if ($value === false && isset($_ENV[$key])) {
    $value = $_ENV[$key];
  }
  if ($value === false && isset($_SERVER[$key])) {
    $value = $_SERVER[$key];
  }
  return $value;
}

/** The name of the database for WordPress */
$dbName = slwp_env('DATABASE');
if ($dbName !== false && $dbName !== null) {
  define( 'DB_NAME', $dbName );
}

/** Database username */
$dbUser = slwp_env('USERNAME');
if ($dbUser !== false && $dbUser !== null) {
  define( 'DB_USER', $dbUser );
}

/** Database password */
$dbPass = slwp_env('PASSWORD');
if ($dbPass !== false && $dbPass !== null) {
  define( 'DB_PASSWORD', $dbPass );
}

/** Database hostname */
$dbHost = slwp_env('HOST');
if ($dbHost !== false && $dbHost !== null) {
  define( 'DB_HOST', $dbHost );
}

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
$dbCollate = slwp_env('DB_COLLATE');
if ($dbCollate !== false && $dbCollate !== null) {
  define( 'DB_COLLATE', $dbCollate );
}
else {
  if ($dbHost && str_contains($dbHost, 'tidbcloud.com')) {
    define ( 'DB_COLLATE', 'utf8mb4_general_ci');
  }
  else {
    define( 'DB_COLLATE', '' );
  }
}

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'put your unique phrase here' );
define( 'SECURE_AUTH_KEY',  'put your unique phrase here' );
define( 'LOGGED_IN_KEY',    'put your unique phrase here' );
define( 'NONCE_KEY',        'put your unique phrase here' );
define( 'AUTH_SALT',        'put your unique phrase here' );
define( 'SECURE_AUTH_SALT', 'put your unique phrase here' );
define( 'LOGGED_IN_SALT',   'put your unique phrase here' );
define( 'NONCE_SALT',       'put your unique phrase here' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = slwp_env('TABLE_PREFIX') ? slwp_env('TABLE_PREFIX') : 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/documentation/article/debugging-in-wordpress/
 */
// Enable debugging/logging for local troubleshooting.
if ( defined( 'WP_DEBUG' ) ) {
  // keep existing value
} else {
  define( 'WP_DEBUG', true );
}

/* Add any custom values between this line and the "stop editing" line. */

if (!isset($_ENV['SKIP_MYSQL_SSL'])) {
  // Force TLS (no plain connections); allow skipping server cert verification if needed.
  define('MYSQL_CLIENT_FLAGS', MYSQLI_CLIENT_SSL | MYSQLI_CLIENT_SSL_DONT_VERIFY_SERVER_CERT);
}

// Determine protocol/host; avoid forcing HTTPS for local dev.
$headers = getallheaders();
if (isset($headers['injectHost'])) {
  $_SERVER['HTTP_HOST'] = $headers['injectHost'];
}

$proto = 'http';
if (
  (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ||
  (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') ||
  getenv('SERVERLESSWP_FORCE_HTTPS')
) {
  $_SERVER['HTTPS'] = 'on';
  $proto = 'https';
}

$host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost';
define('WP_SITEURL', $proto . '://' . $host);
define('WP_HOME', $proto . '://' . $host);

// Optional S3 credentials for file storage.
if (slwp_env('S3_KEY_ID') && slwp_env('S3_ACCESS_KEY')) {
	define( 'AS3CF_SETTINGS', serialize( array(
        'provider' => 'aws',
        'access-key-id' => slwp_env('S3_KEY_ID'),
        'secret-access-key' => slwp_env('S3_ACCESS_KEY'),
) ) );
}

// Disable file modification because the changes won't be persisted.
define('DISALLOW_FILE_EDIT', true );
define('DISALLOW_FILE_MODS', true );

// Optional SSL cert paths for MySQL/TiDB (set via env if you have CA/client certs).
$sslCa = slwp_env('MYSQL_SSL_CA');
if ($sslCa) {
  define('MYSQL_SSL_CA', $sslCa);
}
$sslCert = slwp_env('MYSQL_SSL_CERT');
if ($sslCert) {
  define('MYSQL_SSL_CERT', $sslCert);
}
$sslKey = slwp_env('MYSQL_SSL_KEY');
if ($sslKey) {
  define('MYSQL_SSL_KEY', $sslKey);
}

// Debug logging to capture DB connection issues locally.
if ( ! defined( 'WP_DEBUG_LOG' ) ) {
  define( 'WP_DEBUG_LOG', true );
}
if ( ! defined( 'WP_DEBUG_DISPLAY' ) ) {
  define( 'WP_DEBUG_DISPLAY', false );
}
@ini_set( 'log_errors', 1 );
@ini_set( 'error_log', __DIR__ . '/wp-content/debug.log' );

// Emit key DB env values to the log for troubleshooting (without password).
error_log( 'DB_HOST=' . ($dbHost ?: 'unset') . ' DB_NAME=' . ($dbName ?: 'unset') . ' DB_USER=' . ($dbUser ?: 'unset') );
if ( $sslCa || $sslCert || $sslKey ) {
  error_log( 'MySQL SSL set. CA=' . ($sslCa ?: 'none') . ' CERT=' . ($sslCert ?: 'none') . ' KEY=' . ($sslKey ?: 'none') );
}

// If using SQLite + S3 instead of MySQL/MariaDB.
if (slwp_env('SQLITE_S3_BUCKET') || slwp_env('SERVERLESSWP_DATA_SECRET')) {
  define('DB_DIR', '/tmp');
  define('DB_FILE', 'wp-sqlite-s3.sqlite');

  // Auto-cron can cause db race conditions on these urls, don't bother with it.
  if (strpos($_SERVER['REQUEST_URI'], 'wp-admin') !== false || strpos($_SERVER['REQUEST_URI'], 'wp-login') !== false) {
    define('DISABLE_WP_CRON', true);
  }

  // Increase time between cron runs (2 hours) to reduce DB writes.
  define('WP_CRON_LOCK_TIMEOUT', 7200);

  // Limit revisions.
  define('WP_POST_REVISIONS', 3);
}

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
