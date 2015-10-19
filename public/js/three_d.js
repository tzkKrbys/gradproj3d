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

//アプリ共通ステータス
var appStatus = {};
appStatus.initialMoonTextureImg = './img/moon.jpg';
appStatus.initialOctahedronMeshColor = 0x3377ff;
appStatus.currentMoonTextureImg = './img/moon.jpg';
appStatus.currentOctahedronMeshColor = 0x3377ff;
appStatus.peerIdOfVideoBroadcasting = false;


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
		case 80: // Pキー
//			camera.position.set(0, 80, 500);
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
			socket.on('sendCharasArr', function(data){//dataは{iconsArr:[], numOgIcon: io.sockets.sockets.length}
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
			socket.on('appStatus_Update', function(data) {//サーバーのアプリの状態を反映
				appStatus = data;
			});
			socket.on('currentMoonTextureImg_Update', function(data) {//サーバーのアプリの状態を反映
				appStatus.currentMoonTextureImg = data;
				moon.material = new THREE.MeshPhongMaterial({
					map: new THREE.ImageUtils.loadTexture(appStatus.currentMoonTextureImg),
					bumpMap: new THREE.ImageUtils.loadTexture(appStatus.currentMoonTextureImg),
					bumpScale: 4
				});
			});
			socket.on('currentOctahedronMeshColor_Update', function(data) {//サーバーのアプリの状態を反映
				console.log(data);
				appStatus.currentMoonTextureImg = data;
				octahedronMesh.material = new THREE.MeshPhongMaterial({
					color: data
				});
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
				otherCharasArr.forEach(function(chara, i, otherCharasArr) {
					if(chara.socketId == data.socketId) {
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


		myChara = new Chara(); // クラス
		myChara.socketId = socket.id;
		Math.floor(Math.random() * 1000) - 500;
		myChara.InitPos( Math.floor(Math.random() * 500) - 250, 0, Math.floor(Math.random() * 200)  );
		myChara.textureImg = './img/IMG_2706.jpg';
		createMesh(myChara);
		console.log(myChara);
		scene.add(myChara.mesh);
		


//--------------------------------------------------------------camera
		var width = window.innerWidth;
		var height = window.innerHeight;
		var fov = 40;
		var aspect = width / height;
		var near = 1;
		var far = 40000;
		var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		camera.position.set(0, 80, 500);

//-------------------------------------------------------------camera end

		var renderer = new THREE.WebGLRenderer();
		renderer.setSize(width, height);
		renderer.shadowMap.enabled = true; //影をつける
		document.body.appendChild(renderer.domElement);

		var controls = new THREE.OrbitControls(camera, renderer.domElement);

		var directionalLight = new THREE.DirectionalLight(0xeeeeee);
		directionalLight.position.set(0, 0.8, 0.7);
		directionalLight.castShadow = true;
		scene.add(directionalLight);
		
		var ambientLight = new THREE.AmbientLight(0x333333);
		scene.add( ambientLight );

		var geometry = new THREE.OctahedronGeometry(80);
		var material = new THREE.MeshPhongMaterial({
			color: 0x3377ff/*,
			transparent: true,
			opacity: 0.9*/
		});
//		var textureMesh  = new THREE.ImageUtils.loadTexture('./img/son.png');

//		var mesh = new THREE.Mesh(geometry, material);
//		var octahedronMesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
//			map: textureMesh
//		}));
		var octahedronMesh = new THREE.Mesh(geometry, material);
		octahedronMesh.position.x = 0;
		octahedronMesh.position.y = 150;
		octahedronMesh.position.z = -400;

		octahedronMesh.castShadow = true;
		octahedronMesh.receiveShadow = true;
		scene.add(octahedronMesh);
		
		var octahedronViewMesh = new THREE.Mesh(
			new THREE.OctahedronGeometry(80),
			new THREE.MeshPhongMaterial({
				color: 0xff77aa/*,
			transparent: true,
			opacity: 0.9*/
			})
		);
		octahedronViewMesh.position.x = -300;
		octahedronViewMesh.position.y = 0;
		octahedronViewMesh.position.z = -500;

		octahedronViewMesh.castShadow = true;
		octahedronViewMesh.receiveShadow = true;
		scene.add(octahedronViewMesh);


		var geometry2 = new THREE.CubeGeometry(80, 80, 80);
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

		var moonTexture = new THREE.ImageUtils.loadTexture('./img/moon.jpg');
		var moon = new THREE.Mesh(
			new THREE.SphereGeometry(500, 30, 30),
			new THREE.MeshPhongMaterial({
				map: moonTexture,
				bumpMap:moonTexture,
				bumpScale: 4
//				color: 0xaaeecc
			})
		);
		//----------------------------------月
		moon.Pos = [1400, -300, -3000];
		moon.position.x = moon.Pos[0];
		moon.position.y = moon.Pos[1];
		moon.position.z = moon.Pos[2];
		moon.castShadow = true;
		moon.receiveShadow = true;
		scene.add(moon);
		//----------------------------------木星
		var jupiter = new THREE.Mesh(
			new THREE.SphereGeometry(3000, 30, 30),
			new THREE.MeshPhongMaterial({
				map: new THREE.ImageUtils.loadTexture('./img/jupiter.jpg')
			})
		);
		jupiter.Pos = [-7000, -500, -11000];
		jupiter.position.x = jupiter.Pos[0];
		jupiter.position.y = jupiter.Pos[1];
		jupiter.position.z = jupiter.Pos[2];
		jupiter.castShadow = true;
		jupiter.receiveShadow = true;
		scene.add(jupiter);
		//-----------------------------------地球
		var earthTexture = new THREE.ImageUtils.loadTexture('./img/earth.jpg');
		var earth = new THREE.Mesh(
			new THREE.SphereGeometry(2000, 50, 50),
			new THREE.MeshPhongMaterial({
				map: new THREE.ImageUtils.loadTexture('./img/earth.jpg'),
				bumpMap:earthTexture,
				bumpScale: 8
			})
		);
		earth.Pos = [0, -2200, -400];
		earth.position.x = earth.Pos[0];
		earth.position.y = earth.Pos[1];
		earth.position.z = earth.Pos[2];
		earth.rotation.z = 90;
		console.log(earth.position);
		earth.castShadow = true;
		earth.receiveShadow = true;
		scene.add(earth);

		//-----------------------------------平面
//		var groundGeometry = new THREE.PlaneGeometry(1000, 1000);
//		material3 = new THREE.MeshPhongMaterial({
//			color: 0xccccFF
//		});
//		var texture1  = new THREE.ImageUtils.loadTexture('./img/IMG_2706.jpg');
////		var ground = new THREE.Mesh(groundGeometry, material3);
//		var ground = new THREE.Mesh(groundGeometry, new THREE.MeshPhongMaterial({
//			map: texture1,
//			side: THREE.DoubleSide,
//			bumpMap:moonTexture,
//			bumpScale: 2
//		}));
//		ground.rotation.x = 4.7;
//		ground.position.y = -200;
//		ground.position.z = -500;
//		ground.receiveShadow = true;
//		scene.add(ground);
		
		
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
			moon.rotation.set(
				moon.rotation.x + 0,
				moon.rotation.y + 0.001,
				moon.rotation.z + 0
			);
			jupiter.rotation.set(
				jupiter.rotation.x + 0,
				jupiter.rotation.y + 0.0005,
				jupiter.rotation.z + 0
			);
			jupiter.position.x = Math.sin(new Date().getTime() / 6000 ) * 10000 + earth.Pos[0];
			jupiter.position.y = Math.sin(new Date().getTime() / 6000 ) * 1000 + earth.Pos[1] + 2000;
			jupiter.position.z = Math.cos(new Date().getTime() / 6000 ) * 10000 + earth.Pos[2];
			earth.rotation.set(
				earth.rotation.x + 0.0002,
				earth.rotation.y + 0,
				earth.rotation.z + 0
			);
			mesh2.rotation.set(
				0,
				mesh2.rotation.y + 0.01,
				mesh2.rotation.z + 0.01
			);
			mesh2.position.x = Math.sin(new Date().getTime() / 1000 ) * 800 + moon.Pos[0];
			mesh2.position.y = Math.sin(new Date().getTime() / 1000 ) * 800 + moon.Pos[1];
			mesh2.position.z = Math.cos(new Date().getTime() / 1000 ) * 800 + moon.Pos[2];
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
					myChara.mesh.rotation.x + 0.01,
					myChara.mesh.rotation.y + 0.02,
					myChara.mesh.rotation.z + 0.01
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
		
		socket.on('videoBroadcastReady_Update', function (data) {
			otherCharasArr.forEach(function(chara, i, otherCharasArr) {
				if (chara.socketId == data.socketId ) {
					otherCharasArr[i].videoBroadcastReady = data.videoBroadcastReady;
				}
			});
		});
		
//		socket.on('videoChatCall_Update', function(data) {
//			otherCharasArr.forEach(function(chara, i, otherCharasArr) {
//				if (chara.socketId == data.socketId ) {
//					otherCharasArr[i].videoChatCall = data.videoChatCall;
//				}
//			});
//		});
		
		function printProperties(obj) {
			var properties = '';
			for (var prop in obj){
				var type  = typeof(eval("obj." + prop));
				if(type != 'function') {
					properties += prop + "　=　" + obj[prop] + "\n<br>";
				}
			}
			return properties;
		}

		(function renderLoop() {
			requestAnimationFrame(renderLoop);
			countFrames++;
			update();
			
			if(countFrames % 60 == 0) {
				(function(){
//					$('#testDiv5').html('myChara.mediaStreamMode : ' + myChara.mediaStreamMode + ' , myChara.videoBroadcastReady : ' + myChara.videoBroadcastReady);
					var $test3 = $('<div></div>');
					$test3.html(printProperties(appStatus));
					$('#testDiv5').html($test3);
					
					var $test1 = $('<div></div>');
					$test1.html(printProperties(myChara));
					$('#testDiv6').html($test1);

					if(otherCharasArr.length > 0){
						var $test2 = $('<div></div>');
						otherCharasArr.forEach(function(chara,i,otherCharasArr) {
							$test2.html(printProperties(chara));
						});
						$('#testDiv7').html($test2);
					}

					//				$('#testDiv6').html('otherCharasArr[0].mediaStreamMode' + otherCharasArr[0].mediaStreamMode);
					//				$('#testDiv7').html('otherCharasArr[1].mediaStreamMode' + otherCharasArr[1].mediaStreamMode);
					//				var testArr = otherCharasArr.map(function(e) {
					//					return e.mediaStreamMode;
					//				});
					//				$('#testDiv8').html(testArr);
				})();
			}

			function callAndAddEvent(chara) {
				var call = peer.call(chara.peerId, myStream);
				call.on('close', function () { //callが終了した際のイベントを設定
					$('video').each(function (i, element) { //videoタグをサーチ
						if ($(element).attr("data-peer") == call.peer) { //もしこのタグのdata-peer属性値とpeerが同じなら
							$(element).remove(); //タグを左k女
							console.log('削除！');
						}
					});
				});
				myChara.talkingNodes.push({
					socketId: chara.socketId,
					call: call
				});
				socket.emit('peerCallConnected', chara.socketId);
			}
			
			function videoCallAndAddEvent(chara) {
				console.log('videoCallAndAddEvent関数実行');
				var call = peer.call(chara.peerId, myStream);//第一引数…リモートpeerのブローカーID(リモートpeerのpeer.id)
				console.log('videoCallAndAddEvent');
				console.log(chara.peerId);
				console.log(call);
				myChara.videoChatCall = call;//mediaConnectionクラス。切断する際に必要
				call.on('close', function () { //callが終了した際のイベントを設定
					console.log('削除命令受信！！！');
					$('video').each(function (i, element) { //videoタグをサーチ
						console.log('削除命令通過！！！');
						if ($(element).attr("data-peer") == call.peer) { //もしこのタグのdata-peer属性値とpeerが同じなら
							console.log('削除対象発見！！！' + $(element).attr("data-peer") + ' : ' + call.peer);
							$(element).remove();
							console.log('削除！');
							modalOff();
						}
					});
					$('#modal_content').empty();
				});
//				console.log(myChara.videoChatCall);
//				socket.emit('videoChatCall_Update', true);
			}
			function videoViewRequestAndAddEvent(peerId) {
				console.log(peerId);
				console.log('viewリクエスト実行！！！');
				peer.connect(peerId);

				
//				var call = peer.call(chara.peerId);
//				modalOn();
//				//		$('div#videoElems').prepend($('<video></video>', {
//				$('#modal_content').prepend($('<video></video>', {
//					'class': 'videoWindow videoChatting',
////					'data-peer': mediaConnection.peer,//mediaConnection.peerを持たせる
//					'data-peer': call.peer,//mediaConnection.peerを持たせる
//					src: URL.createObjectURL(myStream),//自分のstreamを流す
//					autoplay: true
//				}));
//				$('#modal_content').addClass('active');
//
//				call.on('close', function () { //callが終了した際のイベントを設定
//					console.log('close!!!!!!!!!!!!!!!!!!');
//					$('video').each(function (i, element) { //videoタグをサーチ
//						if ($(element).attr("data-peer") == call.peer) { //もしこのタグのdata-peer属性値とpeerが同じなら
//							$(element).remove();
//							console.log('削除！');
//						}
//					});
//				});
//				myChara.videoChatCall = call;
			}
			function modalOff() {
				$('#modal_content').removeClass('active');
				setTimeout(function() {
					$('#modal_base').removeClass('active');
					$('#modal_base').delay(800).fadeOut('slow', function() {
						$('#modal_overlay').fadeOut("slow").remove();
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
						otherCharasArr.forEach(function (chara, i, charas) {
							if (chara.peerId) {
								var diffX = chara.Pos[0] - myChara.Pos[0];
								var diffY = chara.Pos[1] - myChara.Pos[1];
								var diffZ = chara.Pos[2] - myChara.Pos[2];
								//------------------------------------------------------------------音声チャット接続部分
								if (myChara.mediaStreamMode == 'audio') {//自分がaudioModeの場合
									if ( chara.mediaStreamMode == 'audio' ) {//相手もaudioModeの場合
										var talkAbleDistance = 140;
										if ((diffX * diffX) + (diffY * diffY) + (diffZ * diffZ ) < talkAbleDistance * talkAbleDistance) { //一定距離以内なら
											if (chara.talkingNodesSocketIds.length < capacityOfVoiceChat) { //charaが話せる
												if (myChara.talkingNodes.length < capacityOfVoiceChat) { //mycharaが話せる
													if (myChara.talkingNodes.length) { //mychara誰かと話してたら
														myChara.talkingNodes.forEach(function (talkingNode, i, arr) {
															if (talkingNode.socketId == chara.socketId) { //話しているのがその相手だったら
																return; //何もしない
															} else { //話している人でなければ
																//接続する
																console.log(1111);
																callAndAddEvent(chara); //callしてイベント設置
															}
														});
													} else { //mycharaが誰かと話してなければ
														//接続する
														console.log(2222);
														callAndAddEvent(chara); //callしてイベント設置
													}
												}
											} else if (chara.talkingNodesSocketIds.length >= capacityOfVoiceChat) { //charaが話せない場合
												if (myChara.talkingNodes.length < capacityOfVoiceChat) { //mycharaが話せる場合
													if (chara.talkingNodesSocketIds == myChara.socketId) {
														console.log('相手は話せます');
														//接続する
														console.log(3333);
														callAndAddEvent(chara); //callしてイベント設置
													} else {
														console.log('相手は話せません');
													}
												}
											}
										} else { //一定距離以外なら
											if (myChara.talkingNodes.length != 0) {
												myChara.talkingNodes.forEach(function (talkingNode, i, arr) {
													if (talkingNode.socketId == chara.socketId) { //切断する
														talkingNode.call.close();
														arr.splice(i, 1);
														socket.emit('peerCallDisconnected', chara.socketId);
													}
												});
											}
										}
									}
								//-----------------------------------------------------------------------------------------ビデオチャット接続部分
								} else if (myChara.mediaStreamMode == 'video' && chara.mediaStreamMode == 'video') {//自分も相手もビデオ利用中の場合
									console.log('きてますか');
									if (!myChara.videoBroadcastReady && !chara.videoBroadcastReady) {//-------------お互いビデオ配信モードでなければ
										var videoTalkAbleDistance = 40;
										if ((diffX * diffX) + (diffY * diffY) + (diffZ * diffZ ) < videoTalkAbleDistance * videoTalkAbleDistance) { //一定距離以内なら
											console.log('一定距離内来てます');
											console.log('myChara.videoChatCall : ' + myChara.videoChatCall);
											if(!myChara.videoChatCall ){//mediaConnectionを持っていなければ
												console.log('ここまで来てます');
												if (myChara.talkingNodes.length != 0) {//audioで誰かと話してる場合
													myChara.talkingNodes.forEach(function (talkingNode, i, arr) {
														if (talkingNode.socketId == chara.socketId) {//該当charaとaudioチャット中のcharaのidが一致してたら
															talkingNode.call.close();//audioチャットを切断する
															arr.splice(i, 1);
															socket.emit('peerCallDisconnected', chara.socketId);
														}
													});
												}
												console.log('コールしました！！！！！　videoCallAndAddEvent関数実行！');
												videoCallAndAddEvent(chara); //callしてイベント設置
											}
										} else { //一定距離以外なら
											console.log('離れてます！！');
											console.log('myChara.videoChatCall : ' + myChara.videoChatCall);
											if (!myChara.videoBroadcastReady) {
												console.log($('#modal_content').children().length);
												if (myChara.videoChatCall) {//mediaConnectionを持っていれば
													console.log('切断しろー！！！！！');
													myChara.videoChatCall.close();
													modalOff();
													console.log('1003行目');
													myChara.videoChatCall = false;
												} else if ($('#modal_content').children().length > 0) {
													modalOff();
												}
											}
										}
									}
								}
							}
						});
					}
				}/*end of ~~~if (myChara && peer && myStream) {*/
				//---------------------------------------------------------------video配信、受信モード準備判定
				var diff1X = myChara.Pos[0] - octahedronMesh.position.x;
				var diff1Y = myChara.Pos[1] - octahedronMesh.position.y;
				var diff1Z = myChara.Pos[2] - octahedronMesh.position.z;
				var diff2X = myChara.Pos[0] - octahedronViewMesh.position.x;
				var diff2Y = myChara.Pos[1] - octahedronViewMesh.position.y;
				var diff2Z = myChara.Pos[2] - octahedronViewMesh.position.z;
				if(myChara.mediaStreamMode == 'video'){
					if ((diff1X * diff1X) + (diff1Y * diff1Y) + (diff1Z * diff1Z ) < 40 * 40) {//一定範囲内に入れば
						if(!appStatus.peerIdOfVideoBroadcasting) {//ビデオ配信者がいなければ
							if (myChara.videoBroadcastReady != 'readyToSend') {
								myChara.videoBroadcastReady = 'readyToSend';//video配信準備
								socket.emit('videoBroadcastReady_Update', myChara.videoBroadcastReady);
								appStatus.peerIdOfVideoBroadcasting = myChara.peerId;
								socket.emit('appStatus_Update', appStatus);//アプリ状態をサーバーへ送信
								modalOn();
								$('#modal_content').prepend($('<video></video>', {
									'class': 'videoWindow videoChatting',
									//								'data-peer': call.peer,//mediaConnection.peerを持たせる
									src: URL.createObjectURL(myStream),//自分のstreamを流す
									autoplay: true
								}));
								$('#modal_content').addClass('active');
								//appStatusのtextureを変更
								appStatus.currentMoonTextureImg = myChara.textureImg;
								//moonのtextureを更新
								moon.material = new THREE.MeshPhongMaterial({
									map: new THREE.ImageUtils.loadTexture(appStatus.currentMoonTextureImg),
									bumpMap: new THREE.ImageUtils.loadTexture(appStatus.currentMoonTextureImg),
									bumpScale: 4
								});
								socket.emit('currentMoonTextureImg_Update', appStatus.currentMoonTextureImg)
								appStatus.currentOctahedronMeshColor = 0x66eeaa;
								octahedronMesh.material = new THREE.MeshPhongMaterial({
//									color: 0x66eeaa
									color: appStatus.currentOctahedronMeshColor
								});
								socket.emit('currentOctahedronMeshColor_Update', appStatus.currentOctahedronMeshColor);
								console.log(myChara);
							}
						}
					} else {//一定範囲外になれば
						if(myChara.videoBroadcastReady == 'readyToSend' ) {
							myChara.videoBroadcastReady = false;
							socket.emit('videoBroadcastReady_Update', myChara.videoBroadcastReady);
							appStatus.peerIdOfVideoBroadcasting = false;
							socket.emit('appStatus_Update', appStatus);//アプリ状態をサーバーへ送信
							console.log('削除命令受信！！！');
							if(myChara.videoChatViewerCall.length) {
								myChara.videoChatViewerCall.forEach(function(call) {
									call.close();
								});
								myChara.videoChatViewerCall = [];//空にする
							}
							$('video').each(function (i, element) { //videoタグをサーチ
								$(element).remove();
								console.log('削除！');
								modalOff();
							});
							$('#modal_content').empty();
							appStatus.currentMoonTextureImg = appStatus.initialMoonTextureImg;
							moon.material = new THREE.MeshPhongMaterial({
//								map: new THREE.ImageUtils.loadTexture('./img/moon.jpg'),
								map: new THREE.ImageUtils.loadTexture(appStatus.currentMoonTextureImg),
								bumpMap: new THREE.ImageUtils.loadTexture(appStatus.currentMoonTextureImg),
								bumpScale: 4
							});
							socket.emit('currentMoonTextureImg_Update', appStatus.currentMoonTextureImg);
							appStatus.currentOctahedronMeshColor = appStatus.initialOctahedronMeshColor;
							octahedronMesh.material = new THREE.MeshPhongMaterial({
//								color: 0x3377ff
								color: appStatus.currentOctahedronMeshColor
							});
							socket.emit('currentOctahedronMeshColor_Update', appStatus.currentOctahedronMeshColor);
						}
					}

					if ((diff2X * diff2X) + (diff2Y * diff2Y) + (diff2Z * diff2Z ) < 40 * 40) {//一定範囲以内の場合
						if( myChara.videoBroadcastReady != 'readyToView' ) {
							myChara.videoBroadcastReady = 'readyToView';//video受信準備
							socket.emit('videoBroadcastReady_Update', myChara.videoBroadcastReady);
							console.log(myChara.videoBroadcastReady);
							if(appStatus.peerIdOfVideoBroadcasting) {//----------------ビデオ配信者がいれば
								console.log(appStatus);
								videoViewRequestAndAddEvent(appStatus.peerIdOfVideoBroadcasting);//ビデオ受信リクエスト
								console.log('ビデオ配信閲覧リクエストしました！！');
							}
						}
					} else {
						if(myChara.videoBroadcastReady == 'readyToView' ) {//一定範囲以外の場合
							myChara.videoBroadcastReady = false;
							socket.emit('videoBroadcastReady_Update', myChara.videoBroadcastReady);
							
							$('video').each(function (i, element) { //videoタグをサーチ
								$(element).remove();
								console.log('削除！');
								modalOff();
							});
							$('#modal_content').empty();

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

$('#texture1').on('click', function() {
	myChara.textureImg = './img/kyoushitsu.jpeg';
	myChara.mesh.material = new THREE.MeshPhongMaterial({
		map: new THREE.ImageUtils.loadTexture(myChara.textureImg)
	});
});
$('#texture2').on('click', function() {
	myChara.textureImg = './img/harinezumi.jpg';
	myChara.mesh.material = new THREE.MeshPhongMaterial({
		map: new THREE.ImageUtils.loadTexture(myChara.textureImg)
	});
});
$('#texture3').on('click', function() {
	myChara.textureImg = './img/IMG_2706.jpg';
	myChara.mesh.material = new THREE.MeshPhongMaterial({
		map: new THREE.ImageUtils.loadTexture(myChara.textureImg)
	});
});
$('#texture4').on('click', function() {
	myChara.textureImg = './img/pagu.jpeg';
	myChara.mesh.material = new THREE.MeshPhongMaterial({
		map: new THREE.ImageUtils.loadTexture(myChara.textureImg)
	});
});


