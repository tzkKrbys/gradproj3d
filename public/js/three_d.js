var myIcon;
var icons = [];//他のicon用配列

var socket;

var moveLeft = false;
var moveRight = false;
var moveForward = false;
var moveBackward = false;
var moveUp = false;
var moveDown = false;

//document.body.onkeydown = function (e) {
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
	//		console.log(e.keyCode);
	//		console.log('moveLeft : ' + moveLeft + ' ,moveRight : ' + moveRight + ' ,moveUp : ' + moveUp + ' ,moveDown : ' + moveDown + ' ,moveForward : ' + moveForward + ' ,moveBackward : ' + moveBackward);
}
	//document.body.onkeyup = function (e) {
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
	//		console.log(e.keyCode);
	//		console.log('moveLeft : ' + moveLeft + ' ,moveRight : ' + moveRight + ' ,moveUp : ' + moveUp + ' ,moveDown : ' + moveDown + ' ,moveForward : ' + moveForward + ' ,moveBackward : ' + moveBackward);
}

$(document).ready(function(){
	socket = io.connect();
	console.log('connectしました。');
	window.addEventListener('keydown', KeyDown3d, true); //キーを押した時、呼び出される関数を指定
	window.addEventListener('keyup', KeyUp3d, true); //キーを離した時、呼び出される関数を指定

	myIcon = new MyIcon();		// クラス
	//	myIcon.Init( Math.floor( Math.random() * canvasWidth), Math.floor( Math.random() * canvasHeight) ); //初期化メソッド実行(初期の位置を引数に渡してcanvas要素中央に配置)//
	myIcon.InitPos( 0, 0, 0 ); //初期化メソッド実行(初期の位置を引数に渡してcanvas要素中央に配置)//

	console.log(myIcon);
	
	//-------------------------------------------socket.io---//
	socket.on('connect', function() {
		socket.on('emit_fron_server_sendIcons', function(data){//dataは{icons:[], numOgIcon: io.sockets.sockets.length}
			data.icons.forEach(function(icon) {
				if (!icon) return;
				console.log(icon);
				//				icons.push(MyIcon.fromObject( icon,canvasWidth/2, canvasHeight/2 ));
				icons.push(MyIcon.fromObject( icon, icon.PosX, icon.PosY, icon.PosZ ));
			});
			$('#testDiv').html('現在の人数：' + data.numOfIcon);
			console.log(data.numOfIcon);
		});
		// クラス生成
		myIcon.socketId = socket.id;

		//socket.emit('emit_from_client_join', myIcon);

		socket.on('emit_from_server_join', function(data) {
			console.log(data);
			//			icons.push(MyIcon.fromObject( data.icon, canvasWidth/2, canvasHeight/2  ));
			icons.push(MyIcon.fromObject( data.icon, data.icon.PosX, data.icon.PosY, data.icon.PosZ ));
			$('#testDiv').html('現在の人数：' + data.numOfIcon);
			console.log(data.numOfIcon);
		});


		//		socket.on('emit_from_server_iconMove', function(data) {
		//			if(otherIcon){
		//				otherIcon.PosX = data.PosX;
		//				otherIcon.PosY = data.PosY;
		//			}
		//		});

		socket.on('emit_from_server_iconRemove', function(data){//{ socketId: socket.id, numOfIcon: io.sockets.sockets.length}
			icons.forEach(function(icon, i, icons) {
				if(icon.socketId == data.socketId) icons.splice(i, 1);
			});
			$('#testDiv').html('現在の人数：' + data.numOfIcon);
		});

		socket.on('emit_from_server_sendMsg', function(data) {
			icons.forEach(function(icon, i, icons) {
				if(icon.socketId == data.socketId) {
					console.log('きてます');
					icons[i].str = data.str;
					icons[i].chatShowCount = data.chatShowCount;
				}
			});
		});
	});//----------end----------socket.on('connect'

	
	
	$('#sendMsgBtn').on("click",function(){
		myIcon.SendChat();
		socket.emit('emit_from_client_sendMsg', {str: myIcon.str, chatShowCount: myIcon.chatShowCount});
	});
	

	var main = function () {
		var scene = new THREE.Scene();
		console.log(THREE);

		var width = 1280;
		var height = 640;
		var fov = 60;
		var aspect = width / height;
		var near = 1;
		var far = 4000;
		var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		camera.position.set(0, 0, 150);

		var renderer = new THREE.WebGLRenderer();
		renderer.setSize(width, height);
		renderer.shadowMapEnabled = true; //影をつける
		document.body.appendChild(renderer.domElement);

		var controls = new THREE.OrbitControls(camera, renderer.domElement);

		var directionalLight = new THREE.DirectionalLight(0xffffff);
		directionalLight.position.set(0, 0.7, 0.7);
		directionalLight.castShadow = true;
		scene.add(directionalLight);

		var geometry = new THREE.CubeGeometry(30, 30, 30);
		var material = new THREE.MeshPhongMaterial({
			color: 0xffaacc
		});
		var mesh = new THREE.Mesh(geometry, material);
		mesh.position.x = -100;
		mesh.position.y = 0;
		mesh.position.z = -100;

		mesh.castShadow = true;
		mesh.receiveShadow = true;
		scene.add(mesh);

		var geometry2 = new THREE.CubeGeometry(20, 20, 20);
		var material2 = new THREE.MeshPhongMaterial({
			color: 0x00ffdd
		});
		var mesh2 = new THREE.Mesh(geometry2, material2);
		mesh2.position.x = 100;
		mesh2.position.y = -100;
		mesh2.position.z = -150;
		mesh2.castShadow = true;
		mesh2.receiveShadow = true;
		scene.add(mesh2);
		console.log(mesh2);


		//球体の座標
		var spherePos;
		console.log(myIcon.PosX);
		console.log(myIcon.PosY);
		console.log(myIcon.PosZ);

//		spherePos = {
//			posX: myIcon.PosX,
//			posY: myIcon.PosY,
//			posZ: myIcon.PosZ
//		};
		//球体を表示する部分
		var sphere = new THREE.Mesh(
			//球のジオメトリ　（半径：２０）
			new THREE.SphereGeometry(30, 100, 100),
			//マテリアル （材質）
			new THREE.MeshPhongMaterial({
				//色（１６進数）
				color: 0x00ff00
			}));
		//影の設定
		sphere.castShadow = true;
		//影の設定
		sphere.receiveShadow = true;
		//sceneに追加
		scene.add(sphere);
		// 位置設定
		sphere.position.set(-100, 0, 0);
		scene.add(sphere);


		var groundGeometry = new THREE.PlaneGeometry(1000, 1000);
		//平面オブジェクトの色を設定します。
		material3 = new THREE.MeshPhongMaterial({
			color: 0xccccFF
		});
		var ground = new THREE.Mesh(groundGeometry, material3);
		//続いて、平面オブジェクトの位置を調整します。
		console.log(ground.rotation);
		//            ground.rotation = {_x: 50, _y: 0, _z: 0};
		ground.rotation.x = 4.7;
		ground.position.y = -150;
		ground.position.z = -500;
		ground.receiveShadow = true;
		//視覚効果を作る
		console.log(ground);
		scene.add(ground);




//		function moveObj(obj, moveLeft, moveRight, moveUp, moveDown, moveForward, moveBackward) {
//			if (moveLeft) obj.posX -= 2;
//			if (moveRight) obj.posX += 2;
//			if (moveUp) obj.posY += 2;
//			if (moveDown) obj.posY -= 2;
//			if (moveForward) obj.posZ -= 2;
//			if (moveBackward) obj.posZ += 2;
//		}


		//myIconの位置が変わったかどうかを確認する為の変数
		var PosX;
		var PosY;
		var PosZ;
		var countFrames = 0;
		var capacityOfVoiceChat = 3;

		function positionChange() {
			if (myIcon) {
				if (myIcon.PosX != PosX || myIcon.PosY != PosY || myIcon.PosZ != PosZ) {
					socket.emit('emit_from_client_iconPosChanged', {
						PosX: myIcon.PosX,
						PosY: myIcon.PosY,
						PosZ: myIcon.PosZ
					});
				}
			}
		}

		renderer.render(scene, camera);

		(function renderLoop() {
			requestAnimationFrame(renderLoop);

			countFrames++;
			if (myIcon) {
				PosX = myIcon.PosX;
				PosY = myIcon.PosY;
				PosZ = myIcon.PosZ;
			}

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
				if (myIcon) {
					myIcon.countVoice = 100;
					socket.emit('emit_from_client_voicePU', myIcon.countVoice);
				}
			}
			//-----------------------------------音声ビジュアルエフェクト



			socket.on('emit_from_server_voicePU', function (data) {
				icons.forEach(function (icon, i, icons) {
					if (icon.socketId == data.socketId) {
						icons[i].countVoice = data.countVoice;
					}
				});
			});

			socket.on('emit_from_server_peerCallConnected', function (data) {
				icons.forEach(function (icon, i, icons) {
					if (icon.socketId == data.socketId) {
						if (!icons[i].talkingNodesSocketIds.length) {
							icons[i].talkingNodesSocketIds.push(data.talkingNodesSocketId);
						} else {
							icons[i].talkingNodesSocketIds.forEach(function (id) {
								if (id != data.socketId) return;
								icons[i].talkingNodesSocketIds.push(data.talkingNodesSocketId);
							});
						}
					}
				});
			});
			socket.on('emit_from_server_peerCallDisconnected', function (data) {
				icons.forEach(function (icon, i, icons) {
					if (icon.socketId == data.socketId) {
						if (icons[i].talkingNodesSocketIds.length) {
							icons[i].talkingNodesSocketIds.forEach(function (id, j, arr) {
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
				call.on('close', function () { //callが終了したら
					$('video').each(function (i, element) { //videoタグをサーチ
						console.log(call.peer);
						console.log($(element).attr('data-peer'));
						if ($(element).attr("data-peer") == call.peer) { //もしこのタグのdata-peer属性値とpeerが同じなら
							$(element).remove(); //タグを左k女
							console.log('削除！');
						}
					});
				});
				myIcon.talkingNodes.push({
					socketId: icon.socketId,
					call: call
				});
				socket.emit('emit_from_client_peerCallConnected', icon.socketId);
			}


			if (countFrames % 30 == 0) { //30フレーム毎に実行
				$('#testDiv2').html('myIcon.talkingNodes.length : ' + myIcon.talkingNodes.length);
				$('#testDiv3').html('myIcon.socketId : ' + myIcon.socketId);
				if (myIcon.talkingNodes.length) {
					$('#testDiv4').html('myIcon.talkingNodes[0].socketId : ' + myIcon.talkingNodes[0].socketId);
					//					console.log(myIcon.talkingNodes);
				} else {
					$('#testDiv4').html('myIcon.talkingNodes[0].socketId : ');
				}
				if (myIcon && peer && myStream) {
					if (icons.length > 0) {
						icons.forEach(function (icon, i, icons) {
							if (icon.peerId) {
								var diffX = icon.PosX - myIcon.PosX;
								var diffY = icon.PosY - myIcon.PosY;
								if ((diffX * diffX) + (diffY * diffY) < 140 * 140) { //一定距離以内なら
									//									console.log(icon.talkingNodesSocketIds);
									if (icon.talkingNodesSocketIds.length < capacityOfVoiceChat) { //iconが話せる
										if (myIcon.talkingNodes.length < capacityOfVoiceChat) { //myIconが話せる
											if (myIcon.talkingNodes.length) { //myIcon誰かと話してたら
												myIcon.talkingNodes.forEach(function (talkingNode, i, arr) {
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
										if (myIcon.talkingNodes.length < capacityOfVoiceChat) { //myIconが話せる場合
											if (icon.talkingNodesSocketIds == myIcon.socketId) {
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
									if (myIcon.talkingNodes.length != 0) {
										myIcon.talkingNodes.forEach(function (talkingNode, i, arr) {
											if (talkingNode.socketId == icon.socketId) { //切断する
												talkingNode.call.close();
												//												talkingNode.call.on('close', function() {
												//													console.log('close!!!!!');
												//													$('#video').prop('src', '');
												//
											//});
												arr.splice(i, 1);
												socket.emit('emit_from_client_peerCallDisconnected', icon.socketId);
												//												$('video').each(function (i, element) {
												//													console.log($(this).attr("data-peer") == );
												//												});
											}
										});
									}
								}
							}
						});
					}
				}
			}

			if (myIcon) {
				//				myIcon.Draw(context,0,0); //myIconの描画メソッド呼出
				myIcon.DrawChat(); //myIconオブジェクトの描画メソッド呼出
				if (myIcon.countVoice) {
					//					context.globalAlpha = myIcon.countVoice * 3 / 1000;
					//					console.log(myIcon.talkingNodes.length);
					if (myIcon.talkingNodes.length > 0) {
						context.fillStyle = "#0f0";
					} else {
						context.fillStyle = "#ff0";
					}
					//					context.beginPath();
					//円の設定（X中心軸,Y中心軸、半径、円のスタート度、円のエンド度、回転）
					//		context.arc(oldX, oldY, Math.sqrt(Math.pow(px, 2) + Math.pow(py, 2)), 0, Math.PI * 2, false); // full circle
					//					context.arc(myIcon.PosX, myIcon.PosY, 140, 0, Math.PI * 2, false); // full circle
					//					context.fill();
					//					context.globalAlpha = 1;
					myIcon.countVoice--;
				}
			}
			//otherIcon-------------------
			icons.forEach(function (icon) {
				icon.endDrag();
				//				icon.Draw(context,0,0); //myIconオブジェクトの描画メソッド呼出(CanvasRenderingContext2Dオブジェクト,イメージオブジェクト,0,0)
				icon.DrawChat(); //myIconオブジェクトの描画メソッド呼出(CanvasRenderingContext2Dオブジェクト,str)
				if (icon.countVoice) {
					//					context.globalAlpha = icon.countVoice * 3 / 1000;
					//					console.log(icon.talkingNodesSocketIds.length);
					if (icon.talkingNodesSocketIds.length > 0) {
						//						context.fillStyle = "#0f0";
					} else {
						//						context.fillStyle = "#ff0";
					}
					//					context.fillStyle = "#ff0";
					//					context.beginPath();
					//円の設定（X中心軸,Y中心軸、半径、円のスタート度、円のエンド度、回転）
					//		context.arc(oldX, oldY, Math.sqrt(Math.pow(px, 2) + Math.pow(py, 2)), 0, Math.PI * 2, false); // full circle
					//					context.arc(icon.PosX, icon.PosY, 140, 0, Math.PI * 2, false); // full circle
					//					context.fill();
					//					context.globalAlpha = 1;
					icon.countVoice--;
				}
			});
	//		}();

			socket.on('emit_from_server_iconPosChanged', function (data) {
				icons.forEach(function (icon, i, icons) {
					if (icon.socketId == data.socketId) {
						icons[i].PosX = data.PosX;
						icons[i].PosY = data.PosY;
					}
				});
			})
			positionChange();


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
//			moveObj(spherePos, moveLeft, moveRight, moveUp, moveDown, moveForward, moveBackward);
			myIcon.Move(moveLeft, moveRight, moveUp, moveDown, moveForward, moveBackward);
			//console.log(spherePos.posY);
			console.log(spherePos);
			sphere.position.set(myIcon.PosX, myIcon.PosY, myIcon.PosZ);
			controls.update();
			renderer.render(scene, camera);
		})();//----------------------end of (function renderLoop() {--------
	}
	window.addEventListener('DOMContentLoaded', main, false);

});



