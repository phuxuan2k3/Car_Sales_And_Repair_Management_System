const https = require('https');
const path = require('path');
const appDir = path.dirname((require.main.filename));
const fs = require('fs');

module.exports = (app) => {
    let key = fs.readFileSync(path.join(appDir, 'ssl', 'key.key'));
    console.log(key.toString());
    key = fs.readFileSync(path.join(appDir, 'ssl', 'cert.cert'));
    console.log(key.toString());

    return https.createServer({
        key: fs.readFileSync(path.join(appDir, 'ssl', 'key.key')),
        cert: fs.readFileSync(path.join(appDir, 'ssl', 'cert.cert'))
    }, app)
}
