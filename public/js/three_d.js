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
	var main = function () {
		var scene = new THREE.Scene();
	socket = io.connect();
	console.log('connectしました。');
	window.addEventListener('keydown', KeyDown3d, true); //キーを押した時、呼び出される関数を指定
	window.addEventListener('keyup', KeyUp3d, true); //キーを離した時、呼び出される関数を指定


	console.log(myIcon);
	
	//-------------------------------------------socket.io---//
	socket.on('connect', function() {
		socket.on('emit_fron_server_sendIcons', function(data){//dataは{iconsArr:[], numOgIcon: io.sockets.sockets.length}
			console.log(data);
			console.log(data.iconsArr);//配列
			data.iconsArr.forEach(function(icon) {//data.iconsは配列
				if (!icon) return;
				console.log(icon);
				//				icons.push(MyIcon.fromObject( icon,canvasWidth/2, canvasHeight/2 ));
				icons.push(MyIcon.fromObject( icon, icon.PosX, icon.PosY, icon.PosZ ));
			});
			console.log(icons);
			$('#testDiv').html('現在の人数：' + data.numOfIcon);
			if(icons.length != 0) {
				console.log(data.numOfIcon);
				console.log(icons[0]);
				mkSphere(icons[0]);//icons[0]はmyIcon
				console.log(icons[0]);
				console.log(icons);
				scene.add(icons[0].mesh);
			}
		});
		// クラス生成
		myIcon.data.socketId = socket.id;
		console.log(myIcon);
		//voiceChat.jsに記述
		//socket.emit('emit_from_client_join', myIcon);

		socket.on('emit_from_server_join', function(data) {//dataは{icon: data(myIcon.data), numOfIcon: io.sockets.sockets.length}
			console.log(data);
			//			icons.push(MyIcon.fromObject( data.icon, canvasWidth/2, canvasHeight/2  ));
			console.log(data.icon);
			icons.push(MyIcon.fromObject( data.icon, data.icon.PosX, data.icon.PosY, data.icon.PosZ ));
			$('#testDiv').html('現在の人数：' + data.numOfIcon);
			console.log(data.numOfIcon);
			console.log(icons);
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
		myIcon.data.SendChat();
		socket.emit('emit_from_client_sendMsg', {str: myIcon.data.str, chatShowCount: myIcon.data.chatShowCount});
	});
	
	var spherePos;
	var sphere;
	
	function mkSphere(icon) {
//		this.data = data;
		//球体の座標
		//			var spherePos;
		//		spherePos = {
		//			posX: myIcon.data.PosX,
		//			posY: myIcon.data.PosY,
		//			posZ: myIcon.data.PosZ
		//		};
		
		var texture  = new THREE.ImageUtils.loadTexture(icon.data.textureImg);

		//球体を表示する部分
//		sphere = new THREE.Mesh(
		icon.mesh = new THREE.Mesh(
			//球のジオメトリ　（半径：２０）
			new THREE.SphereGeometry(30, 100, 100),
			//マテリアル （材質）
			//				new THREE.MeshPhongMaterial({
			//					//色（１６進数）
			//					color: 0x00ff00
			//				})
			new THREE.MeshPhongMaterial({
				map: texture
			}));
		//影の設定
//		sphere.castShadow = true;
		myIcon.mesh.castShadow = true;
		//影の設定
//		sphere.receiveShadow = true;
		myIcon.mesh.receiveShadow = true;
		// 位置設定
//		sphere.position.set(-100, 0, 0);
		myIcon.mesh.position.set(-100, 0, 0);
		//sceneに追加
	}

//	var main = function () {
//		var scene = new THREE.Scene();

		myIcon = new MyIcon(); // クラス
//		myIcon.Init( 0, 0, -300, './img/IMG_2706.jpg' ); //初期化メソッド実行(初期の位置を引数に渡してcanvas要素中央に配置)//
		myIcon.InitPos( 0, 0, -300 ); //初期化メソッド実行(初期の位置を引数に渡してcanvas要素中央に配置)//
		myIcon.data.textureImg = './img/IMG_2706.jpg';
		mkSphere(myIcon);
		scene.add(myIcon.mesh);
		

		
		
		var width = 1280;
		var height = 640;
		var fov = 60;//フレーム数
		var aspect = width / height;
		var near = 1;
		var far = 4000;
		var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		camera.position.set(0, 0, 150);

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
		console.log(mesh2);



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
			if (myIcon.data) {
				if (myIcon.data.PosX != PosX || myIcon.data.PosY != PosY || myIcon.data.PosZ != PosZ) {
					socket.emit('emit_from_client_iconPosChanged', {
						PosX: myIcon.data.PosX,
						PosY: myIcon.data.PosY,
						PosZ: myIcon.data.PosZ
					});
				}
			}
		}

		renderer.render(scene, camera);

		(function renderLoop() {
			requestAnimationFrame(renderLoop);

			countFrames++;
			if (myIcon.data) {
				PosX = myIcon.data.PosX;
				PosY = myIcon.data.PosY;
				PosZ = myIcon.data.PosZ;
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
				if (myIcon.data) {
					myIcon.data.countVoice = 100;
					socket.emit('emit_from_client_voicePU', myIcon.data.countVoice);
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
				myIcon.data.talkingNodes.push({
					socketId: icon.socketId,
					call: call
				});
				socket.emit('emit_from_client_peerCallConnected', icon.socketId);
			}


			if (countFrames % 30 == 0) { //30フレーム毎に実行
				$('#testDiv2').html('myIcon.data.talkingNodes.length : ' + myIcon.data.talkingNodes.length);
				$('#testDiv3').html('myIcon.data.socketId : ' + myIcon.data.socketId);
				if (myIcon.data.talkingNodes.length) {
					$('#testDiv4').html('myIcon.data.talkingNodes[0].socketId : ' + myIcon.data.talkingNodes[0].socketId);
					//					console.log(myIcon.data.talkingNodes);
				} else {
					$('#testDiv4').html('myIcon.data.talkingNodes[0].socketId : ');
				}
				if (myIcon.data && peer && myStream) {
					if (icons.length > 0) {
						icons.forEach(function (icon, i, icons) {
							if (icon.peerId) {
								var diffX = icon.PosX - myIcon.data.PosX;
								var diffY = icon.PosY - myIcon.data.PosY;
								if ((diffX * diffX) + (diffY * diffY) < 140 * 140) { //一定距離以内なら
									//									console.log(icon.talkingNodesSocketIds);
									if (icon.talkingNodesSocketIds.length < capacityOfVoiceChat) { //iconが話せる
										if (myIcon.data.talkingNodes.length < capacityOfVoiceChat) { //myIconが話せる
											if (myIcon.data.talkingNodes.length) { //myIcon誰かと話してたら
												myIcon.data.talkingNodes.forEach(function (talkingNode, i, arr) {
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
										if (myIcon.data.talkingNodes.length < capacityOfVoiceChat) { //myIconが話せる場合
											if (icon.talkingNodesSocketIds == myIcon.data.socketId) {
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
									if (myIcon.data.talkingNodes.length != 0) {
										myIcon.data.talkingNodes.forEach(function (talkingNode, i, arr) {
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

			if (myIcon.data) {
				//				myIcon.Draw(context,0,0); //myIconの描画メソッド呼出
				myIcon.DrawChat(); //myIconオブジェクトの描画メソッド呼出
				if (myIcon.data.countVoice) {
					//					context.globalAlpha = myIcon.data.countVoice * 3 / 1000;
					//					console.log(myIcon.data.talkingNodes.length);
					if (myIcon.data.talkingNodes.length > 0) {
//						context.fillStyle = "#0f0";
					} else {
//						context.fillStyle = "#ff0";
					}
					//					context.beginPath();
					//円の設定（X中心軸,Y中心軸、半径、円のスタート度、円のエンド度、回転）
					//		context.arc(oldX, oldY, Math.sqrt(Math.pow(px, 2) + Math.pow(py, 2)), 0, Math.PI * 2, false); // full circle
					//					context.arc(myIcon.data.PosX, myIcon.data.PosY, 140, 0, Math.PI * 2, false); // full circle
					//					context.fill();
					//					context.globalAlpha = 1;
					myIcon.data.countVoice--;
				}
			}
			//otherIcon-------------------
			console.log(icons);
			if(icons.length != 0) {
				icons.forEach(function (icon) {
					console.log(icon);
					icon.endDrag();
					//				icon.Draw(context,0,0); //myIconオブジェクトの描画メソッド呼出(CanvasRenderingContext2Dオブジェクト,イメージオブジェクト,0,0)
					icon.DrawChat(); //myIconオブジェクトの描画メソッド呼出(CanvasRenderingContext2Dオブジェクト,str)
					if (icon.data.countVoice) {
						//					context.globalAlpha = icon.countVoice * 3 / 1000;
						//					console.log(icon.talkingNodesSocketIds.length);
						if (icon.data.talkingNodesSocketIds.length > 0) {
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
						icon.data.countVoice--;
					}
				});
			}
	//		}();

			socket.on('emit_from_server_iconPosChanged', function (data) {
				icons.forEach(function (icon, i, icons) {
					if (icon.socketId == data.socketId) {
						icons[i].data.PosX = data.PosX;
						icons[i].data.PosY = data.PosY;
						icons[i].data.PosZ = data.PosZ;
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
			myIcon.mesh.position.set(myIcon.data.PosX, myIcon.data.PosY, myIcon.data.PosZ);
			if(icons.length != 0) {
				console.log(icons.length);
				icons.forEach(function(icon, i, icons) {
					console.log(icon);
					console.log(icon[i]);
					icons[i].mesh.position.set(icon.data.PosX, icon.data.PosY, icon.data.PosZ);
				});
			}
			controls.update();
			renderer.render(scene, camera);
		})();//----------------------end of (function renderLoop() {--------
	}
	window.addEventListener('DOMContentLoaded', main, false);

});



