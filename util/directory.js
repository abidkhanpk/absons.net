const fs = require('fs');
const path = require('path');
const os = require('os');
const execSync = require("child_process").execSync;

function tmpPath() {
    // Prefer explicit override, otherwise use OS temp (/tmp/wp) when available, else project-local.
    if (process.env.SERVERLESSWP_TMP) {
        return process.env.SERVERLESSWP_TMP;
    }

    if (fs.existsSync('/tmp')) {
        return '/tmp/wp';
    }

    return path.join(process.cwd(), '.wp-tmp');
}

function resolveSourcePath() {
    const lambdaPath = '/var/task/wp';
    if (fs.existsSync(lambdaPath)) {
        return lambdaPath;
    }

    const localPath = path.join(process.cwd(), 'wp');
    if (fs.existsSync(localPath)) {
        return localPath;
    }
}

exports.setup = function() {
    const sourcePath = resolveSourcePath();
    const targetPath = tmpPath();

    if (!sourcePath) {
        console.log('Unable to find a wp directory to copy into /tmp/wp');
        return;
    }

    if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
    }

    try {
        execSync(`cp -R "${sourcePath}/." "${targetPath}/"`);
        console.log(`ServerlessWP copied wp to ${targetPath}`);
    }
    catch (err) {
        console.log(err);
    }

    // Ensure router script is present even across runs.
    const routerSource = path.join(sourcePath, 'router.php');
    const routerDest = path.join(targetPath, 'router.php');
    if (fs.existsSync(routerSource) && !fs.existsSync(routerDest)) {
        try {
            execSync(`cp "${routerSource}" "${routerDest}"`);
        }
        catch (err) {
            console.log(err);
        }
    }
}

exports.tmpPath = tmpPath;
