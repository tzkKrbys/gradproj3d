var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};
//var app = require('./lib/app');

var socketio = require('socket.io');
var util = require('util');//console.log(util.inspect(obj,false,null));でオブジェクトの中身をターミナルで確認できるようにする為















function send404(response) {
	response.writeHead(404, {
		'Content-Type': 'text/plain'
	});
	response.write('Error 404: resource not found. ていうか見つかりません');
	response.end();
}

function sendFile(response, filePath, fileContents) {
	response.writeHead(
		200, {
			"content-type": mime.lookup(path.basename(filePath))
		}
	);
	response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
	if (cache[absPath]) {
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function (exists) {
			if (exists) {
				fs.readFile(absPath, function (err, data) {
					if (err) {
						send404(response);
					} else {
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}
				});
			} else {
				send404(response);
			}
		});
	}
}









var server = http.createServer(function (request, response) {
	var filePath = false;
	if (request.url == '/') {
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + request.url;
	}
	var absPath = './' + filePath;
	serveStatic(response, cache, absPath);
});

var port = process.env.PORT || 3000;
server.listen(port, function () {
	console.log("Server listening on port 3000.");
});


var io = socketio.listen(server);
//var charas = [];
var charasArr = [];
var ids = [];

//アプリ共通ステータス
var appStatus = {};
appStatus.initialMoonTextureImg = './img/moon.jpg';
appStatus.initialOctahedronMeshColor = 0x3377ff;
appStatus.currentMoonTextureImg = './img/moon.jpg';
appStatus.currentOctahedronMeshColor = 0x3377ff;
appStatus.peerIdOfVideoBroadcasting = false;

io.set('log level', 1);

io.sockets.on('connection', function (socket) {
	socket.chara = {};
	//io.sockets.socketsは配列になっている
	socket.emit('sendCharasArr', {charasArr: io.sockets.sockets.map(function(e) {
		return e.chara;//配列が生成される
	}), numOfChara: io.sockets.sockets.length});

	socket.emit('appStatus_Update', appStatus);//最初にクライアントにアプリの状態を送る

//	console.log('91行目 : '+io.sockets.sockets.map(function(e) {
//		console.log('92行目'+e.chara[1]);
//		return e.chara;//配列が生成される
//	}));
	socket.on('emit_from_client', function (data) {
		socket.emit('emit_from_server', 'you sended message ' + data);
		io.sockets.emit('emit_from_server', 'you sended message ' + data);
	});

	//appStatusを更新する
	socket.on('appStatus_Update', function (data) {
		appStatus = data;
		socket.broadcast.emit('appStatus_Update', data);//最初にクライアントにアプリの状態を送る
	});
	socket.on('currentMoonTextureImg_Update', function (data) {
		appStatus.currentMoonTextureImg = data;
		socket.broadcast.emit('currentMoonTextureImg_Update', data);//最初にクライアントにアプリの状態を送る
	});
	socket.on('currentOctahedronMeshColor_Update', function (data) {
		appStatus.currentOctahedronMeshColor = data;
		socket.broadcast.emit('currentOctahedronMeshColor_Update', data);
	});



	//iconのプロパティを更新する
	socket.on('myCharaUpdate', function (data) {
		socket.chara = data;//socketオブジェクトの中にiconを格納
		socket.broadcast.emit('myCharaUpdate', data);
	});

	socket.on('client_from_emit_icon_draw', function (data) {
		io.sockets.emit('server_from_emit_icon_draw', data);
	});

//----------------------------------------------------アクセス時
	//voiceChat.jsに記述
	socket.on('join', function(data) {//dataはmyChara
		socket.chara.socketId = socket.id;
		socket.chara.Pos = data.Pos;
		socket.chara.textureImg = data.textureImg;
		socket.chara.peerId = data.peerId;
		socket.chara.mediaStreamMode = data.mediaStreamMode;
		socket.chara.videoBroadcastReady = data.videoBroadcastReady;
		socket.chara.isVideoBroadcasting = data.isVideoBroadcasting;
		var chara = {
			socketId: socket.chara.socketId,
			Pos: socket.chara.Pos,
			textureImg: socket.chara.textureImg,
			peerId: socket.chara.peerId,
			mediaStreamMode : socket.chara.mediaStreamMode,
			videoBroadcastReady : socket.chara.videoBroadcastReady
		};
		socket.broadcast.emit('join', {chara: chara, numOfChara: io.sockets.sockets.length});

	});


	socket.on('positionUpdate', function(data) {
		socket.chara.Pos = data;
		//socket.broadcast.emit('charaPosChanged', {socketId: socket.id, Pos: data});
	});

	function positionUpdate() {
//		io.sockets.sockets.forEach(function(socket, i, sockets) {
		var posArr = io.sockets.sockets.map(function(e) {
			if(e.chara) {
				var data = {};
				data.socketId = e.chara.socketId;
				data.Pos = e.chara.Pos;
				return data;
//				console.log('171行目 ' + data);
			}
		});
//		console.log(posArr);
		io.sockets.emit('positionUpdate', posArr);

		setTimeout(positionUpdate,200);
	}
	positionUpdate();

	socket.on('textureImg', function(data) {
//		console.log(data);
		socket.chara.textureImg = data;
		socket.broadcast.emit('textureImg',{ socketId: socket.id, textureImg: data });
	});


	socket.on('voicePU', function(data) {
		socket.broadcast.emit('voicePU', { socketId: socket.id ,voiceBallMeshScale: data});
	});

	//-------------------------------------------------------------------------------------chat関連
	socket.on('modeChange', function (data) {
		socket.chara.mediaStreamMode = data;
		socket.broadcast.emit('modeChange', { socketId: socket.id, mediaStreamMode: data});
	});
	socket.on('videoChatOpponentPeerId', function (data) {
		socket.chara.videoChatOpponentPeerId = data;
		socket.broadcast.emit('videoChatOpponentPeerId', { socketId: socket.id, videoChatOpponentPeerId: data});
	});

	socket.on('peerCallConnected', function(data) {//dataはicon.socketId
		socket.broadcast.emit('peerCallConnected', {socketId: socket.id, talkingNodesSocketId: data});
	});

	socket.on('videoBroadcastReady_Update', function(data) {
		socket.chara.videoBroadcastReady = data;
		socket.broadcast.emit('videoBroadcastReady_Update', {socketId: socket.id, videoBroadcastReady: data});
	});

	socket.on('isVideoChatting_Update', function(data) {
		socket.chara.isVideoChatting = data;
		socket.broadcast.emit('isVideoChatting_Update', {socketId: socket.id, isVideoChatting: data});
	});
	socket.on('peerCallDisconnected', function(data) {//dataはicon.socketId
		socket.broadcast.emit('peerCallDisconnected', {socketId: socket.id, talkingNodesSocketId: data});
	});

	socket.on('disconnect', function() {
		//サーバー側のcharaはsocket.charaに格納されていて、disconnect時には勝手に消える為、削除処理不要
		socket.broadcast.emit('charaRemove', { socketId: socket.id, numOfChara: io.sockets.sockets.length});

	});
});//---end---io.sockets.on('connection'
