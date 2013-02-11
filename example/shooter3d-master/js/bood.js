var bood = {
	Version: '0.0.1.1',
	
	MaxWidth: 1024,
	MaxHeight: 576,
	AspectRation: [16, 9],
	_fullScreen: false,
	_pause: true,

	_frags: 0,
	_boss: 1,

	init: function() {
		this.createScene();
		this.addPlayer();
		this._resourcesCounter = 5;
		this.createWave({
			count: this._resourcesCounter,
			type: 'monster'
		});
		var timer = setInterval(function(){
			var c = 0;
			if(bood._wave != undefined && bood._wave.items != undefined){
				for (var i = 0, l = bood._wave.items.length; i < l; i++){
					if(bood._wave.items[i]._loaded){
						c++;
					}
				}
			}

			if(c == bood._resourcesCounter){
				//console.log('start!');
				clearInterval(timer);
				document.getElementById('loadingTitle').style.display = 'none';
				document.getElementById('startBtn').style.display = 'block';
				bood.bindMouse();
				bood.bindKeyboard();
			}
		}, 100);
	},

	bindMouse: function(){
		window.onmousemove = function(e){
			//console.log(e.clientX, e.clientY);
			var x = e.clientX, y = e.clientY, ax = Math.PI * 2, ay = Math.PI / 2;
			x -= Math.round(window.innerWidth / 2) - Math.round(bood._w / 2);
			bood._aX = ax / 2 / 1024 * x + ax / 4;
			if (x < 0){
				bood._aX = ax / 4;
			}
			if (x > bood._w){
				bood._aX = - ax / 4;
			}
			if(bood._player._mesh !== undefined)
				bood._player._mesh.rotation.y = - bood._aX + Math.PI;

			y -= Math.round(window.innerHeight / 2) - Math.round(bood._h / 2);
			bood._aY = ay / 4 / 576 * y - ay / 6;

			if (y < 0){
				bood._aY = - ay / 6;
			}
			if (y > bood._h){
				bood._aY = ay / 12;
			}
		};
		document.onclick = function(event){
			if(!bood._pause){
				bood._player.setAnimation('fire');
				if(bood._bullets == undefined){
					bood._bullets = [];
				}
				bood._bullets.push(new boodBullet());
			}
			//event.preventDefault();
		};
		document.getElementById('startBtn').onclick = function(event){
			event.preventDefault();
			document.getElementById('bg').style.display = 'none';
			document.getElementById('startBtn').style.display = 'none';
			document.getElementById('continueBtn').style.display = 'none';
			bood._pause = false;
			bood.animate();
		};
		document.getElementById('continueBtn').onclick = function(event){
			event.preventDefault();
			bood.pause();
		};
		document.getElementById('restartBtn').onclick = function(event){
			event.preventDefault();
			bood._player._health = 100;
			bood._frags = 0;
			document.getElementById('health').innerHTML = bood._player._health;
			document.getElementById('frags').innerHTML = bood._frags;

			if(bood._wave != undefined && bood._wave.items != undefined){
				for (var i = 0, l = bood._wave.items.length; i < l; i++){
					bood._wave.items[i].reset();
				}
			}

			document.getElementById('gameover').style.display = 'none';
			bood.pause();
		};
	},

	bindKeyboard: function(){
		this._keyDownList = [];
		window.onkeydown = function(e){
			//console.log('key press', e.keyCode);
			bood._keyDownList[e.keyCode] = true;
			if(e.keyCode == 80 || e.keyCode == 27){
				bood.pause();
			}
			if(e.keyCode == 70){
				bood.fullScreen();
			}
		};
		window.onkeyup = function(e){
			bood._keyDownList[e.keyCode] = false;
		};
	},

	fullScreen: function(){
		this._fullScreen = !this._fullScreen;
		this.updateSceneSize();
	},

	pause: function(){
		this._pause = !this._pause;
		if(!this._pause){
			document.getElementById('bg').style.display = 'none';
			document.getElementById('continueBtn').style.display = 'none';
			this._clock.start();
			this.animate();
		} else {
			document.getElementById('bg').style.display = 'block';
			document.getElementById('continueBtn').style.display = 'block';
		}
	},

	gameOver: function(){
		this._pause = true;
		setTimeout(function(){
			document.getElementById('blood').style.opacity = 0.8;
		}, 150);
		setTimeout(function(){
			document.getElementById('gameover').style.display = 'block';
			document.getElementById('blood').style.opacity = 0;
		}, 2000);
	},

	animate: function() {
		if(!bood._pause){
			requestAnimationFrame(bood.animate);
		} else {
			bood._clock.stop();
			return this;
		}
		var delta = bood._clock.getDelta();
		// player
		bood._player.process(delta);
		// killers
		if(bood._wave != undefined && bood._wave.items != undefined){
			for (var i = 0, l = bood._wave.items.length; i < l; i++){
				bood._wave.items[i].process(delta);
			}
		}
		// bullets
		if(bood._bullets != undefined){
			for (var i = 0, l = bood._bullets.length; i < l; i++){
				if(bood._bullets[i] != undefined)
					bood._bullets[i].process(delta);
			}
		}
		// snow
		var time = Date.now() * 0.00005;
		for ( i = 0; i < bood.scene.children.length; i ++ ) {
			var object = bood.scene.children[ i ];
			if ( object instanceof THREE.ParticleSystem ) {
				object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );
			}
		}
		// update camera
		bood.setCameraPos();
		// render
		bood.renderer.render(bood.scene, bood.camera);
	},

	addPlayer: function() {
		this._player = new boodPlayer({
			type: 'human',
			name: 'Ironman'
		});
	},

	createWave: function(config){
		var p = config || {};
		this._wave = {
			count: p.count || 1,
			type: p.type || 'monster',
			items: []
		};
		for (var i = 0, l = this._wave.count; i < l; i++){
			this._wave.items.push(new boodKiller({
				type: this._wave.type,
				index: i
			}));
		}
	},

	createScene: function() {
		// create renderer
		this._wrap = document.getElementById('wrap');
		this.renderer = new THREE.WebGLRenderer({
			antialias: true
			,autoClear: true
			,clearColor: 0xefefef
			,clearAlpha: 1
			//,preserveDrawingBuffer: true
		});
		this._wrap.appendChild(this.renderer.domElement);

		// loader
		this._loader = new THREE.p5dLoader();
		this._loadedModels = {};

		// clock
		this._clock = new THREE.Clock();

		// camera
		this._radius = 90;
		this._radiusDelta = 0;
		this.lookPosition = new THREE.Vector3(0, 0, 80);
		this.camera = new THREE.PerspectiveCamera(60, 1024 / 576, 10, 6000);
		this.camera.up = new THREE.Vector3(0, 0, 1);
		this._aX = 0;
		this._aY = Math.PI / 12;

		// scene
		this.scene = new THREE.Scene();
		this.scene.fog = new THREE.FogExp2( 0xefefef, 0.0008, 3000);
		//this.scene.fog = new THREE.Fog( 0xefd1b5, 500, 3000 );

		// light
		this.light = new THREE.HemisphereLight(0xFFFFFF, 0x000000, 1.8);
		this.light.up = new THREE.Vector3(0, 0, 1);
		this.light.position.set(-500, -500, 3000);
		this.scene.add(this.light);
		
		// ambient
		this.scene.add(new THREE.AmbientLight(0x000000));

		// create reflectionCube
		var path = '/m/cube/', format = '.jpg', urls = [path + 'px' + format, path + 'nx' + format, path + 'py' + format, path + 'ny' + format, path + 'pz' + format, path + 'nz' + format];
		this.reflectionCube = THREE.ImageUtils.loadTextureCube( urls );
		this.reflectionCube.format = THREE.RGBFormat;

		// floor
		var obj, t = THREE.ImageUtils.loadTexture('data/ground/ground_snow.jpg');
		t.wrapS = t.wrapT = THREE.RepeatWrapping;
		t.repeat.set(40, 40);
		obj = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000, 1, 1), new THREE.MeshBasicMaterial({
			map: t
		}));
		obj.doubleSided = true;
		obj.receiveShadow = true;
		this.scene.add(obj);

		//obj = new THREE.AxisHelper(100);
		//obj.position.set(0, 0, 10);
		//this.scene.add(obj);
		/*
		obj = new THREE.Mesh(new THREE.CylinderGeometry( 5, 20, 190, 8, 8 ), new THREE.MeshPhongMaterial({
			color: 0xfd2e56
		}));
		obj.position.set(0,300,80);
		obj.rotation.x = Math.PI / 2;
		bood.scene.add(obj);
		*/
		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;
		this.renderer.physicallyBasedShading = true;

		bood.utils.getModel('data/trees/tree.js', 'data/trees', function(d){
			d.scale.set(150, 150, 150);
			d.position.set(300, -800, 0);
			d.rotation.x = Math.PI / 2;
			d.rotation.y = Math.PI;
			d.matrixAutoUpdate = false;
			d.updateMatrix();
			bood.scene.add(d);
			for (var i = 0, l = 30; i < l; i++){
				var obj = d.clone(), a = Math.random() * Math.PI * 2, s = Math.random() * 100 + 50, sX = Math.sin(a), cX = Math.cos(a), sY = Math.sin(0), cY = Math.cos(0), ax = sX * cY, ay = cX * cY, dist = Math.round(Math.random() * 1000 + 500);
				obj.position.set(dist * ax, dist * ay, 0);
				obj.rotation.y = Math.random() * Math.PI * 3;
				obj.scale.set(s, s, s);
				obj.matrixAutoUpdate = false;
				obj.updateMatrix();
				bood.scene.add(obj);
			}
		});

		this.addSnow();

		// set default view
		this.setCameraPos();

		// set sizes
		this.updateSceneSize();
		window.addEventListener('resize', function() {
			bood.updateSceneSize();
		});
	},

	addSnow: function(){
		this._snowGeometry = new THREE.Geometry();
		for (var vertex, i = 0; i < 20000; i ++ ) {
			vertex = new THREE.Vector3();
			vertex.x = Math.random() * 2000 - 1000;
			vertex.y = Math.random() * 2000 - 1000;
			vertex.z = Math.random() * 2000 - 1000;
			this._snowGeometry.vertices.push(vertex);
		}
		var materials = [], particles, size, color, parameters = [ [ [1.0, 1.0, 1.0], 1 ], [ [1, 1, 1], 1 ], [ [1, 1, 1], 1 ], [ [1, 1, 1], 2 ], [ [1, 1, 1], 1 ] ];

		for ( i = 0; i < parameters.length; i ++ ) {

			size  = parameters[i][1];
			color = parameters[i][0];

			materials[i] = new THREE.ParticleBasicMaterial( { size: size } );
			materials[i].color.setHSV( color[0], color[1], color[2] );

			particles = new THREE.ParticleSystem(this._snowGeometry, materials[i] );

			particles.rotation.x = Math.random() * 6;
			particles.rotation.y = Math.random() * 6;
			particles.rotation.z = Math.random() * 6;

			this.scene.add( particles );

		}
	},

	setCameraPos: function(x, y) {
		this._aX = x || this._aX || 0;
		this._aY = y || this._aY || 0;
		var sX = Math.sin(this._aX + Math.PI),
			cX = Math.cos(this._aX + Math.PI),
			sY = Math.sin(this._aY),
			cY = Math.cos(this._aY),
			z = this.lookPosition.z + this._radius * sY;
		if(z < 1) z = 1;

		this.camera.position.set(this.lookPosition.x + this._radius * sX * cY, this.lookPosition.y + this._radius * cX * cY, z);

		this.camera.lookAt(this.lookPosition);
	},

	updateSceneSize: function() {
		this._wrap.style.display = 'none';
		var h = window.innerHeight,
			w = window.innerWidth;
		if(!this._fullScreen){
			// aspect ratio
			if(w / this.AspectRation[0] > h / this.AspectRation[1]) {
				w = Math.round(h / this.AspectRation[1] * this.AspectRation[0]);
				h = Math.round(w / this.AspectRation[0] * this.AspectRation[1]);
			} else {
				h = Math.round(w / this.AspectRation[0] * this.AspectRation[1]);
				w = Math.round(h / this.AspectRation[1] * this.AspectRation[0]);
			}

			// max width
			if(w > this.MaxWidth) {
				w = this.MaxWidth;
				h = Math.round(w / this.AspectRation[0] * this.AspectRation[1]);
			}
		}

		this._w = w;
		this._h = h;
		//this._scale = w / this.MaxWidth;
		//console.log('scene scale', this._scale);
		//console.log('screen size', w, h);
		this._wrap.style.left = Math.round((document.width - w) / 2) + 'px';
		this._wrap.style.top = Math.round((document.height - h) / 2) + 'px';
		this._wrap.style.width = w + 'px';
		this._wrap.style.height = h + 'px';
		this._wrap.style.display = 'block';

		this.renderer.setSize(w, h);
		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();
	},

	clearBullets: function(){
		for(var i = 0, l = this._bullets.length; i < l; i++){
			if (this._bullets[i]._destroy !== undefined){
				this._bullets.splice(i, 1);
				this.clearBullets();
				break;
			}
		}
	},

	utils: {
		getModel: function(url, texturePath, callback){
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = ready;  
	        function ready() {
				if(xhr.readyState < 4) {
					return;
				}
				if(xhr.status !== 200) {
					return;
				}
				// all is well  
				if(xhr.readyState === 4) {
					var data = bood._loader.createModel(JSON.parse(xhr.response), texturePath);
					callback(new THREE.Mesh(data[0], new THREE.MeshFaceMaterial(data[1])));
				}
			}
			xhr.open('GET', url, true);
			xhr.send('');
		}
	}
};