;( function ( d3, $ ) {

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
				data[ row[ column ] ] = [ 0, 0 ];
			}
		}

		function increment( row, column ) {
			init( row, column );
			var index = ( row.disclosed === 'Yes' ) ? 0 : 1;
			data[ row[ column ] ][ index ]  += 1;
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

	/*---Horizontal Graph---------*/
	horizontalGraph = function ( element, groupBy, ds, dispatch, tooltip ) {
		var data = ds.groupBy( groupBy, true );
		var hasFlags = Object.keys(codes).indexOf( data[0].key ) > -1;
		var margin = {
				top: 10,
				right: 10,
				bottom: 10,
				left: ( hasFlags) ? 40 : 20
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
		var yScale = d3.scale.ordinal()
			.domain( data.map( function ( d ) {
				return d.key;
			 } ) )
			.rangeRoundBands( [ margin.top, height ], 0.6 );
		var xScale = d3.scale.linear()
			.domain( [0, d3.max( data, function (d) {
				var total = d.value.reduce( function ( p, c, i, a ) {
					return p + c;
				} );
				return total;
			} ) ] )
			.range( [ 0, width ] );


		function makeLabels( graph, data, xScale, yScale, ds, dispatch, className ) {
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
				.attr( 'x', 5 )
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
					.attr( 'class', className )
					.classed( 'flag', true);

				flags
					.attr( 'width', 28 )
					.attr( 'height', 16 )
					.attr( 'xlink:href', function ( d ) {
						return '/images/flags_svg/' + codes[ d.key ] + '.svg';
					} )
					.attr( 'y', function ( d ) {
						return yScale( d.key ) - 8;
					} )
					.attr( 'x', -33 );
			}
		}

		function makeBars( graph, data, xScale, yScale, ds, dispatch, className ) {

			var stackedData = [];
			data.forEach( function ( d ) {
				stackedData.push( {
					key: d.key,
					disclosed: true,
					value: d.value[0],
					x: d.value[1]
				} );
				stackedData.push( {
					key: d.key,
					disclosed: false,
					value: d.value[1],
					x: 0
				} );
			} );

			var bar = graph.selectAll( 'rect.' + className ).data( stackedData )
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
						var numDisclosed, numTotal;
						stackedData.forEach( function( sd ) {
							if ( sd.key === d.key ) {
								if ( sd.disclosed === true ) {
									numDisclosed = sd.value;
								} else {
									numTotal = sd.value;
								}

							}
						} );

					return tooltip
						.html( '<b>' + d.key + '</b>'
							+ '<span>' + numTotal + '</span>'
							+ '<b>Something</b>'
							+ '<span>' + numDisclosed + '</span>' )
						.style( 'top', ( d3.event.pageY - 25 ) + 'px' )
						.style( 'left', ( d3.event.pageX + 25 ) + 'px' );
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
				.classed( 'disclosed', function ( d ) {
					return d.disclosed;
				} )
				.transition()
				.attr( 'x', function ( d ) {
					return xScale( d.x );
				} )
				.attr( 'width', function ( d ) {
					return xScale( d.value );
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
	bubbleGraph = function ( elementId, data, dispatch, year ) {

		var margin = { top: 10, right: 10, bottom: 10, left: 10 },
			width = $( '#' + elementId ).width() - margin.left - margin.right,
			height = $( '#' + elementId ).height() - margin.top - margin.bottom;
		var graph = d3.select( '#' + elementId )
			.append( 'svg' )
			.attr( 'width', width + margin.left + margin.right )
			.attr( 'height', height + margin.top + margin.bottom )
			.append( 'g' )
			.attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')');

		function makeCircles ( csv_data, year ) {
			var data = [];

			csv_data.forEach( function ( d ) {
				var row = {};
				row.company = d['Name'];
				if ( year === '2013' ) {
					row.requests = +d['Total 2013'];
					row.complied = +d['Complied 2013'];
				} else if ( year === '2012' ) {
					row.requests = +d['Total 2012'];
					row.complied = +d['Complied 2012'];
				} else {
					row.requests = (+d['Total 2013']) + (+d['Total 2012']);
					row.complied = (+d['Complied 2013']) + (+d['Complied 2012']);
				}

				if ( row.requests !== 0 ) {
					data.push( row );
				}
			} );

			var max = d3.max( data, function ( d ) {
				return d.requests;
			} );

			var gap = max / 5;
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

			var circles = graph.selectAll( 'circle.all_requests' ).data( data, function ( d ) {
				return d.company;
			} );

			circles
				.enter()
				.append( 'circle' )
				.attr( 'class', 'all_requests' )
				.attr( 'cx', function ( d ) {
					return xScale( d.x );
				} )
				.attr( 'cy', function ( d ) {
					return yScale( yCentre );
				} )
				.attr( 'r', 0 );

			circles
				.transition()
				.attr( 'cx', function ( d ) {
					return xScale( d.x );
				} )
				.attr( 'cy', function ( d ) {
					return yScale( yCentre );
				} )
				.attr( 'r', function ( d ) {
					return 1 + xScale( d.requests / 2 ); // Should we add this constant?
				} );

			circles.exit().remove()

			var complied_requests = graph.selectAll( 'circle.complied_requests' ).data( data, function ( d ) {
				return d.company;
			} );

			complied_requests
				.enter()
				.append( 'circle' )
				.attr( 'class', 'complied_requests' )
				.attr( 'cx', function ( d ) {
					return xScale( d.x );
				} )
				.attr( 'cy', function ( d ) {
					return yScale( yCentre );
				} )
				.attr( 'r', '0' );

			complied_requests
				.transition()
				.attr( 'cx', function ( d ) {
					return xScale( d.x );
				} )
				.attr( 'cy', function ( d ) {
					return yScale( yCentre );
				} )
				.attr( 'r', function ( d ) {
					return 1 + xScale( d.complied / 2 ); // Should we add this constant?
				} );

			complied_requests.exit().remove();

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
						return ( height / 2 ) - ( ( i + 1 ) * 15 );
					} else {
						return 0;
					}
				} )
				.attr( 'dx', function ( d ) {
					return ( d.tiny ) ? 5 : 0;
				} );

			companyLabel.exit().remove();

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
					return height - ( ( i + 2 ) * 15 );
				} )
				.style( 'opacity', function ( d ) {
					return ( d.tiny ) ? 1 : 0;
				} );

			bottomLine.exit().remove();


		}

		makeCircles ( data, year );

		dispatch.on( 'timerange.' + elementId, function ( year ) {
			makeCircles ( data, year );
		} );
	}

	/*---DOM Ready---------*/
	$( function () {
		d3.csv( '/data/other_companies.csv', function ( error, data ) {
			if ( error ) throw error;
			var dispatch = d3.dispatch( 'timerange' );
			bubbleGraph( 'compare_graph', data, dispatch, '2013' );

			$( '#bubble_all' ).click( function ( e ) {
				$( '.bubble_time' ).removeClass( 'active' );
				$( this ).addClass( 'active' );
				dispatch.timerange( 'all' );
			} );

			$( '#bubble_12' ).click( function ( e ) {
				$( '.bubble_time' ).removeClass( 'active' );
				$( this ).addClass( 'active' );
				dispatch.timerange( '2012' );
			} );

			$( '#bubble_13' ).click( function ( e ) {
				$( '.bubble_time' ).removeClass( 'active' );
				$( this ).addClass( 'active' );
				dispatch.timerange( '2013' );
			} );
		} );

		function convertNumbers(row) {
			var r = {};
			for (var k in row) {
				r[k] = +row[k];
				if (isNaN(r[k])) {
					r[k] = row[k];
				}
			}
			return r;
		}

		d3.csv( '/data/sum.csv', convertNumbers, function ( data ) {
			var facts = { requests: [] };
			data.forEach( function ( d ) {
				if ( d[ 'Total' ] !== ( d[ 'Criminal Subpoena' ] +
					d[ 'Informal Request' ] +
					d[ 'Government' ] +
					d[ 'Civil Subpoena' ] ) )
				{
					throw new Error ( 'The requests don\'t add up for ' + d[ 'Country' ]);
				}

				function addFact( country, type, disclosed, q ) {
					for( var i = 0; i < q; i++ ) {
						facts.requests.push( {
							"country": country,
							"type": type,
							"disclosed": disclosed
						} );
					}
				}

				addFact( d[ 'Country' ], 'Criminal Subpoena', 'Yes', d[ 'Criminal Subpoena Complied' ] );
				addFact( d[ 'Country' ], 'Criminal Subpoena', 'No', d[ 'Criminal Subpoena' ] - d[ 'Criminal Subpoena Complied' ] );
				addFact( d[ 'Country' ], 'Informal Request', 'Yes', d[ 'Informal Request Complied' ] );
				addFact( d[ 'Country' ], 'Informal Request', 'No', d[ 'Informal Request' ] - d[ 'Informal Request Complied' ] );
				addFact( d[ 'Country' ], 'Government', 'Yes', d[ 'Government Complied' ] );
				addFact( d[ 'Country' ], 'Government', 'No', d[ 'Government' ] - d[ 'Government Complied' ] );
				addFact( d[ 'Country' ], 'Civil Supoena', 'Yes', d[ 'Civil Subpoena Complied' ] );
				addFact( d[ 'Country' ], 'Civil Subpoena', 'No', d[ 'Civil Subpoena' ] - d[ 'Civil Subpoena Complied' ] );
			} );
			data = facts;

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

			$( '#by_country_show_all' ).click( function () {
				delete ds.filters[ 'country' ];
				dispatch.filter();
			} );

			$( '#request_type_show_all' ).click( function () {
				delete ds.filters[ 'type' ];
				dispatch.filter();
			} );

			dispatch.on( 'filter.show_all', function () {
				$( '#by_country_show_all, #request_type_show_all' ).addClass( 'disabled' );
				if ( ds.filters.country ) {
					$( '#by_country_show_all' ).removeClass( 'disabled' );
				}
				if ( ds.filters.type ) {
					$( '#request_type_show_all' ).removeClass( 'disabled' );
				}
			} );
		} );
	} );

} ( d3, jQuery ) )
