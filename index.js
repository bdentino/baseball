/**
 * Module Dependencies
 */

//var io = require('io'),
var device = require('device')('http://ws.mat.io:80/baseball'),
    splash = require('socket-splash'),
    batterLib = require('./batter'),
    fieldLib = require('./field'),
    pitcherLib = require('./pitcher');

console.log(device);
var batter = device('batter','mobile');
var viewer1 = device('field','desktop');
//var viewer2 = device('field2','desktop');
//var viewer3 = device('field3','desktop');
var pitcher = device('pitcher','mobile');

batter.ready(batterLib);
viewer1.ready(fieldLib);
//viewer2.ready(fieldLib);
//viewer3.ready(fieldLib);
pitcher.ready(pitcherLib);

splash('baseball!')
  .desc('Play Ball!')
  .add(batter)
  .add(viewer1)
  //.add(viewer2)
  //.add(viewer3)
  .add(pitcher)
  .ready()

