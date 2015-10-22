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
	
});