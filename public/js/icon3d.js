//MyIconクラス------------------------------------------------
function MyIcon(){
	this.data = {};
	this.mesh;
	this.data.socketId;
	this.data.PosX;					// x座標
	this.data.PosY;					// y座標
	this.data.PosZ;					// y座標
	this.data.AddNumX;				// x座標移動加算量
	this.data.AddNumY;				// y座標移動加算量
	this.data.radius = 20;			// 円の半径
	this.data.relX;					// 円の中心とマウスの相対位置
	this.data.relY;					// 円の中心とマウスの相対位置
	this.data.relZ;					// 円の中心とマウスの相対位置
	this.data.dragging = false;//ドラッグ中かどうか
	this.data.onObj = false;//マウスがアイコンに乗っかってるかどうか
	this.data.chatShowCount;
	this.data.str;//チャットで発言した文字
	this.data.countVoice;//発言した文字が消えるまでのカウントダウン
	this.data.iconImg;//アイコン画像用
	this.data.peerId;//skywayのpeer.id
	this.data.talkingNodes = [];//{socketId: icon.socketId, call: call }
	this.data.talkingNodesSocketIds = [];
	this.data.textureImg;
}

/*初期化関数*/
MyIcon.prototype.InitPos = function( x, y, z ){//引数にx,yの初期位置を渡す
	this.data.PosX = x;
	this.data.PosY = y;
	this.data.PosZ = z;
	this.data.AddNumX = 4/*2*/;
	this.data.AddNumY = 4;
	this.data.AddNumZ = 4;
//	this.data.iconImg = new Image();
//	this.data.iconImg.src = "../img/circleParis.png";//アイコン画像を渡す
}

MyIcon.fromObject = function( obj, x, y, z ) {
	console.log(obj);
	var icon = new MyIcon();
//	icon.xxx = obj.xxx;
	console.log(obj);
	Object.keys(obj).forEach(function (key) {
		icon.data[key] = obj[key];
		
	});
	icon.InitPos( x, y, z );
	// ...
	return icon;
}


/*アイコン描画関数*/
MyIcon.prototype.Draw = function(img, offsetX, offSetY, offSetZ){ //引数 CanvasRenderingContext2Dオブジェクト,0,0
	img.save(); //現在の描画スタイル状態を一時的に保存//context . save() 現在の状態をスタックの最後に加えます。
	img.transform(-1, 0, 0, 1, 0, 0);//context . transform(m11, m12, m21, m22, dx, dy)下記の通りに引数に指定されたマトリックスを適用して、変換マトリックスを変更します。
	img.drawImage(this.data.iconImg, 0, 0, 160, 160, -this.data.PosX - this.data.radius, this.data.PosY - this.data.radius, this.data.radius * 2, this.data.radius * 2);//drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
	img.restore();//context . restore() スタックの最後の状態を抜き出し、その状態をコンテキストに復元します。
}

/*動き*/
MyIcon.prototype.Move = function(moveRight,moveLeft,moveUp,moveDown,moveForward,moveBackward){
	if(moveRight) {// 右キーが押された
		this.data.PosX -= this.data.AddNumX;
	}
	else if(moveLeft) {// 左キーが押された
		this.data.PosX += this.data.AddNumX;
	}
	if(moveUp) {// 上キーが押された
		this.data.PosY += this.data.AddNumY;
	}
	else if(moveDown) {// 下キーが押された
		this.data.PosY -= this.data.AddNumY;
	}
	if(moveForward) {// 上キーが押された
		this.data.PosZ -= this.data.AddNumZ;
	}
	else if(moveBackward) {// 下キーが押された
		this.data.PosZ += this.data.AddNumZ;
	}
	//	if(this.data.PosX < 0){
//		this.data.PosX = 4;
//	}else if(this.data.PosX > canvasWidth){
//		this.data.PosX = canvasWidth - 4;
//	}
//	if(this.data.PosY < 0){
//		this.data.PosY = 4;
//	}else if(this.data.PosY > canvasHeight){
//		this.data.PosY = canvasHeight - 4;
//	}
//	if(this.data.PosZ < 0){
//		this.data.PosZ = 4;
//	}else if(this.data.PosZ > canvasHeight){
//		this.data.PosZ = canvasHeight - 4;
//	}
}
//チャットの文字描画の為のメソッド
MyIcon.prototype.DrawChat = function(){
	if(this.data.chatShowCount > 0){
		this.data.chatShowCount--;
		//カラー指定
		context.fillStyle = '#fff';
		//fontサイズ、書式
		context.font = "16px _sans";
		context.strokeStyle = '#fff';
		//文字の設置位置
		context.textBaseline = "top"; //top,middle,bottom...
		//表示文字と座標
		context.fillText(this.data.str, this.data.PosX, this.data.PosY); //ctx.fillText(文字列,x,y)
	}
}
MyIcon.prototype.SendChat = function () {
	this.data.str = $('textarea').val();
	this.data.chatShowCount = 500;
	$('textarea').val("");
	return false;
}


