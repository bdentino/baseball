var onePlayer = true,
	swingFrames = 4;

module.exports = Batter;

function Batter(device) {
	if (!(this instanceof Batter)) return new Batter(device);
	this.device = device;
	this.offset = 0;
	this.angle = 0;
	this.batSet = 0;
	this.swing = [];
	for (var i = 0; i < swingFrames; i++) {
		this.swing.push([0,0,0]);
	}
	window.addEventListener('deviceorientation',this.rotate.bind(this));
	window.addEventListener('touchend', this.screenTouch.bind(this));
	window.addEventListener('touchstart', this.touchStart.bind(this));
	window.addEventListener('devicemotion', this.move.bind(this));

	device.on('requestPower', this.calculatePower.bind(this));
};

Batter.prototype.rotate = function(e) {
	this.angle = e.webkitCompassHeading || e.angle;
	if (!this.angle) return;
	var adjustedAngle = ((this.angle - this.offset) + 360 % 360);
	console.log('adjustedAngle = ' + adjustedAngle);
	this.device.emit('batAngle', adjustedAngle);
};

Batter.prototype.move = function(e) {
	this.swing.shift();
	this.swing.push([e.acceleration.x, e.acceleration.y, e.acceleration.z]);
}

Batter.prototype.screenTouch = function() {
	if (!this.batSet) {
		this.setBat();
		return;
	}
	if (onePlayer)
		this.requestPitch();
}

Batter.prototype.touchStart = function() {
	if (onePlayer)
		this.requestBallReset();
}

Batter.prototype.setBat = function() {
	this.offset = this.angle;
	this.batSet = true;
};

Batter.prototype.requestPitch = function() {
	this.device.emit('startPitch');
};

Batter.prototype.requestBallReset = function() {
	this.device.emit('resetBall');
}

Batter.prototype.calculatePower = function() {
  var energy = 0;
  for (var i = 0; i < this.swing.length; i++) {
    energy += quadratureAdd(this.swing[i][0],this.swing[i][1],this.swing[i][2]);
  }
  this.device.emit('swingPower',energy);
}

function quadratureAdd(x,y,z) {
  return Math.sqrt(x*x + y*y + z*z);
}

window.onerror = function(errorMsg, url, lineNumber) {
	alert(errorMsg);
};
