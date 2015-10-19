$(document).ready(function() {
	$('#slideDiv, #userGuide').on('mouseover', function() {
		$('#userGuide').addClass('active');
	});
	$('#slideDiv, #userGuide').on('mouseleave', function() {
		$('#userGuide').removeClass('active');
	});
	
	
});