//ドラッグ&ドロップ関数
MyIcon.prototype.beginDrag = function (event) {
	this.data.mousePosCheck();
	if (this.data.onObj) {// マウスが円の上ならばドラッグ開始
		this.data.dragging = true;
		this.data.relX = this.data.PosX-mouseX;
		this.data.relY = this.data.PosY-mouseY;
		canvas.style.cursor="move";//マウスカーソルの変更
	}
}
MyIcon.prototype.drag = function (event) {
	this.data.mousePosCheck();
	if (this.data.dragging) {//ドラッグ中ならばアイコンを移動
		this.data.PosX = mouseX + this.data.relX;
		this.data.PosY = mouseY + this.data.relY;
		this.data.Draw(context,0,0);
	}
	else {
		if (this.data.onObj && canvas.style.cursor != "pointer") {
			canvas.style.cursor="pointer";
		}
		if (!this.data.onObj && canvas.style.cursor == "pointer") {
			canvas.style.cursor="default";
		}
	}
}

MyIcon.prototype.endDrag = function (event) {
	this.data.dragging = false;//ドラッグ終了
//	canvas.style.cursor="default";
}

MyIcon.prototype.mousePosCheck = function (event) {
	// 円の上にあるかチェック
	var len = Math.sqrt(( mouseX - this.data.PosX ) * ( mouseX - this.data.PosX ) + ( mouseY - this.data.PosY ) * ( mouseY - this.data.PosY ));
	if (len <= this.data.radius) {
		this.data.onObj = true;
	} else {
		this.data.onObj = false;
	}
}

//MyIconクラス------------------------------------------------



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
	this.videoBroadcastReady = false;//false,readyToSend,readyToView ビデオ配信準備用
	this.isVideoBroadcasting = false;//false,sending,viewing ビデオ配信中判断用
}

