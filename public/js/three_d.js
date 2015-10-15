var myChara;
var otherCharasArr = [];

var socket;
var moveLeft = false;
var moveRight = false;
var moveForward = false;
var moveBackward = false;
var moveUp = false;
var moveDown = false;
//var cameraMoveLeft = false;
//var cameraMoveRight = false;
//var cameraMoveForward = false;
//var cameraMoveBackward = false;
//var cameraMoveUp = false;
//var cameraMoveDown = false;

function KeyDown3d(e) {
	switch (e.keyCode) {
	case 37: // ←キー
		moveLeft = true;
		break;
	case 39: // →キー
		moveRight = true;
		break;
	case 38: // ↑キー
		moveForward = true;
		break;
	case 40: // ↓キー
		moveBackward = true;
		break;
	case 84: // Tキー
		moveUp = true;
		break;
	case 71: // gキー
		moveDown = true;
		break;
	//--------------------------
	case 65: // Aキー
			moveLeft = true;
		break;
	case 68: // Dキー
			moveRight = true;
		break;
	case 87: // Wキー
			moveForward = true;
		break;
	case 83: // Sキー
			moveBackward = true;
		break;
	case 69: // Eキー
			moveUp = true;
		break;
	case 81: // Qキー
			moveDown = true;
		break;
	//--------------------------
	}
}
function KeyUp3d(e) {
	switch (e.keyCode) {
	case 37: // ←キー
		moveLeft = false;
		break;
	case 39: // →キー
		moveRight = false;
		break;
	case 38: // ↑キー
		moveForward = false;
		break;
	case 40: // ↓キー
		moveBackward = false;
		break;
	case 84: // Tキー
		moveUp = false;
		break;
	case 71: // Gキー
		moveDown = false;
		break;
		//--------------------------camera
	case 65: // Aキー
			moveLeft = false;
		break;
	case 68: // Dキー
			moveRight = false;
		break;
	case 87: // Wキー
			moveForward = false;
		break;
	case 83: // Sキー
			moveBackward = false;
		break;
	case 69: // Eキー
			moveUp = false;
		break;
	case 81: // Qキー
			moveDown = false;
		break;
		//--------------------------camera
		case 66: // Bキー
			if ( myChara.mediaStreamMode != 'audio') {
				audioModeOn();
			}
			break;
		case 86: // Vキー
			if(myChara.mediaStreamMode != 'video') {
				console.log('video?');
				videoModeOn();
			}
			break;
		case 77: // Mキー
			mediaStreamOff();
		break;
	}
}


//var keyboard = new THREEx.KeyboardState();

