const express = require('express');

const app = express();
app.use('/', function(req, res) {
    res.end('connection succeed');
});

module.exports = app;




