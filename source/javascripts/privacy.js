;( function ( d3, $ ) {

	var codes = {
		"USA": "us",
		"France": "fr",
		"UK": "gb",
		"Spain": "es",
		"India": "in",
		"Sri Lanka": "lk",
		"Canada": "ca",
		"Nepal": "np",
		"Pakistan": "pk",
		"Brazil": "br",
		"China": "cn",
		"Japan": "jp"
	}

	/*---Requests---------*/
	function Requests() {
	};

	Requests.prototype.init = function ( data ) {
		if ( data.length === 0 ) throw new Error( 'Empty dataset' );
		this.data = data.requests;
		this.filters = {};
	}

	Requests.prototype.groupBy = function ( column, asArray ) {
		if ( !this.data[ 0 ][ column ] ) {
			throw new Error( 'No such column in dataset: \"'
				+ column + '\" in: '
				+ Object.keys( this.data[ 0 ] ).join( ', ' ) );
		}

		var original_data = this.data;
		var data = {};

		function init( row, column ) {
			if ( !data[row[ column ] ] ) {
				data[ row[ column ] ] = 0;
			}
		}

		function increment( row, column ) {
			init( row, column );
			data[ row[ column ] ] += 1;
		}

		for ( var i in original_data ) {
			var row = original_data[ i ];
			var count = false;

			if ( this.filters === undefined || this.filters.length === 0 ) {
			    count = true;
			} else {
				var allFilters = true;
				for ( var j in this.filters ) {
					var filter = this.filters[ j ];
					if ( filter !== row[ j ]) {
						allFilters = false;
					}
				}

				if ( allFilters ) {
					count = true;
				}
			}

			if ( count ) {
				increment( row, column );
			} else {
				init( row, column );
			}
		}

		if ( asArray ) {
			var array = [];
			for ( var i in data ) array.push( {
				key: i,
				value: data[i]
			} );
			return array;
		} else {
			return data;
		}
	}

	/*---Country Graph---------*/
	countryGraph = function ( element, ds, dispatch ) {
		var data = ds.groupBy( 'country', true );
		var margin = { top: 10, right: 10, bottom: 10, left: 10 },
			width = 825 - margin.left - margin.right,
		        height = 300 - margin.top - margin.bottom;

		var graph = d3.select( element )
			.append( 'svg' )
			.attr( 'width', width + margin.left + margin.right )
			.attr( 'height', height + margin.top + margin.bottom )
			.append( 'g' )
			.attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')' );

		var xScale = d3.scale.ordinal()
			.domain( data.map( function ( d ) {
				return d.key
			} ) )
			.rangeRoundBands( [ margin.left, width - margin.right ], 0.1 );

		var yScale = d3.scale.linear()
			.domain( [ 0, d3.max( data, function (d) {
				return d.value;
			} ) ] )
			.range( [ 0, height ] );

		function makeBars( graph, data, xScale, yScale, ds, dispatch, className ) {
			var bar = graph
				.selectAll( 'rect.' + className )
				.data( data, function ( d ) {
					return d.key;
				}  );

			bar
				.enter()
				.append( 'rect' )
				.on( 'click', function ( d ) {
					if ( ds.filters[ 'country' ] === d.key ) {
						delete ds.filters[ 'country' ];
					} else {
						ds.filters[ 'country' ] = d.key;
					}
					dispatch.filter();
				} )
				.attr( 'class', className );

			bar
				.attr( 'x', function ( d ) {
					return xScale(d.key)
				} )
				.attr( 'width', xScale.rangeBand() )
				.transition()
				.attr( 'height', function ( d ) {
					return yScale( d.value )
				} )
				.attr( 'y', function( d ) {
					return (height - yScale( d.value ) );
				} );
		}

		makeBars( graph, data, xScale, yScale, ds, dispatch, 'gray_bars' );
		makeBars( graph, data, xScale, yScale, ds, dispatch, 'blue_bars' );

		dispatch.on( 'filter.country', function () {
			var new_data = ds.groupBy( 'country', true );
			makeBars( graph, new_data, xScale, yScale, ds, dispatch, 'blue_bars' );
		} );
	}

	/*---Horizontal Graph---------*/
	horizontalGraph = function ( element, groupBy, ds, dispatch, tooltip ) {
		var data = ds.groupBy( groupBy, true );
		var margin = { top: 10, right: 10, bottom: 10, left: 20 },
			width = $( '#' + element ).width() - margin.left - margin.right,
			height = $( '#' + element ).height() - margin.top - margin.bottom;
		var graph = d3.select( '#' + element )
			.append( 'svg' )
			.attr( 'width', width + margin.left + margin.right )
			.attr( 'height', height + margin.top + margin.bottom )
			.append( 'g' )
			.attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')');
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


		function makeLabels( graph, data, xScale, yScale, ds, dispatch, className ) {
			var hasFlags = Object.keys(codes).indexOf( data[0].key ) > -1;

			var labels = graph.selectAll( 'text.' + className ).data( data )
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
				.attr( 'class', className );

			labels
				.attr( 'y', function ( d ) {
					return yScale( d.key );
				} )
				.attr( 'dy', -3 )
				.attr( 'x', ( hasFlags ) ? 20 : 0 )
				.html( function ( d ) {
					return d.key;
				} );

			// If its a country graphy
			if ( hasFlags ) {
				var flags = graph.selectAll( 'image.' + className ).data( data )
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
					.attr( 'class', className );

				flags
					.attr( 'width', 16 )
					.attr( 'height', 11 )
					.attr( 'xlink:href', function ( d ) {
						return '/images/flags/' + codes[ d.key ] + '.png';
					} )
					.attr( 'y', function ( d ) {
						return yScale( d.key ) - 14;
					} )
					.attr( 'x', 0 );
			}
		}

		function makeBars( graph, data, xScale, yScale, ds, dispatch, className ) {
			var bar = graph.selectAll( 'rect.' + className ).data( data )
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
				.on( 'mouseover', function () {
					return tooltip.style( 'display', 'block' );
				} )
				.on( 'mousemove', function ( d ) {
					return tooltip
						.html( '<b>' + d.key + '</b><br>' + d.value )
						.style( 'top', ( event.pageY - 25 ) + 'px' )
						.style( 'left', ( event.pageX + 25 ) + 'px' );
				} )
				.on( 'mouseout', function () {
					return tooltip.style( 'display', 'none' );
				} )
				.attr( 'class', className );

			bar
				.attr( 'height', yScale.rangeBand() )
				.attr( 'y', function ( d ) {
					return yScale( d.key );
				} )
				.attr( 'x', 0 )
				.transition()
				.attr( 'width', function ( d ) {
					return xScale( d.value )
				} );
		}
		makeBars( graph, data, xScale, yScale, ds, dispatch, 'gray_bars' );
		makeBars( graph, data, xScale, yScale, ds, dispatch, 'blue_bars' );
		makeLabels( graph, data, xScale, yScale, ds, dispatch, 'blue_bars' );

		dispatch.on( 'filter.' + element, function () {
			var new_data = ds.groupBy( groupBy, true );
			makeBars( graph, new_data, xScale, yScale, ds, dispatch, 'blue_bars' );
		} );
	}


	/*---Bubble Graph---------*/
	bubbleGraph = function ( elementId, data, color, dispatch ) {
		var margin = { top: 10, right: 10, bottom: 10, left: 10 },
			width = $( '#' + elementId ).width() - margin.left - margin.right,
			height = $( '#' + elementId ).height() - margin.top - margin.bottom;
		var graph = d3.select( '#' + elementId )
			.append( 'svg' )
			.attr( 'width', width + margin.left + margin.right )
			.attr( 'height', height + margin.top + margin.bottom )
			.append( 'g' )
			.attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')');

		function makeCircles ( data, color ) {
			var max = d3.max( data, function ( d ) {
				return d.requests;
			} );

			var gap = max / 10;
			var yCentre = max / 2;
			var distance = gap;

			data.forEach( function ( d ) {
				distance += d.requests / 2;
				d.x = distance;
				distance += d.requests / 2;
				distance += gap;
			} );

			var xScale = d3.scale.linear()
				.domain( [ 0, distance ] )
				.range( [ 0, width ] );

			var yScale = d3.scale.linear()
				.domain( [ 0, max ] )
				.range( [ 0, height ] );

			data.forEach( function ( d ) {
				if ( xScale( d.requests / 2 ) < 50 ) {
					d.tiny = true;
				}
			} );

			var circles = graph.selectAll( 'circle' ).data( data, function ( d ) {
				return d.company;
			} );

			circles
				.enter()
				.append( 'circle' )
				.attr( 'cx', 0 )
				.attr( 'cy', yScale( yCentre ) )
				.attr( 'r', 0 );

			circles
				.transition()
				.attr( 'fill', color )
				.attr( 'cx', function ( d ) {
					return xScale( d.x );
				} )
				.attr( 'cy', function ( d ) {
					return yScale( yCentre );
				} )
				.attr( 'r', function ( d ) {
					return 10 + xScale( d.requests / 2 ); // Should we add this constant?
				} );

			var dots = graph.selectAll( 'circle.dots' ).data( data, function ( d ) {
				return d.company;
			} );

			dots
				.enter()
				.append( 'circle' )
				.attr( 'class', 'dots' )
				.attr( 'cx', 0 )
				.attr( 'cy', yScale( yCentre ) )
				.attr( 'r', 0 );

			dots
				.transition()
				.attr( 'cx', function ( d ) {
					return xScale( d.x );
				} )
				.attr( 'cy', function ( d ) {
					return yScale( yCentre );
				} )
				.attr( 'r', '3' );

			var axis = graph.selectAll( 'line.center' ).data( [0] ); // FIXME
			axis.enter().append( 'line' ).attr( 'class', 'center' );
			axis
				.attr( 'x1', 0 )
				.attr( 'x2', width )
				.attr( 'y1', yScale( yCentre ) )
				.attr( 'y2', yScale( yCentre ) );


			var companyLabel = graph.selectAll( 'text.company' ).data( data, function ( d ) {
				return d.company;
			} );

			companyLabel
				.enter()
				.append( 'text' )
				.attr( 'class', function ( d ) {
					return ( d.tiny ) ? "out_of_circle" : "in_circle";
				} )
				.classed( 'company', true );

			companyLabel
				.attr( 'class', function ( d ) {
					return ( d.tiny ) ? "out_of_circle" : "in_circle";
				} )
				.classed( 'company', true )
				.html( function ( d ) {
					return d.company;
				} )
				.transition()
				.attr( 'x', function ( d ) {
					return xScale( d.x );
				} )
				.attr( 'y', function ( d ) {
					return yScale( yCentre );
				} )
				.attr( 'dy', function ( d, i ) {
					if ( d.tiny ) {
						return ( ( height / 2 ) - ( ( i + 1 ) * 20 ) ) * -1;
					} else {
						return -10;
					}
				} )
				.attr( 'dx', function ( d ) {
					return ( d.tiny ) ? 5 : 0;
				} );

			var requestLabel = graph.selectAll( 'text.request' ).data( data, function ( d ) {
				return d.company;
			} );

			requestLabel
				.enter()
				.append( 'text' )
				.attr( 'class', function ( d ) {
					return ( d.tiny ) ? "out_of_circle" : "in_circle";
				} )
				.classed( 'request', true );

			requestLabel
				.attr( 'class', function ( d ) {
					return ( d.tiny ) ? "out_of_circle" : "in_circle";
				} )
				.classed( 'request', true )
				.html( function ( d ) {
					return Number( d.requests ).toLocaleString() + ' requests';
				} )
				.transition()
				.attr( 'x', function ( d ) {
					return xScale( d.x );
				} )
				.attr( 'y', function ( d ) {
					return yScale( yCentre );
				} )
				.attr( 'dy', function ( d, i ) {
					if ( d.tiny ) {
						return ( height / 2 ) - ( ( i + 1 ) * 15 );
					} else {
						return 20;
					}
				} )
				.attr( 'dx', function ( d ) {
					return ( d.tiny ) ? 5 : 0;
				} );

			var topLine = graph.selectAll( 'line.topline' ).data( data, function ( d ) {
				return d.company;
			} );

			topLine.enter().append( 'line' ).attr( 'class', 'topline' );

			topLine
				.transition()
				.attr( 'x1', function ( d ) {
					return xScale( d.x );
				} )
				.attr( 'x2', function ( d ) {
					return xScale( d.x );
				} )
				.attr( 'y1', function ( d ) {
					return yScale( yCentre ) - xScale( d.requests / 2 ) - 15;
				} )
				.attr( 'y2', function ( d, i ) {
					return ( ( i + 1 ) * 20 ) - 10;
				} )
				.style( 'opacity', function ( d ) {
					return ( d.tiny ) ? 1 : 0;
				} );

			topLine.exit().remove();


			var bottomLine = graph.selectAll( 'line.bottomline' ).data( data, function ( d ) {
				return d.company;
			} );

			bottomLine.enter().append( 'line' ).attr( 'class', 'bottomline' );

			bottomLine
				.transition()
				.attr( 'x1', function ( d ) {
					return xScale( d.x );
				} )
				.attr( 'x2', function ( d ) {
					return xScale( d.x );
				} )
				.attr( 'y1', function ( d ) {
					return yScale( yCentre ) + xScale( d.requests / 2 ) + 15;
				} )
				.attr( 'y2', function ( d, i ) {
					return height - ( ( i + 1 ) * 15 );
				} )
				.style( 'opacity', function ( d ) {
					return ( d.tiny ) ? 1 : 0;
				} );

			bottomLine.exit().remove();


		}

		makeCircles ( data, color );

		dispatch.on( 'complied.' + elementId, function ( data, color ) {
			makeCircles ( data, color );
		} );
	}

	/*---DOM Ready---------*/
	$( function () {
		d3.json( '/data/privacy.json', function ( error, data ) {
			if ( error ) throw error;
			var ds = new Requests();
			ds.init( data );
			var dispatch = d3.dispatch( 'filter' );
			var tooltip = d3
				.select( 'body' )
				.append( 'div' )
				.attr( 'class', 'graph_tooltip' )
				.style( 'display', 'none' );

			horizontalGraph( 'bar_graph_by_country', 'country', ds, dispatch, tooltip );
			horizontalGraph( 'bar_graph_by_type', 'type', ds, dispatch, tooltip );
			horizontalGraph( 'bar_graph_by_disclosed', 'disclosed', ds, dispatch, tooltip );
		} );

		d3.json( '/data/comparison.json', function ( error, data ) {
			if ( error ) throw error;
			var dispatch = d3.dispatch( 'complied' );
			bubbleGraph( 'compare_graph', data.allRequests, '#5A93FD', dispatch );

			$( '#complied_requests_check' ).click( function ( e ) {
				if ( $( this ).prop( 'checked' ) ) {
					dispatch.complied( data.compliedRequests, '#C70000' );
				} else {
					dispatch.complied( data.allRequests, '#5A93FD' );
				}
			} );
		} );
	} );

} ( d3, jQuery ) )
