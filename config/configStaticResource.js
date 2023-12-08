const express = require('express');


const configStaticResource = (app, path) => {
    app.use(express.static(path));
}

module.exports = configStaticResource;