/*初期化関数*/
Chara.prototype.InitPos = function( x, y, z ){//引数にx,yの初期位置を渡す
	this.Pos = [ x, y, z ];
//	this.PosX = x;
//	this.PosY = y;
//	this.PosZ = z;
	this.moveSpeed = 4;
//	this.AddNumX = 4/*2*/;
//	this.AddNumY = 4;
//	this.AddNumZ = 4;
//	this.iconImg = new Image();
//	this.iconImg.src = "../img/circleParis.png";//アイコン画像を渡す
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
	//	if(this.PosX < 0){
//		this.PosX = 4;
//	}else if(this.PosX > canvasWidth){
//		this.PosX = canvasWidth - 4;
//	}
//	if(this.PosY < 0){
//		this.PosY = 4;
//	}else if(this.PosY > canvasHeight){
//		this.PosY = canvasHeight - 4;
//	}
//	if(this.PosZ < 0){
//		this.PosZ = 4;
//	}else if(this.PosZ > canvasHeight){
//		this.PosZ = canvasHeight - 4;
//	}
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












//
//
////OtherIconクラス------------------------------------------------
//function OtherIcon(){
//	this.socketId;
//	this.PosX;					// x座標
//	this.PosY;					// y座標
//	this.AddNumX;				// x座標移動加算量
//	this.AddNumY;				// y座標移動加算量
//	this.radius = 20;			// 円の半径
//	this.relX;					// 円の中心とマウスの相対位置
//	this.relY;					// 円の中心とマウスの相対位置
//	this.dragging = false;//ドラッグ中かどうか
//	this.onObj = false;//マウスがアイコンに乗っかってるかどうか
//	this.chatShowCount;
//	this.str;//チャットで発言した文字
//	this.countVoice;//発言した文字が消えるまでのカウントダウン
//	this.iconImg;//アイコン画像用
//	this.peerId;//skywayのpeer.id
//	this.talkingNodesSocketIds = [];
//}
//
///*初期化関数*/
//OtherIcon.prototype.Init = function(x,y){//引数にx,yの初期位置を渡す
//	this.PosX = x;
//	this.PosY = y;
//	this.AddNumX = 4/*2*/;
//	this.AddNumY = 4;
//	this.iconImg = new Image();
//	this.iconImg.src = "../img/son.png";//アイコン画像を渡す
//	this.talkingCount = 0;
//}
//
//OtherIcon.fromObject = function(obj, x, y) {
//	console.log(obj);
//	var icon = new OtherIcon();
////	icon.xxx = obj.xxx;
//	Object.keys(obj).forEach(function (key) {
//		icon[key] = obj[key];
//		
//	});
//	
//	console.log(icon);
//	icon.Init(x, y);
//	// ...
//	return icon;
//}
//
//
///*アイコン描画関数*/
//OtherIcon.prototype.Draw = function(img,offsetX,offSetY){ //引数 CanvasRenderingContext2Dオブジェクト,0,0
//	img.save(); //現在の描画スタイル状態を一時的に保存//context . save() 現在の状態をスタックの最後に加えます。
//	img.transform(-1, 0, 0, 1, 0, 0);//context . transform(m11, m12, m21, m22, dx, dy)下記の通りに引数に指定されたマトリックスを適用して、変換マトリックスを変更します。
//	img.drawImage(this.iconImg, 0, 0, 160, 160, -this.PosX - this.radius, this.PosY - this.radius, this.radius * 2, this.radius * 2);//drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
//	img.restore();//context . restore() スタックの最後の状態を抜き出し、その状態をコンテキストに復元します。
//}
//
///*動き*/
//OtherIcon.prototype.Move = function(bRight,bLeft,bUp,bDown){
//	if(bRight) {// 右キーが押された
//		this.PosX += this.AddNumX;
//	}
//	else if(bLeft) {// 左キーが押された
//		this.PosX -= this.AddNumX;
//	}
//	if(bUp) {// 上キーが押された
//		this.PosY -= this.AddNumY;
//	}
//	else if(bDown) {// 下キーが押された
//		this.PosY += this.AddNumY;
//	}
//	if(this.PosX < 0){
//		this.PosX = 4;
//	}else if(this.PosX > canvasWidth){
//		this.PosX = canvasWidth - 4;
//	}
//	if(this.PosY < 0){
//		this.PosY = 4;
//	}else if(this.PosY > canvasHeight){
//		this.PosY = canvasHeight - 4;
//	}
//}
////チャットの文字描画の為のメソッド
//OtherIcon.prototype.DrawChat = function(str){
//	if(this.chatShowCount > 0){
//		this.chatShowCount--;
//		//カラー指定
//		context.fillStyle = '#fff';
//		//fontサイズ、書式
//		context.font = "16px _sans";
//		context.strokeStyle = '#fff';
//		//文字の設置位置
//		context.textBaseline = "top"; //top,middle,bottom...
//		//表示文字と座標
//		context.fillText(this.str, this.PosX, this.PosY); //ctx.fillText(文字列,x,y)
//	}
//}
//OtherIcon.prototype.SendChat = function () {
//	this.str = $('textarea').val();
//	this.DrawChat();
//	this.chatShowCount = 500;
//	$('textarea').val("");
//	return false;
//};
//
//
////ドラッグ&ドロップ関数
//OtherIcon.prototype.beginDrag = function (event) {
//	this.mousePosCheck();
//	if (this.onObj) {// マウスが円の上ならばドラッグ開始
//		this.dragging = true;
//		this.relX = this.PosX-mouseX;
//		this.relY = this.PosY-mouseY;
//		canvas.style.cursor="move";//マウスカーソルの変更
//	}
//}
//OtherIcon.prototype.drag = function (event) {
//	this.mousePosCheck();
//	if (this.dragging) {//ドラッグ中ならばアイコンを移動
//		this.PosX = mouseX + this.relX;
//		this.PosY = mouseY + this.relY;
//		this.Draw(context,0,0);
//	}
//	else {
//		if (this.onObj && canvas.style.cursor != "pointer") {
//			canvas.style.cursor="pointer";
//		}
//		if (!this.onObj && canvas.style.cursor == "pointer") {
//			canvas.style.cursor="default";
//		}
//	}
//}
//
//OtherIcon.prototype.endDrag = function (event) {
//	this.dragging = false;//ドラッグ終了
//	canvas.style.cursor="default";
//}
//
//OtherIcon.prototype.mousePosCheck = function (event) {
//	// 円の上にあるかチェック
//	var len = Math.sqrt(( mouseX - this.PosX ) * ( mouseX - this.PosX ) + ( mouseY - this.PosY ) * ( mouseY - this.PosY ));
//	if (len <= this.radius) {
//		this.onObj = true;
//	} else {
//		this.onObj = false;
//	}
//}
//
////OtherIconクラス------------------------------------------------