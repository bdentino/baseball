module.exports = Pitcher;

var FRAME_LENGTH = 3

function Pitcher(device) {
  if (!(this instanceof Pitcher)) return new Pitcher(device);
  this.device = device;

  this.offset = 0;
  this.angle = 0;
  this.woundUp = false;
  this.ready = true;
  this.pitchFrame = [];
  for (var i = 0; i < FRAME_LENGTH; i++) {
    this.pitchFrame.push(0);
  }

  window.addEventListener('touchend', this.resetBall.bind(this));
  window.addEventListener('devicemotion', this.move.bind(this));

  device.on('readyForPitch', this.allowWindUp.bind(this));
};

Pitcher.prototype.allowWindUp = function() {
  this.ready = true;
}

Pitcher.prototype.resetBall = function() {
  this.woundUp = false;
  this.device.emit('resetBall')
}

Pitcher.prototype.move = function(e) {
  if (!(this.ready))
    return;

  this.angle = transform360(e) | 0
  if (this.angle > 270 && !(this.woundUp)) {
    this.woundUp = true
    this.device.emit('windUp')
  }

  if (this.angle < 110 && this.woundUp) {
    this.woundUp = false
    this.ready = false
    var power = calculatePower(this.pitchFrame)
    this.device.emit('pitch', power);
    for (var i = 0; i < FRAME_LENGTH; i++) {
      this.pitchFrame[i] = 0;
    }
    return
  }

  if (this.woundUp) {
    var rotation = e.rotationRate.gamma | 0
    var i;
    for (i = 0; i < FRAME_LENGTH; i++) {
      if (rotation < this.pitchFrame[i]) { 
        break;
      }
    }
    if (i > 0) {
      this.pitchFrame.splice(i,0,rotation);
      this.pitchFrame.shift();
    }
    //this.device.emit('pitchPower', this.pitchFrame)
  }
}

function calculatePower(frame) {
  var power = 0
  for (var i = 0; i < frame.length; i++) {
    power += frame[i];
  }
  return power;
}

function transform360(accelerationEvent) {

  var gravityX = 
    accelerationEvent.accelerationIncludingGravity.x 
    - accelerationEvent.acceleration.x

  var gravityY = 
    accelerationEvent.accelerationIncludingGravity.y 
    - accelerationEvent.acceleration.y

  var a = Math.atan(gravityY/gravityX);
  var degrees = (a * 180 / Math.PI) + 90

  if (gravityX > 0) { degrees += 180 }

  return degrees;
}

window.onerror = function(errorMsg, url, lineNumber) {
  var msg = errorMsg + ': ' + lineNumber;
  alert(msg);
};