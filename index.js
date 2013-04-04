/**
 * Module Dependencies
 */

var io = require('io'),
    field = document.querySelector('.field'),
    bat = document.querySelector('.bat');

/**
 * Offset
 */

var offset = 0,
    angle = 0,
    defaultOffset = 48;

/**
 * Connect socket
 */

socket = io('http://ws.mat.io:80/baseball');

/**
 * On device orientation
 */

window.ondeviceorientation = function(e) {
  angle = e.webkitCompassHeading || e.angle;
  var adjustedAngle = ((angle - offset) + 360 % 360) + 48;
  socket.emit('batAngle', adjustedAngle);
};

/**
 * Listen for angle events
 */

socket.on('batAngle', function(a) {
  a = a | 0;
  transform(a);
});

/**
 * Reset when you touch the phone
 */

document.ontouchend = function(e) {
  offset = angle;
  //bat.style['-webkit-transform'] = 'rotate('+ defaultRotation + 'deg) scale(0.25)';
}

/**
 * Transform
 */

function transform(a) {
  // rotate
  console.log(a);
  bat.style['-webkit-transform'] = 'rotate(' + a + 'deg) scale(0.25)';
};
