;( function ( d3, $ ) {
	$( function () {
		d3.csv( '/data/where_from.csv', function ( error, data ) {
			if ( error ) throw error;
			window.requestsAndGranted( data, 'where_from', 'janjun15' );
		} );

		d3.csv( '/data/targeted_takedown.csv', function ( error, data ) {
			if ( error ) throw error;
			window.requestsAndGranted( data, 'targeted_takedown', 'janjun15' );
		} );

		d3.csv( '/data/targeted_dmca.csv', function ( error, data ) {
			if ( error ) throw error;
			window.requestsAndGranted( data, 'targeted_dmca', 'janjun15' );
		} );

		d3.csv( '/data/dmca_requests.csv', function( error, data ) {
			if ( error ) throw error;
			window.requestsAndGranted( data, 'dmca_requests', 'janjun15' );
		} );

	} );
} ) ( d3, jQuery );
