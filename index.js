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
    batAngle = 0,
    defaultOffset = 48,
    swingPower = 0,
    plateLocationX = 0,
    plateLocationY = 280,
    swingFrames = 4;

var batSet = false;

//Attempt at mutex-like lock.
//Prevent modification of swing frame when calculating hit power.
//Not sure if this is really necessary but idk how JS handles concurrent access...
var hitting = false; 

var swing = [];
for (var i = 0; i < swingFrames; i++) {
  swing.push([0,0,0]);
}

var hit = CSSAnimations.hit;
console.log(hit);

/**
 * Connect socket
 */

socket = io('http://ws.mat.io:80/baseball');

function onPitchEnd(event) {
  if (event.animationName !== 'pitch')
    return;
  console.log(event);
  if (event.keyText === '80%') {
    hitting = true;
    console.log("pitch ended with bat at " + batAngle + " degrees");
    if (batAngle > 150 || batAngle < 30) {
      var whiffSound = document.getElementById('whiffSound');
      whiffSound.play();
      hitting = false;
      return;
    }
    var power = calculateEnergy(swing);
    var dist = powerToPixels(power);
    setupHit(batAngle - 90, dist);
    var hitSound = document.getElementById('hitSound');
    hitSound.play();
    ball.style.webkitAnimationTimingFunction = 'ease-out';
    CSSAnimation.trigger(ball, 'hit', 1000);
    hitting = false;
  }
};

function powerToPixels(p) {
  return p * 8;
}

/**
 * setupHit(angle)
 *
 * @param angle     = the angle the ball will follow in degrees
 *                    clockwise from the line of pitch
 *
 * @param distance  = the distance in pixels the ball will 
 *                    travel from the plate
 */
function setupHit(angle, distance) {
  console.log("distance: " + distance);
  var radians = angle * Math.PI / 180;
  var x = Math.sin(radians) * distance;
  var y = Math.cos(radians) * distance;
  var t = plateLocationY - y + 'px';
  var l = plateLocationX + x + 'px';
  hit.setKeyframe('100%', {top: t, left: l} );
};

ball.addEventListener("cssAnimationKeyframe",onPitchEnd, false);


/**
 * On device orientation
 */

window.ondeviceorientation = function(e) {
  angle = e.webkitCompassHeading || e.angle;
  var adjustedAngle = ((angle - offset) + 360 % 360) + 48;
  socket.emit('batAngle', adjustedAngle);
};
window.ondevicemotion = function(e) {
  x = e.acceleration.x;
    y = e.acceleration.y;
    z = e.acceleration.z;
    socket.emit('motion', {
      x : x,
      y : y,
      z : z
    });
};

/**
 * Listen for motion events
 */
socket.on('motion', function(m) {
  if (hitting)
    return;
  swing.shift();
  swing.push([m.x,m.y,m.z]);
});

function calculateEnergy(frame) {
  var energy = 0;
  for (var i = 0; i < frame.length; i++) {
    energy += quadratureAdd(frame[i][0],frame[i][1],frame[i][2]);
  }
  return energy;
}

function quadratureAdd(x,y,z) {
  return Math.sqrt(x*x + y*y + z*z);
}

/**
 * Listen for angle events
 */

socket.on('batAngle', function(a) {
  a = a | 0;
  transform(a);
  batAngle = (a - defaultOffset + 90) % 360;
});

socket.on('startPitch', function(a) {
  //ball.style.webkitAnimationName = '';
  CSSAnimation.trigger(ball, 'pitch', 1000)
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
