var boodBullet = function(config){
	var p = config || {};
	this._type = p.type || 't1';
	this._speed = p.speed || 800;
	this._angle = bood._aX;
	this._distance = 100;
	this._s = 1;

	var sX = Math.sin(this._angle), cX = Math.cos(this._angle), sY = Math.sin(0), cY = Math.cos(0);
	this._ax = sX * cY;
	this._ay = cX * cY;
	this._mesh = new THREE.Mesh(new THREE.CubeGeometry(2, 2, 2), new THREE.MeshBasicMaterial({
		color: 0xFF0000
	}));

	this._mesh.position.set(this._distance * this._ax, this._distance * this._ay, 70);
	this._mesh.rotation.y = -this._angle;
	bood.scene.add(this._mesh);

	this._animations = {
		fly: {
			time: 0
		},
		fire: {
			time: 0.2
		}
	};
	this.setAnimation('fly');
	//console.log('bood bullet created');
};

boodBullet.prototype = {
	constructor: boodBullet,
	setAnimation: function(name){
		if(name !== this._animationName){
			this._animationName = name;
			this._animationTime = 0;
			//console.log('bullet state', this._animationName);
		}
	},
	destroy: function(){
		this._destroy = true;
		bood.scene.remove(this._mesh);
		bood.renderer.deallocateObject(this._mesh);
		bood.clearBullets();
		//console.log('bullet destroy complete');
	},
	//
	process: function(delta){
		if(this._destroy !== undefined)
			return this;
		switch(this._animationName){
			case 'fly':
				this._distance += delta * this._speed;
				this._mesh.position.set(this._distance * this._ax, this._distance * this._ay, 70);
				// check killers
				if(bood._wave != undefined && bood._wave.items != undefined){
					for (var i = 0, l = bood._wave.items.length; i < l; i++){
						//console.log(this._angle - 0.5, bood._wave.items[i]._angle, this._angle + 0.5);
						//console.log(bood._wave.items[i]._distance, this._distance);
						if(bood._wave.items[i]._animationName != 'crdeath' && bood._wave.items[i]._animationName != 'death')
							if(this._angle - 0.2 <= bood._wave.items[i]._angle && this._angle + 0.2 >= bood._wave.items[i]._angle && this._distance - 50 <= bood._wave.items[i]._distance && this._distance + 50 >= bood._wave.items[i]._distance){
								bood._wave.items[i]._health -= Math.random() * 30 + 30;
								if(bood._wave.items[i]._health <= 0){
									bood._wave.items[i].setAnimation('death');
								} else {
									if(bood._wave.items[i]._mesh.position.z != 94){
										bood._wave.items[i].setAnimation('crdeath');
									}
								}
								
								this.setAnimation('fire');
							}
					}
				}

				if(this._distance > 1000){
					this.destroy();
				}
			break;
			case 'fire':
				this._animationTime += delta;
				this._s += delta * 15;
				this._mesh.scale.set(this._s, this._s, this._s);
				if(this._animationTime > this._animations[this._animationName].time){
					this.destroy();
				}
			break;
		}
	}
};