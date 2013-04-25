 var  field = document.querySelector('.fieldImage'),
      bat = document.querySelector('.bat'),
      ball = document.querySelector('.ball'),
      hit = CSSAnimations.hit,
      pitch = CSSAnimations.pitch;

      plateLocationX = 0,
      plateLocationY = 280,
      batOffset = 48, //Angle at which the bat lies in .png image
      batAngle = 0,
      hitting = false,
      maxPitchPower = 6000;

module.exports = Field;

function Field(device) {
  if (!(this instanceof Field)) return new Field(device);
  this.device = device;
  
  device.on('batAngle', this.rotateBat.bind(this));
  device.on('startPitch', this.startPitch.bind(this));
  device.on('resetBall', this.resetBall.bind(this));
  device.on('swingPower', this.onSwing.bind(this));
  device.on('pitch', this.onPitch.bind(this));
  device.on('windUp', this.onWindUp.bind(this));

  ball.addEventListener("cssAnimationKeyframe",this.onPitchEnd.bind(this));
  ball.addEventListener("cssAnimationKeyframe",this.onHitEnd.bind(this));
}

Field.prototype.onWindUp = function() {
  CSSAnimation.trigger(ball, 'windUp', 500);
}

Field.prototype.onPitch = function(power) {
  var speed = powerToSpeed(power);
  CSSAnimation.trigger(ball, 'pitch', speed);
  console.log(power, speed);
}

Field.prototype.onPitchEnd = function(event) {
    if (event.animationName !== 'pitch')
      return;
    console.log(event);
    if (event.keyText === '50%') {
      hitting = true;
      console.log("pitch ended with bat at " + batAngle + " degrees");
      if (batAngle > 150 || batAngle < 30) {
        var whiffSound = document.getElementById('whiffSound');
        whiffSound.play();
        hitting = false;
        return;
      }
      this.device.emit('requestPower');
      hitting = false;
    }
    else if (event.keyText ==='100%') {
      this.device.emit('readyForPitch');
      console.log('ready for pitch');
    }
}

Field.prototype.onHitEnd = function(event) {
  if (event.animationName !== 'hit')
    return;
  if (event.keyText === '100%') {
    this.device.emit('readyForPitch');
    console.log('ready for pitch');
  }
}

Field.prototype.onSwing = function(power) {
  var dist = powerToPixels(power);
  setupHit(batAngle + batOffset - 90, dist);
  var hitSound = document.getElementById('hitSound');
  hitSound.play();
  ball.style.webkitAnimationTimingFunction = 'ease-out';
  CSSAnimation.trigger(ball, 'hit', 1000);
}

Field.prototype.rotateBat = function(a) {
  a = a | 0;
  batAngle = (a - batOffset + 90) % 360;
  transform(batAngle);
}

Field.prototype.resetBall = function() {
  CSSAnimation.reset(ball);
}

Field.prototype.startPitch = function() {
  CSSAnimation.trigger(ball, 'pitch', 1000);
};

function transform(a) {
  bat.style['-webkit-transform'] = 'rotate(' + a + 'deg) scale(0.25)';
};

function powerToPixels(p) {
  return p * 8;
}

function powerToSpeed(p) {
  var speed = 3000000 / p;
  return speed;
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
