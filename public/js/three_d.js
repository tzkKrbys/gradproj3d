console.log('rendererテスト');
var myChara;
var otherCharasArr = [];

var socket;
var moveLeft = false;
var moveRight = false;
var moveForward = false;
var moveBackward = false;
var moveUp = false;
var moveDown = false;

//アプリ共通ステータス
var appStatus = {};
appStatus.initialMoonTextureImg = './img/moon.jpg';
appStatus.initialOctahedronMeshColor = 0x3377ff;
appStatus.currentMoonTextureImg = './img/moon.jpg';
appStatus.currentOctahedronMeshColor = 0x3377ff;
appStatus.peerIdOfVideoBroadcasting = false;
appStatus.videoBroadcastReadyToView = [];

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
				videoModeOn();
			}
			break;
		case 77: // Mキー
			mediaStreamOff();
		break;
	}
}

$(document).ready(function(){
	var main = function () {
		function onWindowResize() {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize( window.innerWidth, window.innerHeight );
		}
		window.addEventListener( 'resize', onWindowResize, false );
		var scene = new THREE.Scene();

		socket = io.connect();
		window.addEventListener('keydown', KeyDown3d, true); //キーを押した時、呼び出される関数を指定
		window.addEventListener('keyup', KeyUp3d, true); //キーを離した時、呼び出される関数を指定
		//-------------------------------------------socket.io---//
		socket.on('connect', function() {
			socket.on('sendCharasArr', function(data){//dataは{iconsArr:[], numOgIcon: io.sockets.sockets.length}
				data.charasArr.forEach(function(chara) {//dataはobject{charasArr ,numOfChara}
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
				
				$('#testDiv').html('現在の人数：' + data.numOfChara);
				if(otherCharasArr.length != 0) {
					otherCharasArr.forEach(function(chara, i, otherCharasArr) {
						createMesh(otherCharasArr[i]);//otherCharasArr[0]はmyChara
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
				appStatus.currentMoonTextureImg = data;
				octahedronMesh.material = new THREE.MeshPhongMaterial({
					color: data
				});
			});

			socket.on('join', function(data) {
				var othreChara = new Chara();
				othreChara.socketId = data.chara.socketId;
				othreChara.Pos = data.chara.Pos;
				othreChara.textureImg = data.chara.textureImg;
				othreChara.peerId = data.chara.peerId;
				othreChara.mediaStreamMode = data.chara.mediaStreamMode;
				othreChara.videoBroadcastReady = data.chara.videoBroadcastReady;
				createMesh(othreChara);
				otherCharasArr.push(othreChara);
				scene.add(othreChara.mesh);
				$('#testDiv').html('現在の人数：' + (data.numOfChara - 1));
			});


			socket.on('charaRemove', function(data){
				otherCharasArr.forEach(function(chara, i, otherCharasArr) {
					if(chara.socketId == data.socketId) otherCharasArr.splice(i, 1);
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
//				new THREE.TorusKnotGeometry(16, 8, 128, 32, 2, 3),
				new THREE.TorusGeometry( 28, 10, 16, 100 ),
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
			charaX.voiceBallMeshScale = 0.0001;
			charaX.voiceBallMesh = new THREE.Mesh(
				new THREE.SphereGeometry(charaX.voiceBallMeshSize, 100, 100),
				new THREE.MeshPhongMaterial({
					//				map: texture
					color: 0xffff00,
					transparent: true,
					opacity: 0.3
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
		}

		myChara = new Chara(); // クラス
		myChara.socketId = socket.id;
		Math.floor(Math.random() * 1000) - 500;
		myChara.InitPos( Math.floor(Math.random() * 500) - 250, 0, Math.floor(Math.random() * 200)  );
		myChara.textureImg = './img/IMG_2706.jpg';
		createMesh(myChara);
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
		console.log('rendererテスト');

		var renderer;
		if (window.WebGLRenderingContext) {
			renderer = new THREE.WebGLRenderer();
			console.log('webGLですよ');
		} else {
			renderer = new THREE.CanvasRenderer();
			console.log('canvasですよ');
		}
//		var renderer = new THREE.WebGLRenderer();
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
		var octahedronMesh = new THREE.Mesh(geometry, material);
		octahedronMesh.position.x = 0;
		octahedronMesh.position.y = 150;
		octahedronMesh.position.z = -400;

		octahedronMesh.castShadow = true;
		octahedronMesh.receiveShadow = true;
		scene.add(octahedronMesh);

		var geometry2 = new THREE.CubeGeometry(80, 80, 80);
		var textureMesh2  = new THREE.ImageUtils.loadTexture('./img/circleParis.png');
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
		var moonSize = 500;
		var moon = new THREE.Mesh(
			new THREE.SphereGeometry(moonSize, 30, 30),
			new THREE.MeshPhongMaterial({
				map: moonTexture,
				bumpMap:moonTexture,
				bumpScale: 4
//				color: 0xaaeecc
			})
		);
		//----------------------------------月
		moon.Pos = [1100, -100, -2600];
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
		earth.castShadow = true;
		earth.receiveShadow = true;
		scene.add(earth);

		//-----------------------------------平面
		//myCharaの位置が変わったかどうかを確認する為の変数
		var Pos = [];
		var countFrames = 0;
		var capacityOfVoiceChat = 4;

		function positionUpdate() {
			if (myChara) {
				if (myChara.Pos[0] != Pos[0] || myChara.Pos[1] != Pos[1] || myChara.Pos[2] != Pos[2]) {
					socket.emit('positionUpdate', myChara.Pos);
				}
			}
		}
		
		renderer.render(scene, camera);
		
		//mediaStreamModeを変更
		socket.on('modeChange', function (data) {//{ socketId: socket.id, mediaStreamMode: mediaStreamMode}
			otherCharasArr.forEach(function (chara, i, otherCharasArr) {
				if (chara.socketId == data.socketId) {
					otherCharasArr[i].mediaStreamMode = data.mediaStreamMode;
				}
			});
		});
		socket.on('videoChatOpponentPeerId', function (data) {//{ socketId: socket.id, mediaStreamMode: mediaStreamMode}
			otherCharasArr.forEach(function (chara, i, otherCharasArr) {
				if (chara.socketId == data.socketId) {
					otherCharasArr[i].videoChatOpponentPeerId = data.videoChatOpponentPeerId;
					console.log(data);
					console.log(myChara.videoChatCall);
				}
			});
		});
	

		
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
				if (data[i] > 150) {
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

		function update() {
			//-----------------------------------音声ビジュアルエフェクト
			if(countFrames % 10 == 0) {
				voicePickUpFx();
			}

			//-----------------------------------音声ビジュアルエフェクト

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
			} else if (myChara.mediaStreamMode == false && myChara.mesh.geometry.type != "TorusGeometry") {
//				myChara.mesh.geometry = new THREE.TorusKnotGeometry(20, 10, 128, 32, 2, 3);
				myChara.mesh.geometry = new THREE.TorusGeometry( 28, 10, 16, 100 );
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
			if(countFrames % 30 == 0) {
				//myCharaの位置が変化していたら
				positionUpdate();
				//------------------------------------座標情報用
				if (myChara) {
					Pos[0] = myChara.Pos[0];
					Pos[1] = myChara.Pos[1];
					Pos[2] = myChara.Pos[2];
				}
			}
			
			if (myChara) {
				myChara.DrawChat(); //myCharaオブジェクトの描画メソッド呼出
				if (myChara.voiceBallMeshScale > 0.0001) {
					if (myChara.talkingNodes.length > 0) {
						myChara.voiceBallMesh.material.color.r = 0;
					} else {
						myChara.voiceBallMesh.material.color.r = 1;
					}
					myChara.voiceBallMeshScale -= 0.01;
				}
			}
			
			//otherChara描画-------------------
			if(otherCharasArr.length != 0) {
				otherCharasArr.forEach(function (chara, i, otherCharasArr) {
					if(chara.mediaStreamMode == 'audio' && chara.mesh.geometry.type != "SphereGeometry") {
						chara.mesh.geometry = new THREE.SphereGeometry(30, 100, 100);
					}else if (chara.mediaStreamMode == 'video' && chara.mesh.geometry.type != "BoxGeometry") {
						chara.mesh.geometry = new THREE.CubeGeometry(40, 40, 40);//球のジオメトリ　（半径：２０）
					} else if (chara.mediaStreamMode == false && chara.mesh.geometry.type != "TorusGeometry") {
						chara.mesh.geometry = new THREE.TorusGeometry( 28, 10, 16, 100 );
//					} else if (chara.mediaStreamMode == false && chara.mesh.geometry.type != "TorusKnotGeometry") {
//						chara.mesh.geometry = new THREE.TorusKnotGeometry(20, 10, 128, 32, 2, 3);
					}
					chara.DrawChat(); //myCharaオブジェクトの描画メソッド呼出(CanvasRenderingContext2Dオブジェクト,str)
					if (chara.voiceBallMeshScale > 0.0001) {
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
//					otherCharasArr[i].mesh.position.set(
//						otherCharasArr[i].Pos[0],
//						otherCharasArr[i].Pos[1],
//						otherCharasArr[i].Pos[2]
//
//					console.log(otherCharasArr[i].Pos);
					if(otherCharasArr[i].renderPos[0] != otherCharasArr[i].Pos[0] ||
					   otherCharasArr[i].renderPos[1] != otherCharasArr[i].Pos[1] ||
					   otherCharasArr[i].renderPos[2] != otherCharasArr[i].Pos[2] ){
//						console.log(otherCharasArr[i].renderPos);
//						console.log(otherCharasArr[i].Pos);
						if(otherCharasArr[i].Pos[0] - otherCharasArr[i].renderPos[0] > 4){
							otherCharasArr[i].renderPos[0] += 4;
						} else if (otherCharasArr[i].Pos[0] - otherCharasArr[i].renderPos[0] < -4) {
							otherCharasArr[i].renderPos[0] -= 4;
						} else {
							otherCharasArr[i].renderPos[0] = otherCharasArr[i].Pos[0];
						}
						if(otherCharasArr[i].Pos[1] - otherCharasArr[i].renderPos[1] > 4){
							otherCharasArr[i].renderPos[1] += 4;
						} else if (otherCharasArr[i].Pos[1] - otherCharasArr[i].renderPos[1] < -4) {
							otherCharasArr[i].renderPos[1] -= 4;
						} else {
							otherCharasArr[i].renderPos[1] = otherCharasArr[i].Pos[1];
						}
						if(otherCharasArr[i].Pos[2] - otherCharasArr[i].renderPos[2] > 4){
							otherCharasArr[i].renderPos[2] += 4;
						} else if (otherCharasArr[i].Pos[2] - otherCharasArr[i].renderPos[2] < -4) {
							otherCharasArr[i].renderPos[2] -= 4;
						} else {
							otherCharasArr[i].renderPos[2] = otherCharasArr[i].Pos[2];
						}
						otherCharasArr[i].mesh.position.set(
							otherCharasArr[i].renderPos[0],
							otherCharasArr[i].renderPos[1],
							otherCharasArr[i].renderPos[2]
						);
					}
					otherCharasArr[i].voiceBallMesh.position.set(
						otherCharasArr[i].renderPos[0],
						otherCharasArr[i].renderPos[1],
						otherCharasArr[i].renderPos[2]
					);
					otherCharasArr[i].voiceBallMesh.scale.set(
						otherCharasArr[i].voiceBallMeshScale,
						otherCharasArr[i].voiceBallMeshScale,
						otherCharasArr[i].voiceBallMeshScale
					);
				});
			}
		}
//-------------------------------------------------------function update() end

		socket.on('peerCallConnected', function (data) {
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
		socket.on('textureImg', function (data) {
			console.log(data);
			otherCharasArr.forEach(function (chara, i, otherCharasArr) {
				if (chara.socketId == data.socketId) {
					otherCharasArr[i].textureImg = data.textureImg;
					console.log(otherCharasArr[i].textureImg);
					otherCharasArr[i].mesh.material = new THREE.MeshPhongMaterial({
						map: new THREE.ImageUtils.loadTexture(otherCharasArr[i].textureImg)
					});
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
		socket.on('positionUpdate', function (data) {
			otherCharasArr.forEach(function(chara, i, otherCharasArr) {
				for(var j = 0; j < data.length; j++){
					if(data[j]){
						if (chara.socketId == data[j].socketId ) {
							otherCharasArr[i].Pos = data[j].Pos;
						}
					}
				}
//				console.log(otherCharasArr[i].Pos);
			});
		});
		
		socket.on('myCharaUpdate', function(data) {
			otherCharasArr.forEach(function(chara, i, otherCharasArr) {
				if (chara.socketId == data.socketId ) {
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
//		socket.on('charaPosChanged', function (data) {
//			otherCharasArr.forEach(function (chara, i, otherCharasArr) {
//				if (chara.socketId == data.socketId) {
//					otherCharasArr[i].Pos = data.Pos;
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

		//音声チャット関数
		function callAndAddEvent(chara) {
			var call = peer.call(chara.peerId, myStream);
			call.on('close', function () { //callが終了した際のイベントを設定
				$('video').each(function (i, element) { //videoタグをサーチ
					if ($(element).attr("data-peer") == call.peer) { //もしこのタグのdata-peer属性値とpeerが同じなら
						$(element).remove(); //タグを削除
					}
				});
			});
			myChara.talkingNodes.push({//トーク中のノードから該当するものを取り除く
				socketId: chara.socketId,
				call: call
			});
			socket.emit('peerCallConnected', chara.socketId);
		}
		//ビデオチャット関数
		function videoCallAndAddEvent(chara) {
			var call = peer.call(chara.peerId, myStream);//第一引数…リモートpeerのブローカーID(リモートpeerのpeer.id)
			myChara.videoChatCall = call;//mediaConnectionクラス。切断する際に必要
			
			console.log(chara);
			console.log(call);//call.peerとchara.peerIdは同じ
			
			socket.emit('videoChatOpponentPeerId', myChara.videoChatCall.peer);//videochat中の相手のpeerId。ビデオ接続する際に、相手がビデオチャット中かどうかを判断する為に使う
			call.on('close', function () { //callが終了した際のイベントを設定
				$('video').each(function (i, element) { //videoタグをサーチ
					if ($(element).attr("data-peer") == call.peer) { //もしこのタグのdata-peer属性値とpeerが同じなら
						$(element).remove();
						modalOff();
					}
				});
				$('#modal_content').empty();
			});
		}
		//ビデオ配信受信リクエスト
		function videoViewRequestAndAddEvent(peerId) {
			peer.connect(peerId);
		}
		//モーダルウインドウ終了関数
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


		function testElemCreate(){
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
			
			$('#testDiv2').html('myChara.talkingNodes.length : ' + myChara.talkingNodes.length);
			$('#testDiv3').html('myChara.socketId : ' + myChara.socketId);
			if (myChara.talkingNodes.length) {
				$('#testDiv4').html('myChara.talkingNodes[0].socketId : ' + myChara.talkingNodes[0].socketId);
			} else {
				$('#testDiv4').html('myChara.talkingNodes[0].socketId : ');
			}
		};

		(function renderLoop() {
			requestAnimationFrame(renderLoop);
			countFrames++;
			update();
			


//------------------------------------------------------------media接続判定
			if (countFrames % 30 == 0) { //30フレーム毎に実行
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
																callAndAddEvent(chara); //callしてイベント設置
															}
														});
													} else { //mycharaが誰かと話してなければ
														//接続する
														callAndAddEvent(chara); //callしてイベント設置
													}
												}
											} else if (chara.talkingNodesSocketIds.length >= capacityOfVoiceChat) { //charaが話せない場合
												if (myChara.talkingNodes.length < capacityOfVoiceChat) { //mycharaが話せる場合
													if (chara.talkingNodesSocketIds == myChara.socketId) {//
														console.log('相手は話せます');
														//接続する
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
//								} else if (myChara.mediaStreamMode == 'video' && chara.mediaStreamMode == 'video') {//自分も相手もビデオ利用中の場合
								} else if (myChara.mediaStreamMode == 'video') {//自分も相手もビデオ利用中の場合
									if ( chara.mediaStreamMode == 'video') {//自分も相手もビデオ利用中の場合
										if (!myChara.videoBroadcastReady && !chara.videoBroadcastReady) {//-------------お互いビデオ配信モードでなければ
											var videoTalkAbleDistance = 40;
											if ((diffX * diffX) + (diffY * diffY) + (diffZ * diffZ ) < videoTalkAbleDistance * videoTalkAbleDistance) {//距離内
												if(!myChara.videoChatCall){//mediaConnectionを持っていなければ
													if( !chara.videoChatOpponentPeerId || chara.videoChatOpponentPeerId == myChara.peerId ){
														if (myChara.talkingNodes.length != 0) {//audioで誰かと話してる場合
															myChara.talkingNodes.forEach(function (talkingNode, i, arr) {
																if (talkingNode.socketId == chara.socketId) {//該当charaとaudioチャット中のcharaのidが一致してたら
																	talkingNode.call.close();//audioチャットを切断する
																	arr.splice(i, 1);
																	socket.emit('peerCallDisconnected', chara.socketId);
																}
															});
														}
														videoCallAndAddEvent(chara); //callしてイベント設置
													}
												}
											} else { //一定距離以外なら
												if (!myChara.videoBroadcastReady) {
													if(myChara.videoChatCall) {
														if(myChara.videoChatCall.peer == chara.peerId) {
														
															if ( myChara.videoChatCall.peer == chara.peerId ) {//mediaConnectionを持っていれば
																console.log('切断');
																myChara.videoChatCall.close();
																modalOff();
																myChara.videoChatCall = false;
																socket.emit('videoChatOpponentPeerId', false);//ビデオ接続する際に、相手がビデオチャット中かどうかを判断する為に使う
															} else if ($('#modal_content').children().length > 0) {
																console.log('切断下段');
																modalOff();
															}
														}
													}
													
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
				var diff2X = myChara.Pos[0] - moon.position.x;
				var diff2Y = myChara.Pos[1] - moon.position.y;
				var diff2Z = myChara.Pos[2] - moon.position.z;
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
									src: URL.createObjectURL(myStream),//自分のstreamを流す
									autoplay: true,
									muted : "muted"
								}));
								$('#modal_content').addClass('active');
								$('#modal_content').append('<h2>ビデオ配信中</h2>');

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
							}
						}
					} else {//一定範囲外になれば
						if(myChara.videoBroadcastReady == 'readyToSend' ) {
							myChara.videoBroadcastReady = false;
							socket.emit('videoBroadcastReady_Update', myChara.videoBroadcastReady);
							appStatus.peerIdOfVideoBroadcasting = false;
							socket.emit('appStatus_Update', appStatus);//アプリ状態をサーバーへ送信
							if(myChara.videoChatViewerCall.length) {
								myChara.videoChatViewerCall.forEach(function(call) {
									call.close();
								});
								myChara.videoChatViewerCall = [];//空にする
							}
							$('video').each(function (i, element) { //videoタグをサーチ
								$(element).remove();//削除
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

					if ((diff2X * diff2X) + (diff2Y * diff2Y) + (diff2Z * diff2Z ) < moonSize * moonSize) {//一定範囲以内の場合
						if( myChara.videoBroadcastReady != 'readyToView' ) {
							myChara.videoBroadcastReady = 'readyToView';//video受信準備
							socket.emit('videoBroadcastReady_Update', myChara.videoBroadcastReady);
							if(appStatus.peerIdOfVideoBroadcasting) {//----------------------------ビデオ配信者がいれば
								videoViewRequestAndAddEvent(appStatus.peerIdOfVideoBroadcasting);//ビデオ受信リクエスト
							}
						}
					} else {
						if(myChara.videoBroadcastReady == 'readyToView' ) {//一定範囲以外の場合
							myChara.videoBroadcastReady = false;
							socket.emit('videoBroadcastReady_Update', myChara.videoBroadcastReady);
							
							$('video').each(function (i, element) { //videoタグをサーチ
								$(element).remove();//削除
								modalOff();
							});
							$('#modal_content').empty();
						}
					}
				}
			}//if (countFrames % 30 == 0) { //30フレーム毎に実行

			renderer.render(scene, camera);
		})();//----------------------end of (function renderLoop() {--------
	}
	window.addEventListener('DOMContentLoaded', main, false);
});



