var myChara;
var otherCharasArr = [];

var socket;
var moveLeft = false;
var moveRight = false;
var moveForward = false;
var moveBackward = false;
var moveUp = false;
var moveDown = false;

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
	case 65: // ↑キー
		moveUp = true;
		break;
	case 90: // ↓キー
		moveDown = true;
		break;
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
	case 65: // ↑キー
		moveUp = false;
		break;
	case 90: // ↓キー
		moveDown = false;
		break;
	}
}

$(document).ready(function(){
	var main = function () {
		var scene = new THREE.Scene();
		//軸の表示（長さ：1000）
		var  axis = new THREE.AxisHelper(1000);
		//sceneに追加
		scene.add(axis);
		// 位置設定
		axis.position.set(0,0,1);
		
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
					console.log(chara.socketId);
					if (!chara.socketId) return;
	//				otherCharasArr.push(MyChara.fromObject( chara, chara.PosX, chara.PosY, chara.PosZ ));
					var othreChara = new Chara();
					othreChara.socketId = chara.socketId;
					othreChara.Pos = chara.Pos;
					othreChara.textureImg = chara.textureImg;
					othreChara.peerId = chara.peerId;
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
			//socket.emit('emit_from_client_join', myIcon);

			socket.on('emit_from_server_join', function(data) {
	//			otherCharasArr.push(myChara.fromObject( data.icon, data.icon.PosX, data.icon.PosY, data.icon.PosZ ));
				console.log(data.chara);

				var othreChara = new Chara();
				othreChara.socketId = data.chara.socketId;
				othreChara.Pos = data.chara.Pos;
				othreChara.textureImg = data.chara.textureImg;
				othreChara.peerId = data.chara.peerId;
				createMesh(othreChara);
				otherCharasArr.push(othreChara);
				scene.add(othreChara.mesh);

				console.log(otherCharasArr);
	//			debugger;
				$('#testDiv').html('現在の人数：' + data.numOfIcon);
			});


			socket.on('emit_from_server_charaRemove', function(data){
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

			socket.on('emit_from_server_sendMsg', function(data) {
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
			socket.emit('emit_from_client_sendMsg', {str: myChara.str, chatShowCount: myChara.chatShowCount});
		});


		function createMesh(charaX) {//charaXはcharaインスタンス
			var texture  = new THREE.ImageUtils.loadTexture(charaX.textureImg);
			//球体を表示する部分
			charaX.mesh = new THREE.Mesh(
				new THREE.SphereGeometry(30, 100, 100),//球のジオメトリ　（半径：２０）
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
			charaX.voiceBallMeshScale = 0.1;
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
		myChara.InitPos( 0, 0, -300 );
//		myChara.textureImg = './img/IMG_2706.jpg';
		myChara.textureImg = './img/IMG_2706.jpg';
//		mkSphere(myIcon);
		createMesh(myChara);
//		scene.add(myIcon.mesh);
		scene.add(myChara.mesh);
		


		console.log(window.innerWidth);
		console.log(window.innerHeight);
//		var width = 1280;
//		var height = 640;
		var width = window.innerWidth;
		var height = window.innerHeight;
		var fov = 60;//フレーム数
		var aspect = width / height;
		var near = 1;
		var far = 4000;
		var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		camera.position.set(0, 0, 200);

		var renderer = new THREE.WebGLRenderer();
		renderer.setSize(width, height);
//		renderer.shadowMapEnabled = true; //影をつける
		renderer.shadowMap.enabled = true; //影をつける
		document.body.appendChild(renderer.domElement);

		var controls = new THREE.OrbitControls(camera, renderer.domElement);

//		var directionalLight = new THREE.DirectionalLight(0xffffff);
		var directionalLight = new THREE.DirectionalLight(0xffffff);
		directionalLight.position.set(0, 0.7, 0.7);
		directionalLight.castShadow = true;
		scene.add(directionalLight);

		var geometry = new THREE.CubeGeometry(30, 30, 30);
//		var material = new THREE.MeshPhongMaterial({
//			color: 0xffaacc
//		});
		var textureMesh  = new THREE.ImageUtils.loadTexture('./img/son.png');

//		var mesh = new THREE.Mesh(geometry, material);
		var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
			map: textureMesh
		}));
		mesh.position.x = -100;
		mesh.position.y = 0;
		mesh.position.z = -100;

		mesh.castShadow = true;
		mesh.receiveShadow = true;
		scene.add(mesh);

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
			map: texture1
		}));
		//続いて、平面オブジェクトの位置を調整します。
		ground.rotation.x = 4.7;
		ground.position.y = -150;
		ground.position.z = -500;
		ground.receiveShadow = true;
		//視覚効果を作る
		scene.add(ground);


		//myCharaの位置が変わったかどうかを確認する為の変数
		var Pos = [];
		var countFrames = 0;
		var capacityOfVoiceChat = 3;

		function positionChange() {
			if (myChara) {
				if (myChara.Pos[0] != Pos[0] || myChara.Pos[1] != Pos[1] || myChara.Pos[2] != Pos[2]) {
					socket.emit('emit_from_client_charaPosChanged', myChara.Pos);
				}
			}
		}

		renderer.render(scene, camera);

		$('body').on('click', function() {
			myChara.voiceBallMeshScale = 1;
		});
		(function renderLoop() {
			requestAnimationFrame(renderLoop);

			countFrames++;

			//-----------------------------------音声ビジュアルエフェクト
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
				if (myChara) {
//					myChara.countVoice = 100;
					myChara.voiceBallMeshScale = 1;
					socket.emit('emit_from_client_voicePU', myChara.voiceBallMeshScale);
				}
			}
			//-----------------------------------音声ビジュアルエフェクト



			socket.on('emit_from_server_voicePU', function (data) {
				otherCharasArr.forEach(function (chara, i, otherCharasArr) {
					if (chara.socketId == data.socketId) {
						otherCharasArr[i].voiceBallMeshScale = data.voiceBallMeshScale;
					}
				});
			});

			socket.on('emit_from_server_peerCallConnected', function (data) {
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
			socket.on('emit_from_server_peerCallDisconnected', function (data) {
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
				socket.emit('emit_from_client_peerCallConnected', icon.socketId);
			}


			if (countFrames % 30 == 0) { //30フレーム毎に実行
				$('#testDiv2').html('myChara.talkingNodes.length : ' + myChara.talkingNodes.length);
				$('#testDiv3').html('myChara.socketId : ' + myChara.socketId);
				if (myChara.talkingNodes.length) {
					$('#testDiv4').html('myChara.talkingNodes[0].socketId : ' + myChara.talkingNodes[0].socketId);
				} else {
					$('#testDiv4').html('myChara.talkingNodes[0].socketId : ');
				}
				if (myChara && peer && myStream) {
					if (otherCharasArr.length > 0) {
						otherCharasArr.forEach(function (icon, i, icons) {
							if (icon.peerId) {
								var diffX = icon.Pos[0] - myChara.Pos[0];
								var diffY = icon.Pos[1] - myChara.Pos[1];
								var diffZ = icon.Pos[2] - myChara.Pos[2];
								var talkAbleDistance = 140;
//								if ((diffX * diffX) + (diffY * diffY) < 140 * 140) { //一定距離以内なら
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
												socket.emit('emit_from_client_peerCallDisconnected', icon.socketId);
											}
										});
									}
								}
							}
						});
					}
				}
			}

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
			//otherIcon-------------------
			if(otherCharasArr.length != 0) {
				otherCharasArr.forEach(function (chara, i, otherCharasArr) {
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
				});
			}

			socket.on('emit_from_server_charaPosChanged', function (data) {
				otherCharasArr.forEach(function (chara, i, otherCharasArr) {
					if (chara.socketId == data.socketId) {
						otherCharasArr[i].Pos = data.Pos;
//						otherCharasArr[i].Pos[0] = data.Pos[0];
//						otherCharasArr[i].Pos[1] = data.Pos[1];
//						otherCharasArr[i].Pos[2] = data.Pos[2];
					}
				});
			})
			
			//myCharaの位置が変化していたら
			positionChange();
			if (myChara/* && countFrames % 2 == 0*/) {
				Pos[0] = myChara.Pos[0];
				Pos[1] = myChara.Pos[1];
				Pos[2] = myChara.Pos[2];
			}
			controls.update();

			mesh.rotation.set(
				mesh.rotation.x + 0.005,
				mesh.rotation.y + 0.001,
				mesh.rotation.z + 0.01
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
			myChara.mesh.position.set(
				myChara.Pos[0],
				myChara.Pos[1],
				myChara.Pos[2]
			);
			myChara.mesh.rotation.set(
				myChara.mesh.rotation.x + 0.0,
				myChara.mesh.rotation.y + 0.02,
				myChara.mesh.rotation.z + 0.0
			);
			myChara.voiceBallMesh.position.set(
				myChara.Pos[0],
				myChara.Pos[1],
				myChara.Pos[2]
			);
			if(otherCharasArr.length != 0) {
//				console.log(otherCharasArr);
				otherCharasArr.forEach(function(chara, i, otherCharasArr) {
//					console.log(otherCharasArr[i]);
//					console.log(chara);
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

			renderer.render(scene, camera);
		})();//----------------------end of (function renderLoop() {--------
	}
	window.addEventListener('DOMContentLoaded', main, false);

});



