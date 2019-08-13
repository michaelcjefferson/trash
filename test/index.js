'use strict';

const express = require('express');
const path = require('path');

const app = express();
const server = require('http').Server(app);

const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
});

server.listen(PORT, HOST, () => {
  console.log(`Son of a gun up on ${HOST}:${PORT}.`)
});