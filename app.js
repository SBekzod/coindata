const express = require('express');

const app = express();
app.use('/', function(req, res) {
    res.end('server is active');
});

module.exports = app;




