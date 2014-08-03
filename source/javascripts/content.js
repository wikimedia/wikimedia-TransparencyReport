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
		var $el = $( '#where_from_graph' );
		var margin = {
				top: 10,
				right: 10,
				bottom: 10,
				left: 40
			},
			width = $el.width() - margin.left - margin.right,
			height = $el.height() - margin.top - margin.bottom;
		var svg = d3.select( '#' + $el.attr( 'id' ) )
			.append( 'svg' )
			.attr( 'width', width + margin.left + margin.right )
			.attr( 'height', height + margin.top + margin.bottom )
		var graph = svg
			.append( 'g' )
			.attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')');

		function getData( data, current ) {
			if ( current === 'all' ) {
				var all_data = {}, all_data_array = [];

				data.forEach( function ( d ) {
					if ( all_data[ d.key ] ) {
						all_data[ d.key ] += Number( d.value );
					} else {
						all_data[ d.key ] = Number( d.value );
					}
				} );

				Object.keys( all_data ).forEach( function ( d ) {
					var row = {
						key: d,
						value: all_data[ d ]
					}
					all_data_array.push( row );
				} );

				return all_data_array;
			}

			return data.filter( function ( d ) {
				return d.duration === current;
			} );
		}

		function makeGraph( data, current ) {
			var data = getData( data, current );

			data.sort( function ( a, b ) {
				return b.value - a.value;
			} )

			var height = ( data.length * 40 ) + 40;

			$el.height( height );
			svg.attr( 'height', height );

			var xScale = d3.scale.linear()
				.domain( [0, d3.max( data, function (d) {
					return Number( d.value );
				} ) ] )
				.range( [ 0, width ] );

			var leftLine = graph.append( 'line' )
				.attr( 'class', 'left-line' )
				.attr( 'x1', 0 )
				.attr( 'x2', 0 )
				.attr( 'y1', 20 )
				.attr( 'y2', height);


			// Labels
			var labels = graph.selectAll( 'text.blue_bars' ).data( data, function ( d ) {
				return d.key.split( '*' )[0];
			} )
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
				.attr( 'x', '-100' )
				.style( 'opacity', '0' )
				.attr( 'class', 'blue_bars' );

			labels
				.html( function ( d ) {
					return d.key;
				} )
				.transition()
				.style( 'opacity', '1' )
				.attr( 'y', function ( d, i ) {
					return ( i + 1 ) * 40;
				} )
				.attr( 'dy', -3 )
				.attr( 'x', 5 );

			labels.exit().remove();

			// Flags
			var flags = graph.selectAll( 'image.flags' ).data( data, function ( d ) {
				return d.key.split( '*' )[0];
			} )
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
				.transition()
				.attr( 'y', function ( d, i ) {
					return ( ( i + 1 ) * 40 ) - 8;
				} )
				.attr( 'x', -33 );
			flags.exit().remove();

			// Bars
			var bar = graph.selectAll( 'rect.blue_bars' ).data( data, function ( d ) {
				return d.key.split( '*' )[0];
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
				.attr( 'class', 'blue_bars' );

			bar
				.attr( 'height', '12' )
				.classed( 'disclosed', function ( d ) {
					return d.disclosed;
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
				.transition()
				.attr( 'y', function ( d, i ) {
					return ( ( i + 1 ) * 40 ) + 3;
				} )
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
