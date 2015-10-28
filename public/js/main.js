$(document).ready(function() {
	$('#slideDiv, #userGuide').on('mouseover', function() {
		$('#userGuide').addClass('active');
	});
	$('#slideDiv, #userGuide').on('mouseleave', function() {
		$('#userGuide').removeClass('active');
	});
	$('#openingElem').on('click', function() {
		$(this).fadeOut(4000).addClass('started');
		
	});
	
	$('.texture1').on('click', function() {
		myChara.textureImg = './img/kyoushitsu.jpeg';
		myChara.mesh.material = new THREE.MeshPhongMaterial({
			map: new THREE.ImageUtils.loadTexture(myChara.textureImg)
		});
		socket.emit('textureImg', myChara.textureImg);
	});
	$('.texture2').on('click', function() {
		myChara.textureImg = './img/harinezumi.jpg';
		myChara.mesh.material = new THREE.MeshPhongMaterial({
			map: new THREE.ImageUtils.loadTexture(myChara.textureImg)
		});
		socket.emit('textureImg', myChara.textureImg);
	});
	$('.texture3').on('click', function() {
		myChara.textureImg = './img/IMG_2706.jpg';
		myChara.mesh.material = new THREE.MeshPhongMaterial({
			map: new THREE.ImageUtils.loadTexture(myChara.textureImg)
		});
		socket.emit('textureImg', myChara.textureImg);
	});
	$('.texture4').on('click', function() {
		myChara.textureImg = './img/pagu.jpeg';
		myChara.mesh.material = new THREE.MeshPhongMaterial({
			map: new THREE.ImageUtils.loadTexture(myChara.textureImg)
		});
		socket.emit('textureImg', myChara.textureImg);
	});

	$('.texture5').on('click', function() {
		myChara.textureImg = './img/IMG_2915.jpg';
		myChara.mesh.material = new THREE.MeshPhongMaterial({
			map: new THREE.ImageUtils.loadTexture(myChara.textureImg)
		});
		socket.emit('textureImg', myChara.textureImg);
	});

	$('.texture6').on('click', function() {
		myChara.textureImg = './img/hanami.jpg';
		myChara.mesh.material = new THREE.MeshPhongMaterial({
			map: new THREE.ImageUtils.loadTexture(myChara.textureImg)
		});
		socket.emit('textureImg', myChara.textureImg);
	});

});