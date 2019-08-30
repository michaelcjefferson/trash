'use strict';

const express = require('express');
const helmet = require('helmet');
const path = require('path');
const jsdom = require('jsdom');
const Datauri = require('datauri');

const app = express();
const server = require('http').Server(app);

// Use Datauri to fix createObjectURL method, which doesn't work in JSDOM without this library
const datauri = new Datauri();

// Use socket.io for speedy comms between server and client
const io = require('socket.io').listen(server);

// JSDOM allows the server to render a DOM and perform logic on it along with a bunch of other handy actions. Important for the Phaser server
const { JSDOM } = jsdom;

const PORT = 3000;
const HOST = '0.0.0.0';

// Use helmet to automatically tighten up security a little. Can be used to set up CSPs - look up docs if so desired
app.use(helmet());

app.use(express.static(__dirname + '/public'));

app.get('/spectate', (req, res) => {
  res.sendFile(__dirname + '/public/spectate.html')
});

app.get('/controller', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
});

app.get('/', (req, res) => {
  res.redirect('/contoller')
});

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
});

function setupAuthoritativePhaser() {
  JSDOM.fromFile(path.join(__dirname, 'authoritative_server/index.html'), {
    // To run the scripts in the html file
    runScripts: 'dangerously',
    // Also load supported external resources
    resources: 'usable',
    // So requestAnimationFrame events fire
    pretendToBeVisual: true
  }).then((dom) => {
    // Include createObjectURL in JSDOM with datauri method to prevent errors in JSDOM
    dom.window.URL.createObjectURL = (blob) => {
      if (blob) {
        return datauri.format(blob.type, blob[Object.getOwnPropertySymbols(blob)[0]]._buffer).content;
      }
    };
    dom.window.URL.revokeObjectURL = (objectURL) => {};

    // Expose these methods and libraries to JSDOM so that they can be used in the server's Phaser instance
    dom.window.gameLoaded = () => {
      server.listen(PORT, HOST, () => {
        console.log(`Son of a gun up on ${HOST}:${PORT}.`)
      });
    };
    dom.window.io = io;
  }).catch((error) => {
    console.log(error.message);
  });
}

setupAuthoritativePhaser();