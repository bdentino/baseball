/**
 * Module Dependencies
 */

var io = require('io'),
    field = document.querySelector('.field'),
    bat = document.querySelector('.bat'),
    ball = document.querySelector('.ball');

/**
 * Offset
 */

var offset = 0,
    angle = 0,
    batAngle = 0;
    defaultOffset = 48,
    swingPower = 0;

var batSet = false;

/**
 * Connect socket
 */

socket = io('http://ws.mat.io:80/baseball');

function onPitchEnd(pitch) {
  console.log("pitch ended with bat at " + batAngle + " degrees");
  ball.style.webkitAnimationName = '';
}

ball.addEventListener("webkitAnimationEnd",onPitchEnd, false);

/**
 * On device orientation
 */

window.ondeviceorientation = function(e) {
  angle = e.webkitCompassHeading || e.angle;
  var adjustedAngle = ((angle - offset) + 360 % 360) + 48;
  socket.emit('batAngle', adjustedAngle);
};
window.ondevicemotion = function(e) {

};

/**
 * Listen for angle events
 */

socket.on('batAngle', function(a) {
  a = a | 0;
  transform(a);
  batAngle = (a - defaultOffset + 90) % 360;
  //console.log("batAngle: " + batAngle);
});

socket.on('startPitch', function(a) {
  ball.style.webkitAnimationName = 'pitch';
  swingPower = 0;
});

/**
 * Reset when you touch the phone
 */

document.ontouchend = function(e) {
  if( !batSet ) {
    offset = angle;
    batSet = true;
  }
  else {
    socket.emit('startPitch');
  }
  //bat.style['-webkit-transform'] = 'rotate('+ defaultRotation + 'deg) scale(0.25)';
};

/**
 * Transform
 */

function transform(a) {
  // rotate
  //console.log(a);
  bat.style['-webkit-transform'] = 'rotate(' + a + 'deg) scale(0.25)';
};