$(document).ready(function(){

	var main = function () {
		function onWindowResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize( window.innerWidth, window.innerHeight );
		}


		window.addEventListener( 'resize', onWindowResize, false );
		var scene = new THREE.Scene();
//		//軸の表示（長さ：1000）
//		var  axis = new THREE.AxisHelper(1000);
//		//sceneに追加
//		scene.add(axis);
//		// 位置設定
//		axis.position.set(0,0,1);
		
		socket = io.connect();
		console.log('connectしました。');
		window.addEventListener('keydown', KeyDown3d, true); //キーを押した時、呼び出される関数を指定
		window.addEventListener('keyup', KeyUp3d, true); //キーを離した時、呼び出される関数を指定


		//-------------------------------------------socket.io---//
		socket.on('connect', function() {
			socket.on('emit_fron_server_sendCharasArr', function(data){//dataは{iconsArr:[], numOgIcon: io.sockets.sockets.length}
				console.log("入りましたよ！！");
				console.log(data);
				data.charasArr.forEach(function(chara) {//dataはobject{charasArr ,numOfIcon}
					console.log("きてるね〜");
					if (!chara.socketId) return;
	//				otherCharasArr.push(MyChara.fromObject( chara, chara.PosX, chara.PosY, chara.PosZ ));
					var othreChara = new Chara();
					othreChara.socketId = chara.socketId;
					othreChara.Pos = chara.Pos;
					othreChara.textureImg = chara.textureImg;
					othreChara.peerId = chara.peerId;
					othreChara.mediaStreamMode = chara.mediaStreamMode;
					otherCharasArr.push(othreChara);
				});
				$('#testDiv').html('現在の人数：' + data.numOfIcon);
				if(otherCharasArr.length != 0) {
					otherCharasArr.forEach(function(chara, i, otherCharasArr) {
						createMesh(otherCharasArr[i]);//otherCharasArr[0]はmyIcon
						scene.add(otherCharasArr[i].mesh);
					});
				}
			});

			// クラス生成
	//		myChara.socketId = socket.id;
			//voiceChat.jsに記述
			//socket.emit('join', myIcon);

			socket.on('join', function(data) {
	//			otherCharasArr.push(myChara.fromObject( data.icon, data.icon.PosX, data.icon.PosY, data.icon.PosZ ));
				console.log(data.chara);

				var othreChara = new Chara();
				othreChara.socketId = data.chara.socketId;
				othreChara.Pos = data.chara.Pos;
				othreChara.textureImg = data.chara.textureImg;
				othreChara.peerId = data.chara.peerId;
				othreChara.mediaStreamMode = data.chara.mediaStreamMode;
				othreChara.videoBroadcastReady = data.chara.videoBroadcastReady;
				createMesh(othreChara);
				otherCharasArr.push(othreChara);
				console.log(othreChara.mediaStreamMode);
				scene.add(othreChara.mesh);

				console.log(otherCharasArr);
	//			debugger;
				$('#testDiv').html('現在の人数：' + data.numOfIcon);
			});


			socket.on('charaRemove', function(data){
				otherCharasArr.forEach(function(chara, i, otherCharasArr) {
					if(chara.socketId == data.socketId) otherCharasArr.splice(i, 1);
					console.log(otherCharasArr[i]);
					scene.remove( chara.mesh );
					scene.remove( chara.voiceBallMesh );
	//				geometry.dispose();
	//				material.dispose();
	//				texture.dispose();
				});
				$('#testDiv').html('現在の人数：' + data.numOfChara);
			});

			socket.on('sendMsg', function(data) {
				otherCharasArr.forEach(function(icon, i, icons) {
					if(icon.socketId == data.socketId) {
						console.log('きてます');
						otherCharasArr[i].str = data.str;
						otherCharasArr[i].chatShowCount = data.chatShowCount;
					}
				});
			});
		});//----------end----------socket.on('connect'

	

		$('#sendMsgBtn').on("click",function(){
			myChara.SendChat();
			socket.emit('sendMsg', {str: myChara.str, chatShowCount: myChara.chatShowCount});
		});


		function createMesh(charaX) {//charaXはcharaインスタンス
			var texture  = new THREE.ImageUtils.loadTexture(charaX.textureImg);
			//球体を表示する部分
			charaX.mesh = new THREE.Mesh(
//				new THREE.SphereGeometry(30, 100, 100),//球のジオメトリ　（半径：２０）
				new THREE.TorusKnotGeometry(16, 8, 128, 32, 2, 3),
				new THREE.MeshPhongMaterial({
					map: texture
				}));
			charaX.mesh.castShadow = true;//影の設定
			charaX.mesh.receiveShadow = true;//影の設定
//			charaX.mesh.position.set(-100, 0, 0);// 位置設定
			charaX.mesh.position.set(
				charaX.Pos[0],
				charaX.Pos[1],
				charaX.Pos[2]
			);// 位置設定
			//sceneに追加
			
			charaX.voiceBallMeshSize = 140;
			charaX.voiceBallMeshScale = 0.01;
			charaX.voiceBallMesh = new THREE.Mesh(
				new THREE.SphereGeometry(charaX.voiceBallMeshSize, 100, 100),
				new THREE.MeshPhongMaterial({
					//				map: texture
					color: 0xffff00,
					transparent: true,
					opacity: 0.4
				})
			);
			charaX.voiceBallMesh.castShadow = true;//影の設定
			charaX.voiceBallMesh.receiveShadow = true;//影の設定
//			charaX.voiceBallMesh.position.set(0, 0, -300);// 位置設定
			charaX.voiceBallMesh.position.set(
				charaX.Pos[0],
				charaX.Pos[1],
				charaX.Pos[2]
			);// 位置設定
			scene.add(charaX.voiceBallMesh);
			charaX.voiceBallMesh.scale.set(
				charaX.voiceBallMeshScale,
				charaX.voiceBallMeshScale,
				charaX.voiceBallMeshScale
			);
			console.log(charaX.voiceBallMesh.material.color);

		}

//	var main = function () {
//		var scene = new THREE.Scene();

//		myIcon = new MyIcon(); // クラス
		myChara = new Chara(); // クラス
		myChara.socketId = socket.id;
		//		myIcon.Init( 0, 0, -300, './img/IMG_2706.jpg' ); //初期化メソッド実行(初期の位置を引数に渡してcanvas要素中央に配置)//
//		myIcon.InitPos( 0, 0, -300 );
		Math.floor(Math.random() * 1000) - 500;
		myChara.InitPos( Math.floor(Math.random() * 500) - 250, 0, Math.floor(Math.random() * 200)  );
//		myChara.InitPos( 0, 0, -300 );
//		myChara.textureImg = './img/IMG_2706.jpg';
		myChara.textureImg = './img/IMG_2706.jpg';
//		mkSphere(myIcon);
		createMesh(myChara);
		console.log(myChara);
//		scene.add(myIcon.mesh);
		scene.add(myChara.mesh);
		


//--------------------------------------------------------------camera
//		var width = 1280;
//		var height = 640;
		var width = window.innerWidth;
		var height = window.innerHeight;
		var fov = 40;
		var aspect = width / height;
//		$(window).resize(function() {
//			width = window.innerWidth;
//			height = window.innerHeight;
//			aspect = width / height;
//		});
		//		window.onresize = function() {
//			width = window.innerWidth;
//			height = window.innerHeight;
//			aspect = width / height;
//		};
		var near = 1;
		var far = 20000;
		var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
//		camera.Pos = [0,0,0];
//		camera.moveSpeed = 4;
		camera.position.set(0, 60, 500);
//		camera.position.set(camera.Pos[0], camera.Pos[1], camera.Pos[2]);
		console.log(camera);
//		function cameraMove(cameraMoveRight,cameraMoveLeft,cameraMoveUp,cameraMoveDown,cameraMoveForward,cameraMoveBackward) {
//			if(cameraMoveRight) {// 右キーが押された
//				camera.Pos[0] -= camera.moveSpeed;
//			}
//			else if(cameraMoveLeft) {// 左キーが押された
//				camera.Pos[0] += camera.moveSpeed;
//				console.log(camera.Pos);
//			}
//			if(cameraMoveUp) {// 上キーが押された
//				camera.Pos[1] += camera.moveSpeed;
//			}
//			else if(cameraMoveDown) {// 下キーが押された
//				camera.Pos[1] -= camera.moveSpeed;
//			}
//			if(cameraMoveForward) {// 上キーが押された
//				camera.Pos[2] -= camera.moveSpeed;
//			}
//			else if(cameraMoveBackward) {// 下キーが押された
//				camera.Pos[2] += camera.moveSpeed;
//			}
//		}
//-------------------------------------------------------------camera end

		var renderer = new THREE.WebGLRenderer();
		renderer.setSize(width, height);
//		renderer.shadowMapEnabled = true; //影をつける
		renderer.shadowMap.enabled = true; //影をつける
		document.body.appendChild(renderer.domElement);

		var controls = new THREE.OrbitControls(camera, renderer.domElement);

//		var directionalLight = new THREE.DirectionalLight(0xffffff);
		var directionalLight = new THREE.DirectionalLight(0xeeeeee);
		directionalLight.position.set(0, 0.8, 0.7);
		directionalLight.castShadow = true;
		scene.add(directionalLight);
		
		var ambientLight = new THREE.AmbientLight(0x444444);
		scene.add( ambientLight );

//		var geometry = new THREE.CubeGeometry(30, 30, 30);
		var geometry = new THREE.OctahedronGeometry(80);
		var material = new THREE.MeshPhongMaterial({
			color: 0x3377ff,
			transparent: true,
			opacity: 0.9
		});
//		var textureMesh  = new THREE.ImageUtils.loadTexture('./img/son.png');

//		var mesh = new THREE.Mesh(geometry, material);
//		var octahedronMesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
//			map: textureMesh
//		}));
		var octahedronMesh = new THREE.Mesh(geometry, material);
		octahedronMesh.position.x = 0;
		octahedronMesh.position.y = 160;
		octahedronMesh.position.z = -400;

		octahedronMesh.castShadow = true;
		octahedronMesh.receiveShadow = true;
		scene.add(octahedronMesh);

		var geometry2 = new THREE.CubeGeometry(20, 20, 20);
//		var material2 = new THREE.MeshPhongMaterial({
//			color: 0x00ffdd
//		});
		var textureMesh2  = new THREE.ImageUtils.loadTexture('./img/circleParis.png');
//		var mesh2 = new THREE.Mesh(geometry2, material2);
		var mesh2 = new THREE.Mesh(geometry2, new THREE.MeshPhongMaterial({
			map: textureMesh2
		}));
		mesh2.position.x = 100;
		mesh2.position.y = -100;
		mesh2.position.z = -150;
		mesh2.castShadow = true;
		mesh2.receiveShadow = true;
		scene.add(mesh2);


		var groundGeometry = new THREE.PlaneGeometry(1000, 1000);
		//平面オブジェクトの色を設定します。
		material3 = new THREE.MeshPhongMaterial({
			color: 0xccccFF
		});
		var texture1  = new THREE.ImageUtils.loadTexture('./img/IMG_2706.jpg');
//		var ground = new THREE.Mesh(groundGeometry, material3);
		var ground = new THREE.Mesh(groundGeometry, new THREE.MeshPhongMaterial({
			map: texture1,
			side: THREE.DoubleSide
		}));
		//続いて、平面オブジェクトの位置を調整します。
		ground.rotation.x = 4.7;
		ground.position.y = -200;
		ground.position.z = -500;
		ground.receiveShadow = true;
		//視覚効果を作る
		scene.add(ground);
		
		
//		// 形状データを作成
//		var geometry4 = new THREE.Geometry();
//		var numParticles = 200000;
//		for(var i = 0 ; i < numParticles ; i++) {
//			geometry4.vertices.push(new THREE.Vector3(
//				Math.random() * 2000 - 1000,
//				Math.random() * 2000 - 1000,
//				Math.random() * 2000 - 1000));
//		}
//		// マテリアルを作成
//		var texture4 =THREE.ImageUtils.loadTexture('./img/particle1.png');
//		var material4 = new THREE.ParticleBasicMaterial({
//			size: 10, color: 0xff8888, blending: THREE.AdditiveBlending,
//			transparent: true, depthTest: false, map: texture4, fog: true });
//		scene.fog = new THREE.FogExp2(0x0000ff, 0.00035);
//
//		// 物体を作成
//		var mesh4 = new THREE.ParticleSystem(geometry4, material4);
//		mesh4.position = new THREE.Vector3(0, 0, -1200);
//		mesh4.sortParticles = false;
//		scene.add(mesh4);
		

		//myCharaの位置が変わったかどうかを確認する為の変数
		var Pos = [];
		//myCharaの位置が変わったかどうかを確認する為の変数
//		var cameraPos = [];
		
		var countFrames = 0;
		var capacityOfVoiceChat = 3;

		function positionChange() {
			if (myChara) {
				if (myChara.Pos[0] != Pos[0] || myChara.Pos[1] != Pos[1] || myChara.Pos[2] != Pos[2]) {
					socket.emit('charaPosChanged', myChara.Pos);
				}
			}
		}


		renderer.render(scene, camera);

		
//		ボイスエフェクト確認コード
//		$('body').on('click', function() {
//			myChara.voiceBallMeshScale = 1;
//		});
		
		//mediaStreamModeを変更
		socket.on('modeChange', function (data) {//{ socketId: socket.id, mediaStreamMode: mediaStreamMode}
			console.log(data);
			otherCharasArr.forEach(function (chara, i, otherCharasArr) {
				if (chara.socketId == data.socketId) {
					otherCharasArr[i].mediaStreamMode = data.mediaStreamMode;
					console.log(otherCharasArr[i].mediaStreamMode);
				}
			});
		});
		
		

		
			
			


		
		
		function update() {
			//-----------------------------------音声ビジュアルエフェクト
			function voicePickUpFx(){
				//符号なし8bitArrayを生成
				var data = new Uint8Array(analyser.frequencyBinCount);
				//周波数データ
				analyser.getByteFrequencyData(data);
				var volume = false;
				for (var i = 0; i < data.length; ++i) {
					//上部の描画
					//			context2.fillRect(i*5, 0, 5, data[i]*2);
					//下部の描画
					//			context2.fillRect(i*5, h, 5, -data[i]*2);
					//console.log( data[i] > 100 );
					if (data[i] > 200) {
						volume = true;
					}
				}
				if (volume) {
					if (myChara && myChara.mediaStreamMode == 'audio') {
						//					myChara.countVoice = 100;
						myChara.voiceBallMeshScale = 1;
						socket.emit('voicePU', myChara.voiceBallMeshScale);
					}
				}
			}
			voicePickUpFx();

			//-----------------------------------音声ビジュアルエフェクト
			
			
			if (myChara/* && countFrames % 2 == 0*/) {
				Pos[0] = myChara.Pos[0];
				Pos[1] = myChara.Pos[1];
				Pos[2] = myChara.Pos[2];
			}
//			if(camera){
//				camera.position.set(camera.Pos[0], camera.Pos[1], camera.Pos[2]);
//			}
			
//			if (camera) {
//				cameraPos[0] = camera.Pos[0];
//				cameraPos[1] = camera.Pos[1];
//				cameraPos[2] = camera.Pos[2];
//			}

			controls.update();//orbitcontrolのメソッド

			octahedronMesh.rotation.set(
				octahedronMesh.rotation.x + 0,
				octahedronMesh.rotation.y + 0.01,
				octahedronMesh.rotation.z + 0
			);
			mesh2.rotation.set(
				0,
				mesh2.rotation.y + 0.01,
				mesh2.rotation.z + 0.01
			);
			myChara.voiceBallMesh.scale.set(
				myChara.voiceBallMeshScale,
				myChara.voiceBallMeshScale,
				myChara.voiceBallMeshScale
			);
			myChara.Move(
				moveLeft,
				moveRight,
				moveUp,
				moveDown,
				moveForward,
				moveBackward
			);
			
			if(myChara.mediaStreamMode == 'audio' && myChara.mesh.geometry.type != "SphereGeometry") {
				myChara.mesh.geometry = new THREE.SphereGeometry(30, 100, 100);
			}else if (myChara.mediaStreamMode == 'video' && myChara.mesh.geometry.type != "BoxGeometry") {
				myChara.mesh.geometry = new THREE.CubeGeometry(40, 40, 40);//球のジオメトリ　（半径：２０）
			} else if (myChara.mediaStreamMode == false && myChara.mesh.geometry.type != "TorusKnotGeometry") {
				myChara.mesh.geometry = new THREE.TorusKnotGeometry(20, 10, 128, 32, 2, 3);
//				charaX.mesh = new THREE.Mesh(
//					//				new THREE.SphereGeometry(30, 100, 100),//球のジオメトリ　（半径：２０）
//					new THREE.TorusKnotGeometry(30, 20, 128, 32, 2, 3),
//					new THREE.MeshPhongMaterial({
//						map: texture
//					}));
//				myChara.mesh.geometry = new THREE.ParametricGeometry(function(u, v){
//					u = (u - 0.5) * 2 * Math.PI; v = (v - 0.5) * 2 * Math.PI;
//					return new THREE.Vector3(
//						2 * Math.sin(3 * u) / (2 + Math.cos(v)) * 0.25,
//						2 * (Math.sin(u) + 2 * Math.sin(2 * u)) /
//						(2 + Math.cos(v + 2 * Math.PI / 3)) * 0.18,
//						(Math.cos(u) - 2 * Math.cos(2 * u)) * (2 + Math.cos(v)) *
//						(2 + Math.cos(v + 2 * Math.PI / 3)) / 4 * 0.25);
//				}, 64, 64, true);
			}
			
			
			myChara.mesh.position.set(
				myChara.Pos[0],
				myChara.Pos[1],
				myChara.Pos[2]
			);
			if(myChara.mesh.geometry.type == "SphereGeometry") {
				myChara.mesh.rotation.set(
					myChara.mesh.rotation.x + 0.0,
					myChara.mesh.rotation.y + 0.02,
					myChara.mesh.rotation.z + 0.0
				);
			} else {
				myChara.mesh.rotation.set(
					myChara.mesh.rotation.x + 0.01,
					myChara.mesh.rotation.y + 0.01,
					myChara.mesh.rotation.z + 0.01
				);
			}

			
			myChara.voiceBallMesh.position.set(
				myChara.Pos[0],
				myChara.Pos[1],
				myChara.Pos[2]
			);
			//myCharaの位置が変化していたら
			positionChange();
			
			//otherChara-------------------
			if(otherCharasArr.length != 0) {
				otherCharasArr.forEach(function (chara, i, otherCharasArr) {
					if(chara.mediaStreamMode == 'audio' && chara.mesh.geometry.type != "SphereGeometry") {
						chara.mesh.geometry = new THREE.SphereGeometry(30, 100, 100);
					}else if (chara.mediaStreamMode == 'video' && chara.mesh.geometry.type != "BoxGeometry") {
						chara.mesh.geometry = new THREE.CubeGeometry(40, 40, 40);//球のジオメトリ　（半径：２０）
					} else if (chara.mediaStreamMode == false && chara.mesh.geometry.type != "TorusKnotGeometry") {
						chara.mesh.geometry = new THREE.TorusKnotGeometry(20, 10, 128, 32, 2, 3);
					}
						//					icon.endDrag();
					//				icon.Draw(context,0,0); //myIconオブジェクトの描画メソッド呼出(CanvasRenderingContext2Dオブジェクト,イメージオブジェクト,0,0)
					chara.DrawChat(); //myIconオブジェクトの描画メソッド呼出(CanvasRenderingContext2Dオブジェクト,str)
					if (chara.voiceBallMeshScale > 0.1) {
						//						context.globalAlpha = icon.countVoice * 3 / 1000;
						//					console.log(icon.talkingNodesSocketIds.length);
						if (chara.talkingNodesSocketIds.length > 0) {
							otherCharasArr[i].voiceBallMesh.material.color.r = 0;
						} else {
							otherCharasArr[i].voiceBallMesh.material.color.r = 1;
						}
						otherCharasArr[i].voiceBallMeshScale -= 0.01;
					}
//				});
//			}
//			if(otherCharasArr.length != 0) {
//				otherCharasArr.forEach(function(chara, i, otherCharasArr) {
					otherCharasArr[i].mesh.rotation.set(
						otherCharasArr[i].mesh.rotation.x + 0.003,
						otherCharasArr[i].mesh.rotation.y + 0.002,
						otherCharasArr[i].mesh.rotation.z + 0.004
					);
					otherCharasArr[i].mesh.position.set(
						otherCharasArr[i].Pos[0],
						otherCharasArr[i].Pos[1],
						otherCharasArr[i].Pos[2]
					);
					otherCharasArr[i].voiceBallMesh.position.set(
						otherCharasArr[i].Pos[0],
						otherCharasArr[i].Pos[1],
						otherCharasArr[i].Pos[2]
					);
					otherCharasArr[i].voiceBallMesh.scale.set(
						otherCharasArr[i].voiceBallMeshScale,
						otherCharasArr[i].voiceBallMeshScale,
						otherCharasArr[i].voiceBallMeshScale
					);
				});
			}

			
			
			
//			var delta = clock.getDelta(); // seconds.
//			var moveDistance = 100 * delta; // 100 pixels per second
//			var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second
//			console.log(rotateAngle);
//			//			console.log(camera);
//			// rotate left/right/up/down
//			camera.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);

//			if ( keyboard.pressed("A") ) {
//				camera.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
//				alert();
//			}
//			if ( keyboard.pressed("D") )
//				camera.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
		}

//		var clock = new THREE.Clock();


		socket.on('peerCallConnected', function (data) {
			console.log('peerCallConnectedきた〜〜〜〜〜〜〜〜〜〜');
			otherCharasArr.forEach(function (icon, i, icons) {
				if (icon.socketId == data.socketId) {
					if (!otherCharasArr[i].talkingNodesSocketIds.length) {
						otherCharasArr[i].talkingNodesSocketIds.push(data.talkingNodesSocketId);
					} else {
						otherCharasArr[i].talkingNodesSocketIds.forEach(function (id) {
							if (id != data.socketId) return;
							otherCharasArr[i].talkingNodesSocketIds.push(data.talkingNodesSocketId);
						});
					}
				}
			});
		});
		
		socket.on('voicePU', function (data) {
			otherCharasArr.forEach(function (chara, i, otherCharasArr) {
				if (chara.socketId == data.socketId) {
					otherCharasArr[i].voiceBallMeshScale = data.voiceBallMeshScale;
				}
			});
		});
		socket.on('videoBroadcastReady_Update', function (data) {
			otherCharasArr.forEach(function (chara, i, otherCharasArr) {
				if (chara.socketId == data.socketId) {
					otherCharasArr[i].videoBroadcastReady = data.videoBroadcastReady;
				}
			});
		});
		
		socket.on('peerCallDisconnected', function (data) {
			otherCharasArr.forEach(function (icon, i, icons) {
				if (icon.socketId == data.socketId) {
					if (otherCharasArr[i].talkingNodesSocketIds.length) {
						otherCharasArr[i].talkingNodesSocketIds.forEach(function (id, j, arr) {
							if (id == data.talkingNodesSocketId) {
								arr.splice(j, 1);
							}
						});
					}
				}
			});
		});
		
		socket.on('myCharaUpdate', function(data) {
			console.log(data);
			otherCharasArr.forEach(function(chara, i, otherCharasArr) {
				if (chara.socketId == data.socketId ) {
//					otherCharasArr[i] = MyIcon.fromObject( data, data.PosX, data.PosY );
					otherCharasArr[i] = Chara.fromObject( data );
				}
			});
		});
		
		socket.on('isVideoChatting_Update', function (data) {
			otherCharasArr.forEach(function(chara, i, otherCharasArr) {
				if (chara.socketId == data.socketId ) {
					otherCharasArr[i].isVideoChatting = data.isVideoChatting;
				}
			});
		});
		socket.on('videoBroadcastReady_Update', function (data) {
			otherCharasArr.forEach(function(chara, i, otherCharasArr) {
				if (chara.socketId == data.socketId ) {
					otherCharasArr[i].videoBroadcastReady = data.videoBroadcastReady;
				}
			});
		});
		
		function printProperties(obj) {
			var properties = '';
			for (var prop in obj){
				if(obj[prop] == )
				properties += prop + "=" + obj[prop] + "\n";
			}
//			alert(properties);
			return properties;
		}

		(function renderLoop() {
			requestAnimationFrame(renderLoop);
			countFrames++;
			update();
			
			(function(){
				$('#testDiv5').html('myChara.mediaStreamMode : ' + myChara.mediaStreamMode + ' , myChara.videoBroadcastReady : ' + myChara.videoBroadcastReady);
				if(otherCharasArr.length > 0){
					var $test = $('<div></div>');
					otherCharasArr.forEach(function(chara,i,otherCharasArr) {
						$test.append($('<div></div>').html(i + ':' + chara.mediaStreamMode + ' , cahra.videoBroadcastReady : ' + chara.videoBroadcastReady));
//						$test.append($('<div></div>').html(printProperties(chara)));
//						console.log(printProperties(chara));
					});
					$('#testDiv7').html($test);
					
				}
//				$('#testDiv6').html('otherCharasArr[0].mediaStreamMode' + otherCharasArr[0].mediaStreamMode);
//				$('#testDiv7').html('otherCharasArr[1].mediaStreamMode' + otherCharasArr[1].mediaStreamMode);
//				var testArr = otherCharasArr.map(function(e) {
//					return e.mediaStreamMode;
//				});
//				$('#testDiv8').html(testArr);
			})();

			function callAndAddEvent(icon) {
				var call = peer.call(icon.peerId, myStream);
				call.on('close', function () { //callが終了した際のイベントを設定
					$('video').each(function (i, element) { //videoタグをサーチ
						if ($(element).attr("data-peer") == call.peer) { //もしこのタグのdata-peer属性値とpeerが同じなら
							$(element).remove(); //タグを左k女
							console.log('削除！');
						}
					});
				});
				myChara.talkingNodes.push({
					socketId: icon.socketId,
					call: call
				});
				socket.emit('peerCallConnected', icon.socketId);
			}
			function videoCallAndAddEvent(icon) {
				var call = peer.call(icon.peerId, myStream);
				call.on('close', function () { //callが終了した際のイベントを設定
					$('video').each(function (i, element) { //videoタグをサーチ
						if ($(element).attr("data-peer") == call.peer) { //もしこのタグのdata-peer属性値とpeerが同じなら
							$(element).remove();
							console.log('削除！');
							function modalOff() {
								$('#modal_content').removeClass('active');
								setTimeout(function() {
									$('#modal_base').removeClass('active');
									$('#modal_base').delay(800).fadeOut('slow', function() {
										$('#modal_overlay').fadeOut("slow").remove();
										myChara.isVideoChatting = false;
										isModalActive = false;
										//				$('#modal_base').removeClass('active');
									});
								},1000);
							}
							modalOff();
						}
					});
				});
				myChara.videoChatCall = call;
			}
			function videoSendAndAddEvent(icon) {
				console.log('videoSend');
				var call = peer.call(icon.peerId, myStream);
//				function modalOn() {
//					$('body').append('<div id="modal_overlay"><div>');
//					$('#modal_overlay').delay(1000).fadeIn("slow");
//					$('#modal_base').show(function() {
//						$('#modal_base').addClass('active');
//					});
//					//		$('#modal_content').delay(1000).fadeIn("slow");
//					isModalActive = true;
//				}
				modalOn();
				//		$('div#videoElems').prepend($('<video></video>', {
				$('#modal_content').prepend($('<video></video>', {
					'class': 'videoWindow videoChatting',
//					'data-peer': mediaConnection.peer,//mediaConnection.peerを持たせる
					'data-peer': call.peer,//mediaConnection.peerを持たせる
					src: URL.createObjectURL(myStream),//自分のstreamを流す
					autoplay: true
				}));
				$('#modal_content').addClass('active');

				call.on('close', function () { //callが終了した際のイベントを設定
					console.log('close!!!!!!!!!!!!!!!!!!');
					$('video').each(function (i, element) { //videoタグをサーチ
						if ($(element).attr("data-peer") == call.peer) { //もしこのタグのdata-peer属性値とpeerが同じなら
							$(element).remove();
							console.log('削除！');
							modalOff();
						}
					});
				});
				myChara.videoChatCall = call;
			}
			function modalOff() {
				$('#modal_content').removeClass('active');
				setTimeout(function() {
					$('#modal_base').removeClass('active');
					$('#modal_base').delay(800).fadeOut('slow', function() {
						$('#modal_overlay').fadeOut("slow").remove();
						myChara.isVideoChatting = false;
						isModalActive = false;
						//				$('#modal_base').removeClass('active');
					});
				},1000);
			}



//------------------------------------------------------------media接続判定
			if (countFrames % 30 == 0) { //30フレーム毎に実行
				$('#testDiv2').html('myChara.talkingNodes.length : ' + myChara.talkingNodes.length);
				$('#testDiv3').html('myChara.socketId : ' + myChara.socketId);
				if (myChara.talkingNodes.length) {
					$('#testDiv4').html('myChara.talkingNodes[0].socketId : ' + myChara.talkingNodes[0].socketId);
				} else {
					$('#testDiv4').html('myChara.talkingNodes[0].socketId : ');
				}
				
				if (myChara && peer && myStream) {
					if (otherCharasArr.length > 0) {//誰か相手がいれば
						otherCharasArr.forEach(function (icon, i, icons) {
							if (icon.peerId) {
								var diffX = icon.Pos[0] - myChara.Pos[0];
								var diffY = icon.Pos[1] - myChara.Pos[1];
								var diffZ = icon.Pos[2] - myChara.Pos[2];
								if (myChara.mediaStreamMode == 'audio') {//自分がaudioModeの場合
									var talkAbleDistance = 140;
									if ((diffX * diffX) + (diffY * diffY) + (diffZ * diffZ ) < talkAbleDistance * talkAbleDistance) { //一定距離以内なら
										if (icon.talkingNodesSocketIds.length < capacityOfVoiceChat) { //iconが話せる
											if (myChara.talkingNodes.length < capacityOfVoiceChat) { //myIconが話せる
												if (myChara.talkingNodes.length) { //myIcon誰かと話してたら
													myChara.talkingNodes.forEach(function (talkingNode, i, arr) {
														if (talkingNode.socketId == icon.socketId) { //話しているのがその相手だったら
															return; //何もしない
														} else { //話している人でなければ
															//接続する
															console.log(1111);
															callAndAddEvent(icon); //callしてイベント設置
														}
													});
												} else { //myIconが誰かと話してなければ
													//接続する
													console.log(2222);
													callAndAddEvent(icon); //callしてイベント設置
												}
											}
										} else if (icon.talkingNodesSocketIds.length >= capacityOfVoiceChat) { //iconが話せない場合
											if (myChara.talkingNodes.length < capacityOfVoiceChat) { //myIconが話せる場合
												if (icon.talkingNodesSocketIds == myChara.socketId) {
													console.log('相手は話せます');
													//接続する
													console.log(3333);
													callAndAddEvent(icon); //callしてイベント設置
												} else {
													console.log('相手は話せません');
												}
											}
										}
									} else { //一定距離以外なら
										if (myChara.talkingNodes.length != 0) {
											myChara.talkingNodes.forEach(function (talkingNode, i, arr) {
												if (talkingNode.socketId == icon.socketId) { //切断する
													talkingNode.call.close();
													arr.splice(i, 1);
													socket.emit('peerCallDisconnected', icon.socketId);
												}
											});
										}
									}
								} else if (myChara.mediaStreamMode == 'video' && icon.mediaStreamMode == 'video') {//自分も相手もビデオ利用中の場合
									var videoTalkAbleDistance = 40;
									//								if ((diffX * diffX) + (diffY * diffY) < 140 * 140) { //一定距離以内なら
									if ((diffX * diffX) + (diffY * diffY) + (diffZ * diffZ ) < videoTalkAbleDistance * videoTalkAbleDistance) { //一定距離以内なら
										if(!myChara.isVideoChatting && !isModalActive ){//自分がvideoチャット中でない場合
											if (myChara.talkingNodes.length != 0) {//audioで誰かと話してる場合
												myChara.talkingNodes.forEach(function (talkingNode, i, arr) {
													if (talkingNode.socketId == icon.socketId) { //切断する
														talkingNode.call.close();
														arr.splice(i, 1);
														socket.emit('peerCallDisconnected', icon.socketId);
													}
												});
											}
											myChara.isVideoChatting = true;
											videoCallAndAddEvent(icon); //callしてイベント設置
										}
									} else if (!myChara.videoBroadcastReady) { //一定距離以外なら
										if (myChara.isVideoChatting || isModalActive ) {
											myChara.videoChatCall.close();
										}
									}
									//------------------------------------------------ビデオ配信
									if(myChara.videoBroadcastReady == 'readyToSend' && !myChara.isVideoChatting ) {
										if(icon.videoBroadcastReady == 'readyToView' ) {
											videoSendAndAddEvent(icon);//※※※※※※※※※※※※※※※※※※※今は自分からかけているが、配信準備だけしておいて、リクエストがきたらつなぐ仕組みに書き換える方がいいのでは？
											myChara.isVideoChatting = true;
											socket.emit('isVideoChatting_Update', myChara.isVideoChatting);
											myChara.isVideoBroadcasting = 'sending';
											socket.emit('isVideoBroadcasting', myChara.isVideoBroadcasting);
										}
									}
								}
							}
						});
					}
				}/*end of ~~~if (myChara && peer && myStream) {*/
				//video配信、受信モード準備判定
				var diff1X = myChara.Pos[0] - octahedronMesh.position.x;
				var diff1Y = myChara.Pos[1] - octahedronMesh.position.y;
				var diff1Z = myChara.Pos[2] - octahedronMesh.position.z;
				var diff2X = myChara.Pos[0] - mesh2.position.x;
				var diff2Y = myChara.Pos[1] - mesh2.position.y;
				var diff2Z = myChara.Pos[2] - mesh2.position.z;
				if(myChara.mediaStreamMode == 'video'){
					if ((diff1X * diff1X) + (diff1Y * diff1Y) + (diff1Z * diff1Z ) < 40 * 40) {
						//					myChara.isVideoBroadcastingModeReady = 'readyToSend';
						//					myChara.isVideoBroadcasting = 'sending';
						//					socket.emit('isVideoBroadcasting_Update', myChara.isVideoBroadcasting);
						if (myChara.videoBroadcastReady != 'readyToSend') {
							myChara.videoBroadcastReady = 'readyToSend';//video配信準備
							socket.emit('videoBroadcastReady_Update', myChara.videoBroadcastReady);
							console.log(myChara.videoBroadcastReady);
						}
					} else if ((diff2X * diff2X) + (diff2Y * diff2Y) + (diff2Z * diff2Z ) < 40 * 40) {
						if( myChara.videoBroadcastReady != 'readyToView' ) {
							myChara.videoBroadcastReady = 'readyToView';//video受信準備
							socket.emit('videoBroadcastReady_Update', myChara.videoBroadcastReady);
							console.log(myChara.videoBroadcastReady);
						}

					} else {
						if(myChara.videoBroadcastReady != false ) {
							myChara.videoBroadcastReady = false;
							socket.emit('videoBroadcastReady_Update', myChara.videoBroadcastReady);
							console.log(myChara.videoBroadcastReady);
						}
					}
				}
			}//if (countFrames % 30 == 0) { //30フレーム毎に実行
			

			if (myChara) {
				//				myIcon.Draw(context,0,0); //myIconの描画メソッド呼出
				myChara.DrawChat(); //myIconオブジェクトの描画メソッド呼出
				if (myChara.voiceBallMeshScale > 0.1) {
					//					context.globalAlpha = myChara.countVoice * 3 / 1000;
					//					console.log(myChara.talkingNodes.length);
					if (myChara.talkingNodes.length > 0) {
//						context.fillStyle = "#0f0";
						myChara.voiceBallMesh.material.color.r = 0;
						console.log('いる');
					} else {
						myChara.voiceBallMesh.material.color.r = 1;
						console.log('いない');

//						context.fillStyle = "#ff0";
					}
					//					context.beginPath();
					//円の設定（X中心軸,Y中心軸、半径、円のスタート度、円のエンド度、回転）
					//		context.arc(oldX, oldY, Math.sqrt(Math.pow(px, 2) + Math.pow(py, 2)), 0, Math.PI * 2, false); // full circle
					//					context.arc(myChara.PosX, myChara.PosY, 140, 0, Math.PI * 2, false); // full circle
					//					context.fill();
					//					context.globalAlpha = 1;
					myChara.voiceBallMeshScale -= 0.01;
				}
			}
			socket.on('charaPosChanged', function (data) {
				otherCharasArr.forEach(function (chara, i, otherCharasArr) {
					if (chara.socketId == data.socketId) {
						otherCharasArr[i].Pos = data.Pos;
//						otherCharasArr[i].Pos[0] = data.Pos[0];
//						otherCharasArr[i].Pos[1] = data.Pos[1];
//						otherCharasArr[i].Pos[2] = data.Pos[2];
					}
				});
			})
			


			renderer.render(scene, camera);
		})();//----------------------end of (function renderLoop() {--------
	}
	window.addEventListener('DOMContentLoaded', main, false);

});



