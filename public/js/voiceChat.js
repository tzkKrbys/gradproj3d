//var audioContext = new webkitAudioContext();
var audioContext = new AudioContext();
//フィルター
var filter = audioContext.createBiquadFilter();
console.log(filter);
//filter.type = 0;
filter.frequency.value = 440;
//analyserオブジェクトの生成
var analyser = audioContext.createAnalyser();

//var audioMode = false;
//var videoMode = false;

//-------------------------------------マイク取得

//WebAudioリクエスト成功時に呼び出されるコールバック関数
var audioObj = {"audio":true};

function gotStream(stream){
	myChara.mediaStreamMode = 'audio';
	socket.emit('emit_from_client_modeChange', myChara.mediaStreamMode);
	myStream = stream;
	//streamからAudioNodeを作成
	var mediaStreamSource = audioContext.createMediaStreamSource(stream);
	mediaStreamSource.connect(filter);
//	console.log(mediaStreamSource);
//	console.log(mediaStreamSource.connect());
	filter.connect(analyser);
	//出力Nodeのdestinationに接続
//	analyser.connect(audioContext.destination);
	//mediaStreamSource.connect(audioContext.destination);
}
//エラー処理
var errBack = function(e){
	console.log("Web Audio error:",e.code);
};


//マイクの有無を調べる
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
if(navigator.getUserMedia){
	//マイク使って良いか聞いてくる
	navigator.webkitGetUserMedia(audioObj,gotStream,errBack);
	console.log(navigator);
}else{
	console.log("マイクデバイスがありません");
}
//-------------------------------------マイク取得


//------------------------------------------------------videoChat
function videoAudioOff() {
	myStream.stop();
	myChara.mediaStreamMode = false;
}
function videoModeOn() {
	videoAudioOff();
	var videoObj = { video: true, "audio":true };
	function gotVideoStream(stream){
		myChara.mediaStreamMode = 'video';
		socket.emit('emit_from_client_modeChange', myChara.mediaStreamMode);
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
function audioModeOn() {
	videoAudioOff();
	var videoFalseAudioObj = { video: false, "audio":true };
	function gotAudioStream(stream){
		myChara.mediaStreamMode = 'audio';
		socket.emit('emit_from_client_modeChange', myChara.mediaStreamMode);
		console.log(stream);
		myStream = stream;
		var mediaStreamSource = audioContext.createMediaStreamSource(stream);
		mediaStreamSource.connect(filter);
		filter.connect(analyser);
	}
	if(navigator.getUserMedia){
		//マイク使って良いか聞いてくる
		navigator.webkitGetUserMedia(videoFalseAudioObj,gotAudioStream,errBack);
	}else{
		console.log("マイクデバイスがありません");
	}
}
$('.videoChatModeBtn').on('click', function() {
	if(myChara.mediaStreamMode == 'audio') {
		videoModeOn();
		$(this).html('videoModeOn').css({'background-color': '#faa'});
	} else if (myChara.mediaStreamMode == 'video') {
		audioModeOn();
		$(this).html('audioModeOn').css({'background-color': '#aaf'});
	}

});
//------------------------------------------------------videoChat


//navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

var myStream;

var peer = new Peer({
	key: 'a56f52f0-a285-4d43-8955-d0a609837161'
});
console.log(peer);

//var setOthersStream = function (stream) { //相手の動画を表示する為の
//	$('#others-video').prop('src', URL.createObjectURL(stream));
//};
//

//var audioContext = new webkitAudioContext();
//var mediastreamsource;
//var mediastreamdestination = audioContext.createMediaStreamDestination();
//
//var lowpassfilter = audioContext.createBiquadFilter();
//lowpassfilter.type = 0;
//lowpassfilter.frequency.value = 440;

//var audioElement;
//audioElement = document.getElementById("audio");



//var setMyStream = function (stream) {
//	myStream = stream;
//	$('#video').prop('src', URL.createObjectURL(stream));
//};

//var setMyStream = function (stream) {
//function setMyStream(stream) {
//	myStream = stream;
//	console.log(stream);
//	console.log(myStream);
//};

var receiveOthersStream = function (stream, mediaConnection) { //相手の動画を表示する為の
	console.log(stream);
	console.log(mediaConnection);
//	$('#video').prop('src', URL.createObjectURL(stream));
	if(myChara.mediaStreamMode == 'video') {
		$('div#videoElems').prepend($('<video></video>', {
			'class': 'videoWindow videoChatting',
			'data-peer': mediaConnection.peer,//mediaConnection.peerを持たせる
			src: URL.createObjectURL(stream),
			autoplay: true
		}));
	}else{
		$('div#videoElems').prepend($('<video></video>', {
			'class': 'videoWindow',
			'data-peer': mediaConnection.peer,//mediaConnection.peerを持たせる
			src: URL.createObjectURL(stream),
			autoplay: true
		}));
	}

	

//	mediastreamsource = audioContext.createMediaStreamSource(stream);
//	mediastreamsource.connect(lowpassfilter);
//	lowpassfilter.connect(mediastreamdestination);
//	audioElement.src = webkitURL.createObjectURL(mediastreamdestination.stream);
//	audioElement.play();
};


peer.on('open', function () {
	myChara.peerId = peer.id;
	console.log(myChara.peerId);
//	debugger;
	console.log(myChara);
	var sendCharaData = {
		socketId: myChara.socketId,
		Pos: myChara.Pos,
		textureImg: myChara.textureImg,
		peerId: myChara.peerId
	};
	socket.emit('emit_from_client_join', sendCharaData);
//	$('#peer-id').text(id);
//	peer.listAllPeers(function(list) {
//		console.dir(list);
//
//			if(list.length > 1){
//				console.dir(list);
//
//				list.forEach(function(id) {
//					if(id != peer.id){
//						console.log(id);
//						console.log(myStream);
//						var call = peer.call(id, myStream);//idで指定されたリモートのpeerへ発信し、mediaconnectionを返す。
//						console.log(call);
//						call.on('stream', receiveOthersStream);//リモートのpeerがstreamを追加したときに発生します。
//					}
//				});
//			}
//		});
	});
	
	console.log(peer.id);
//});

//function connnectPeer(peer) {
//	return new Promise(function(resolve, reject) {
//		peer.listAllPeers(function(list) {
//			for (var i = 0; i < list.length; i++) {
//				console.log(list[i]);
//			}
//			resolve(peer);
//		});
//	});
//}

peer.on('call', function (call) {//仮引数callはmediaConnection。リモートのpeerがあなたに発信してきたときに発生します。mediaConnectionはこの時点でアクティブではありません。つまり、最初に応答する必要があります
	console.log(call);
	call.answer(myStream);//イベントを受信した場合に、応答するためにコールバックにて与えられるmediaconnectionにて.answerを呼び出せます。また、オプションで自身のmedia streamを設定できます。
//	call.on('stream', receiveOthersStream);//リモートのpeerがstreamを追加したときに発生します。
	call.on('stream', function (stream) {
		console.log(stream);
		console.log(this);
		receiveOthersStream(stream, this);
	});//リモートのpeerがstreamを追加したときに発生します。
});
//
//peer.on('error', function (e) {
//	console.log(e.message);
//});


