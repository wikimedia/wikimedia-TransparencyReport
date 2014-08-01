$( function () {
	$( '.answer').hide();
	$( '.faq' ).click( function () {
		$( this ).next().slideToggle();
	} );
} );
