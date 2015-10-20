//var audioContext = new webkitAudioContext();
var audioContext = new AudioContext();
//フィルター
var filter = audioContext.createBiquadFilter();
console.log(filter);
//filter.type = 0;
filter.frequency.value = 440;
//analyserオブジェクトの生成
var analyser = audioContext.createAnalyser();
//var isModalActive = false;


//-------------------------------------マイク取得
function gotStream(stream){
//	myChara.mediaStreamMode = 'audio';
	myChara.mediaStreamMode = 'video';
	socket.emit('modeChange', myChara.mediaStreamMode);
	myStream = stream;
	//streamからAudioNodeを作成
	var mediaStreamSource = audioContext.createMediaStreamSource(stream);
	mediaStreamSource.connect(filter);
	filter.connect(analyser);
}

//エラー処理
var errBack = function(e){
	console.log("Web Audio error:",e.code);
};


//マイクの有無を調べる
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
//if(navigator.getUserMedia){
//	//マイク使って良いか聞いてくる
//	navigator.webkitGetUserMedia({"video": true, "audio":true},gotStream,errBack);
//	console.log(navigator);
//}else{
//	console.log("マイクデバイスがありません");
//}
//-------------------------------------マイク取得


//------------------------------------------------------videoChat
function mediaStreamOff() {
	if(myStream) myStream.stop();
	myChara.mediaStreamMode = false;
	socket.emit('modeChange', myChara.mediaStreamMode);
}
function videoModeOn() {
	if(myChara.mediaStreamMode == 'video') {
		myChara.mesh = new THREE.Mesh(
			new THREE.CubeGeometry(20, 20, 20),
			new THREE.MeshPhongMaterial({
				map: texture
			}));
	}

	mediaStreamOff();
	var videoObj = { video: true, "audio":true };
	
	function gotVideoStream(stream){
		myChara.mediaStreamMode = 'video';
		socket.emit('modeChange', myChara.mediaStreamMode);
		console.log(myChara);
//		socket.emit('myCharaUpdate', myChara);
		console.log(stream);
		myStream = stream;//videoになる
		var mediaStreamSource = audioContext.createMediaStreamSource(stream);
		mediaStreamSource.connect(filter);
		filter.connect(analyser);
	}

	if(navigator.getUserMedia){
		//マイク使って良いか聞いてくる
		navigator.webkitGetUserMedia(videoObj,gotVideoStream,errBack);
	}else{
		console.log("マイクデバイスがありません");
	}
}

function gotAudioStream(stream){
	myChara.mediaStreamMode = 'audio';
	socket.emit('modeChange', myChara.mediaStreamMode);
	console.log(stream);
	myStream = stream;
	var mediaStreamSource = audioContext.createMediaStreamSource(stream);
	mediaStreamSource.connect(filter);
	filter.connect(analyser);
}

function audioModeOn() {
	mediaStreamOff();
	var videoFalseAudioObj = { video: false, "audio":true };
	if(navigator.getUserMedia){
		//マイク使って良いか聞いてくる
		navigator.webkitGetUserMedia(videoFalseAudioObj,gotAudioStream,errBack);
	}else{
		console.log("マイクデバイスがありません");
	}
}

function modalOff() {
	$('#modal_content').removeClass('active');
	setTimeout(function() {
		$('#modal_base').removeClass('active');
		$('#modal_base').delay(800).fadeOut('slow', function() {
			$('#modal_overlay').fadeOut("slow").remove();
		});
	},1000);
}


var myStream;

var peer = new Peer({
	key: 'a56f52f0-a285-4d43-8955-d0a609837161'
});

function modalOn() {
	$('body').append('<div id="modal_overlay"><div>');
	$('#modal_overlay').delay(1000).fadeIn("slow");
	$('#modal_base').show(function() {
		$('#modal_base').addClass('active');
	});
}

var receiveOthersStream = function (stream, mediaConnection) { //相手の動画を表示する為の
	if( myChara.mediaStreamMode == 'video' ) {
		modalOn();
		$('#modal_content').prepend($('<video></video>', {
			'class': 'videoWindow videoChatting',
			'data-peer': mediaConnection.peer,//mediaConnection.peerを持たせる
			src: URL.createObjectURL(stream),
			autoplay: true
		}));
		$('#modal_content').addClass('active');
	} else {
		$('div#videoElems').prepend($('<video></video>', {
			'class': 'videoWindow audioChatting',
			'data-peer': mediaConnection.peer,//mediaConnection.peerを持たせる
			src: URL.createObjectURL(stream),
			autoplay: true,
			width: "0",
			height: "0"
		}));
	}
};

peer.on('open', function () {
	myChara.peerId = peer.id;
	console.log(myChara.peerId);
	console.log(myChara);
	var sendCharaData = {
		socketId: myChara.socketId,
		Pos: myChara.Pos,
		textureImg: myChara.textureImg,
		peerId: myChara.peerId,
		mediaStreamMode: myChara.mediaStreamMode,
		videoBroadcastReady: myChara.videoBroadcastReady,
		isVideoBroadcasting: myChara.isVideoBroadcasting
	};
	socket.emit('join', sendCharaData);
	});
	
	console.log(peer.id);


peer.on('connection', function(conn) {//ビデオ受信リクエスト側からconnectionがあった際に
	console.log('コネクションきたね');
	console.log(conn.peer);
	console.log(myStream);
	
	var call = peer.call(conn.peer, myStream);//ビデオコールする
	console.log(call);
	myChara.videoChatViewerCall.push(call);//mediaConnectionクラス。切断する際に必要
	console.log(myChara.videoChatViewerCall);
	call.on('close', function () { //callが終了した際のイベントを設定
		console.log('削除命令受信！！！');
		$('video').each(function (i, element) { //videoタグをサーチ
			console.log('削除命令通過！！！');
			$(element).remove();
			console.log('削除！');
			modalOff();
		});
		$('#modal_content').empty();
	});
	console.log(call);
});
peer.on('call', function (call) {//仮引数callはmediaConnection。リモートのpeerがあなたに発信してきたときに発生します。mediaConnectionはこの時点でアクティブではありません。つまり、最初に応答する必要があります
	console.log('かかってきました！　：　' + call);
	console.log(call);
	console.log(call.id);
	console.log('アンサー準備');
	if( !myChara.videoBroadcastReady ) {
		console.log('アンサー実行');
		call.answer();//イベントを受信した場合に、応答するためにコールバックにて与えられるmediaconnectionにて.answerを呼び出せ,また、オプションで自身のmedia streamを設定できます。
		call.on('stream', function (stream) {
			receiveOthersStream(stream, this);
		});//リモートのpeerがstreamを追加したときに発生します。
		console.log('アンサーしました！　：　');
	} else if ( myChara.videoBroadcastReady == 'readyToView' ){
		console.log('videosendからビデオコール受信！！！！');
		call.answer();
		call.on('stream', function (stream) {//streamは相手のstream
			receiveOthersStream(stream, this);
		});//リモートのpeerがstreamを追加したときに発生します。
		myChara.videoChatCall = call;//mediaConnectionクラス。切断する際に必要
		call.on('close', function () { //callが終了した際のイベントを設定
			$('video').remove();
			console.log('削除！');
			modalOff();
			$('#modal_content').empty();
		});
	}
});


