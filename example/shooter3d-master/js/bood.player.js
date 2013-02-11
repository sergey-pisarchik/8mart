var boodPlayer = function(config){
	var p = config || {};
	this._type = p.type || 'human';
	this._health = p.health || 100;
	this._speed = p.speed || 1;
	document.getElementById('health').innerHTML = this._health;
	var self = this;
	bood.utils.getModel('data/guns/weapon1.js', 'data/guns', function(d){
		self._mesh = d;
		//self._mesh.material.materials[0].envMap = bood.reflectionCube;
		self._mesh.material.materials[0].metal = true;
		self._mesh.material.materials[0].shininess = 15;
		self._mesh.scale.set(50, 50, 50);
		self._mesh.rotation.x = Math.PI / 2;
		self._mesh.rotation.y = Math.PI;
		bood.scene.add(self._mesh);
	});
	this._animations = {
		idle: {
			time: 0
		},
		fire: {
			time: 0.2
		}
	};
	this.setAnimation('idle');
	//console.log('bood player created');
};

boodPlayer.prototype = {
	constructor: boodPlayer,
	//
	healthUp: function(value){
		this._health += value || 1;
	},
	//
	healthDown: function(value){
		this._health -= value || 1;
		if(this._health <= 0){
			this._health = 0;
			bood.gameOver();
		}
		document.getElementById('health').innerHTML = Math.round(this._health);
	},
	//
	setAnimation: function(name){
		if(name !== this._animationName){
			this._animationName = name;
			this._animationTime = 0;
			//console.log('player state', this._animationName);
		}
	},
	//
	process: function(delta){
		if(this._mesh == undefined)
			return this;
		switch(this._animationName){
			case 'idle':
				this._mesh.rotation.x = Math.PI / 2;
			break;
			case 'fire':
				this._animationTime += delta;
				bood._aY += delta * 0.12;
				if(this._animationTime > this._animations[this._animationName].time){
					this.setAnimation('idle');
				}
			break;
		}
	}
};