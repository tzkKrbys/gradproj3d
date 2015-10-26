//Charaクラス------------------------------------------------
function Chara(){
	this.mesh;
	this.socketId;
	this.Pos = [0, 0, 0];					// x座標
	this.moveSpeed;				// 座標移動加算量
	this.radius = 20;			// 円の半径
	this.dragging = false;//ドラッグ中かどうか
	this.onObj = false;//マウスがアイコンに乗っかってるかどうか
	this.chatShowCount;
	this.str;//チャットで発言した文字
	this.countVoice;//発言した文字が消えるまでのカウントダウン
	this.iconImg;//アイコン画像用
	this.peerId;//skywayのpeer.id
	this.talkingNodes = [];//{socketId: icon.socketId, call: call }
	this.talkingNodesSocketIds = [];
	this.textureImg;
	this.voiceBallMesh;
	this.voiceBallMeshSize;
	this.voiceBallMeshScale;
	this.mediaStreamMode = false;//video,audio,false
	this.videoChatCall;//切断する際に必要
	this.videoChatCallPeer;//ビデオ接続する際に、相手がビデオチャット中かどうかを判断する為に使う
	this.videoChatViewerCall = [];//切断する際に必要
	this.videoBroadcastReady = false;//false,readyToSend,readyToView ビデオ配信準備用
	this.isVideoBroadcasting = false;//false,sending,viewing ビデオ配信中判断用
}

/*初期化関数*/
Chara.prototype.InitPos = function( x, y, z ){//引数にx,yの初期位置を渡す
	this.Pos = [ x, y, z ];
	this.moveSpeed = 4;
}

Chara.fromObject = function( obj ) {
	var chara = new Chara();
//	icon.xxx = obj.xxx;
	Object.keys(obj).forEach(function (key) {
		chara.data[key] = obj[key];
		
	});
	return chara;
}

/*アイコン描画関数*/
Chara.prototype.Draw = function(img, offsetX, offSetY, offSetZ){ //引数 CanvasRenderingContext2Dオブジェクト,0,0
	img.save(); //現在の描画スタイル状態を一時的に保存//context . save() 現在の状態をスタックの最後に加えます。
	img.transform(-1, 0, 0, 1, 0, 0);//context . transform(m11, m12, m21, m22, dx, dy)下記の通りに引数に指定されたマトリックスを適用して、変換マトリックスを変更します。
	img.drawImage(this.iconImg, 0, 0, 160, 160, -this.PosX - this.radius, this.PosY - this.radius, this.radius * 2, this.radius * 2);//drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
	img.restore();//context . restore() スタックの最後の状態を抜き出し、その状態をコンテキストに復元します。
}

/*動き*/
Chara.prototype.Move = function(moveRight,moveLeft,moveUp,moveDown,moveForward,moveBackward){
	if(moveRight) {// 右キーが押された
		this.Pos[0] -= this.moveSpeed;
	}
	else if(moveLeft) {// 左キーが押された
		this.Pos[0] += this.moveSpeed;
	}
	if(moveUp) {// 上キーが押された
		this.Pos[1] += this.moveSpeed;
	}
	else if(moveDown) {// 下キーが押された
		this.Pos[1] -= this.moveSpeed;
	}
	if(moveForward) {// 上キーが押された
		this.Pos[2] -= this.moveSpeed;
	}
	else if(moveBackward) {// 下キーが押された
		this.Pos[2] += this.moveSpeed;
	}
}
//チャットの文字描画の為のメソッド
Chara.prototype.DrawChat = function(){
	if(this.chatShowCount > 0){
		this.chatShowCount--;
		//カラー指定
		context.fillStyle = '#fff';
		//fontサイズ、書式
		context.font = "16px _sans";
		context.strokeStyle = '#fff';
		//文字の設置位置
		context.textBaseline = "top"; //top,middle,bottom...
		//表示文字と座標
		context.fillText(this.str, this.PosX, this.PosY); //ctx.fillText(文字列,x,y)
	}
}
Chara.prototype.SendChat = function () {
	this.str = $('textarea').val();
	this.chatShowCount = 500;
	$('textarea').val("");
	return false;
}


//ドラッグ&ドロップ関数
Chara.prototype.beginDrag = function (event) {
	this.mousePosCheck();
	if (this.onObj) {// マウスが円の上ならばドラッグ開始
		this.dragging = true;
		this.relX = this.PosX-mouseX;
		this.relY = this.PosY-mouseY;
		canvas.style.cursor="move";//マウスカーソルの変更
	}
}
Chara.prototype.drag = function (event) {
	this.mousePosCheck();
	if (this.dragging) {//ドラッグ中ならばアイコンを移動
		this.PosX = mouseX + this.relX;
		this.PosY = mouseY + this.relY;
		this.Draw(context,0,0);
	}
	else {
		if (this.onObj && canvas.style.cursor != "pointer") {
			canvas.style.cursor="pointer";
		}
		if (!this.onObj && canvas.style.cursor == "pointer") {
			canvas.style.cursor="default";
		}
	}
}

Chara.prototype.endDrag = function (event) {
	this.dragging = false;//ドラッグ終了
//	canvas.style.cursor="default";
}

Chara.prototype.mousePosCheck = function (event) {
	// 円の上にあるかチェック
	var len = Math.sqrt(( mouseX - this.PosX ) * ( mouseX - this.PosX ) + ( mouseY - this.PosY ) * ( mouseY - this.PosY ));
	if (len <= this.radius) {
		this.onObj = true;
	} else {
		this.onObj = false;
	}
}

//Charaクラス------------------------------------------------




