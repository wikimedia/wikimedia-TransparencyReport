$( function () {
	$( '.answer').hide();
	$( '.question' ).click( function () {
		$( this ).toggleClass( 'open' );
		$( this ).next().slideToggle();
	} );
	if ( window.location.hash !== '' ) {
		var hash = window.location.hash.split( '#' )[1];
		$( 'a[name=' + hash + ']' ).next().toggleClass( 'open' );
		$( 'a[name=' + hash + ']' ).next().next().slideToggle();
	}
} );
