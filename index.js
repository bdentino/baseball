/**
 * Module Dependencies
 */

//var io = require('io'),
var device = require('device')('http://10.0.0.21:9000/baseball'),
    splash = require('socket-splash'),
    //batterLib = require('./batter'),
    fieldLib = require('./field'),
    pitcherLib = require('./pitcher');

console.log(device);
//var batter = device('batter','mobile');
var viewer = device('field','desktop');
var pitcher = device('pitcher', 'mobile');

//batter.ready(batterLib);
viewer.ready(fieldLib);
pitcher.ready(pitcherLib);

splash('baseball!')
  .desc('Play Ball!')
  //.add(batter)
  .add(viewer)
  .add(pitcher)
  .ready()

