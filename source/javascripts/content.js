;( function ( d3, $ ) {
	var tooltip = d3
		.select( 'body' )
		.append( 'div' )
		.attr( 'class', 'graph_tooltip' )
		.style( 'display', 'none' );

	var codes = {
		"USA": "us",
		"France": "fr",
		"United Kingdom": "gb",
		"Spain": "es",
		"India": "in",
		"Sri Lanka": "lk",
		"Germany": "de",
		"Canada": "ca",
		"Nepal": "np",
		"Pakistan": "pk",
		"Brazil": "br",
		"China": "cn",
		"Switzerland": "ch",
		"Singapore": "sg",
		"New Zealand": "nz",
		"Japan": "jp"
	}

	function whereFrom( data ) {
		var current = 'jul12jun13';
		var element = 'where_from_graph';
		var margin = {
				top: 10,
				right: 10,
				bottom: 10,
				left: 40
			},
			width = $( '#' + element ).width() - margin.left - margin.right,
			height = $( '#' + element ).height() - margin.top - margin.bottom;
		var graph = d3.select( '#' + element )
			.append( 'svg' )
			.attr( 'width', width + margin.left + margin.right )
			.attr( 'height', height + margin.top + margin.bottom )
			.append( 'g' )
			.attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')');
		var leftLine = graph.append( 'line' )
			.attr( 'class', 'left-line' )
			.attr( 'x1', 0 )
			.attr( 'x2', 0 )
			.attr( 'y1', 20 )
			.attr( 'y2', height - 10 );

		function getData( data, current ) {
			if ( current === 'all' ) {
				return [];
			}

			return data.filter( function ( d ) {
				return d.duration === current;
			} );
		}

		function makeGraph( data, current ) {
			var data = getData( data, current );
			var yScale = d3.scale.ordinal()
				.domain( data.map( function ( d ) {
					return d.key;
				 } ) )
				.rangeRoundBands( [ margin.top, height ], 0.6 );
			var xScale = d3.scale.linear()
				.domain( [0, d3.max( data, function (d) {
					return d.value;
				} ) ] )
				.range( [ 0, width ] );

			// Labels
			var labels = graph.selectAll( 'text.blue_bars' ).data( data )
			labels
				.enter()
				.append( 'text' )
				.on( 'click', function ( d ) {
					if ( ds.filters[ groupBy ] === d.key ) {
						delete ds.filters[ groupBy ];
					} else {
						ds.filters[ groupBy ] = d.key;
					}
					dispatch.filter();
				} )
				.attr( 'class', 'blue_bars' );

			labels
				.attr( 'y', function ( d ) {
					return yScale( d.key );
				} )
				.attr( 'dy', -3 )
				.attr( 'x', 5 )
				.html( function ( d ) {
					return d.key;
				} );

			labels.exit().remove();

			// Flags
			var flags = graph.selectAll( 'image.flags' ).data( data )
			flags
				.enter()
				.append( 'image' )
				.on( 'click', function ( d ) {
					if ( ds.filters[ groupBy ] === d.key ) {
						delete ds.filters[ groupBy ];
					} else {
						ds.filters[ groupBy ] = d.key;
					}
					dispatch.filter();
				} )
				.attr( 'class', 'flags' )
				.classed( 'flag', true);
			flags
				.attr( 'width', 28 )
				.attr( 'height', 16 )
				.attr( 'xlink:href', function ( d ) {
					return '/images/flags_svg/' + codes[ d.key.split( '*' )[0] ] + '.svg';
				} )
				.attr( 'y', function ( d ) {
					return yScale( d.key ) - 8;
				} )
				.attr( 'x', -33 );
			flags.exit().remove();

			// Bars
			var bar = graph.selectAll( 'rect.blue_bars' ).data( data, function ( d ) {
				return d.key;
			} )
			bar
				.enter()
				.append( 'rect' )
				.on( 'click', function ( d ) {
					if ( ds.filters[ groupBy ] === d.key ) {
						delete ds.filters[ groupBy ];
					} else {
						ds.filters[ groupBy ] = d.key;
					}
					dispatch.filter();
				} )
				.on( 'mouseover', function ( d ) {
					var
						$target = $( d3.event.target ),
						top = $target.offset().top,
						left = $target.offset().left + xScale( d.value ) + 10;
					return tooltip
						.html( '<b>Total Requests</b>'
							+ '<span>' + ( d.value ) + '</span>' )
						.style( 'top', top + 'px' )
						.style( 'left', left + 'px' )
						.style( 'display', 'block' );
				} )
				.on( 'mouseout', function () {
					return tooltip.style( 'display', 'none' );
				} )
				.attr( 'class', 'blue_bars' );

			bar
				.attr( 'height', yScale.rangeBand() )
				.attr( 'y', function ( d ) {
					return yScale( d.key );
				} )
				.classed( 'disclosed', function ( d ) {
					return d.disclosed;
				} )
				.transition()
				.attr( 'x', '0' )
				.attr( 'width', function ( d ) {
					return xScale( d.value );
				} );
			bar.exit().remove();
		}

		makeGraph( data, current );

		$( '.where_from_tabs' ).click( function () {
			$( '.where_from_tabs' ).removeClass( 'active' );
			$( this ).addClass( 'active' );
			var duration =  $( this ).attr( 'id' ).split( '_' )[ 2 ];
			makeGraph( data, duration );
		} );
	}

	$( function () {
		d3.csv( '/data/where_from.csv', function ( error, data ) {
			if ( error ) throw error;
			whereFrom( data );
		} );
	} );
} ) ( d3, jQuery );
