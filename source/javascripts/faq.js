$( function () {
	$( '.answer').hide();
	$( '.faq' ).click( function () {
		$( this ).next().slideToggle();
	} );
	if ( window.location.hash !== '' ) {
		var hash = window.location.hash.split( '#' )[1];
		$( 'a[name=' + hash ).next().next().slideToggle();
	}
} );
