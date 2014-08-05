;( function ( d3, $ ) {

	var codes = {
		"Argentina": "ar",
		"Austria": "at",
		"Australia": "au",
		"Belgium": "be",
		"Bangladesh": "bd",
		"Bulgaria": "bg",
		"Chile": "cl",
		"Denmark": "dk",
		"Hong Kong": "hk",
		"Ireland": "ie",
		"Israel": "il",
		"Iran": "ir",
		"Italy": "it",
		"South Korea": "kr",
		"Luxembourg": "lu",
		"Latvia": "lv",
		"Mexico": "mx",
		"Malaysia": "my",
		"Netherlands": "nl",
		"Norway": "no",
		"Peru": "pe",
		"Poland": "pl",
		"Puerto Rico": "pr",
		"Russia": "ru",
		"Serbia": "rs",
		"Slovenia": "si",
		"Slovakia": "sk",
		"Senegal": "sg",
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
				if ( ( typeof this.filters.duration === 'undefined' ) ||  row.duration === this.filters.duration ) {
					init( row, column );
				}
			}
		}

		if ( asArray ) {
			var array = [];
			for ( var i in data ) {
				array.push( {
					key: i,
					value: data[i]
				} );
			}
			return array;
		} else {
			return data;
		}
	}

	/*---Horizontal Graph---------*/
	horizontalGraph = function ( element, groupBy, ds, dispatch, tooltip ) {
		var data = ds.groupBy( groupBy, true );
		var $el = $( '#' + element );
		var hasFlags = Object.keys(codes).indexOf( data[0].key ) > -1;
		var margin = {
				top: 10,
				right: 10,
				bottom: 10,
				left: ( hasFlags) ? 40 : 20
			},
			width = $el.width() - margin.left - margin.right,
			height = $el.height() - margin.top - margin.bottom;
		var svg = d3.select( '#' + element )
			.append( 'svg' )
			.attr( 'width', width + margin.left + margin.right )
			.attr( 'height', height + margin.top + margin.bottom )
		var graph = svg
			.append( 'g' )
			.attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')');
		var leftOffset = $( svg[0] ).offset().left;
		var leftLine = graph.append( 'line' )
			.attr( 'class', 'left-line' )
			.attr( 'x1', 0 )
			.attr( 'x2', 0 )
			.attr( 'y1', 20 )
			.attr( 'y2', height - 10 );


		var y_range = [];
		for( var i = 0; i < data.length; i++ ) y_range.push( i );
		var yScale = d3.scale.ordinal()
			.domain( data.map( function ( d ) {
				return d.key;
			 } ) )
			.range( y_range );

		var xScale = d3.scale.linear()
			.domain( [0, d3.max( data, function (d) {
				var total = d.value.reduce( function ( p, c, i, a ) {
					return p + c;
				} );
				return total;
			} ) ] )
			.range( [ 0, width ] );

		function makeBars( graph, data, yScale, ds, dispatch, className, timerange ) {

			var height = ( data.length * 40 ) + 40;

			$el.height( height );
			svg.attr( 'height', height );

			if ( timerange === true ) {
				xScale = d3.scale.linear()
				.domain( [0, d3.max( data, function (d) {
					var total = d.value.reduce( function ( p, c, i, a ) {
						return p + c;
					} );
					return total;
				} ) ] )
				.range( [ 0, width ] );
			}

			var y_range = [];
			for( var i = 0; i < data.length; i++ ) y_range.push( i );
			var yScale = d3.scale.ordinal()
				.domain( data.map( function ( d ) {
					return d.key;
				 } ) )
				.range( y_range );

			var leftLine = graph.append( 'line' )
				.attr( 'class', 'left-line' )
				.attr( 'x1', 0 )
				.attr( 'x2', 0 )
				.attr( 'y1', 20 )
				.attr( 'y2', height - 10 );

			var stackedData = [], xData = [];

			data.forEach( function ( d ) {
				xData[d.key] = d.value[0] + d.value[1];
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

			function findData( key, disclosed ) {
				return stackedData.filter( function ( d ) {
					return ( d.key === key && d.disclosed === disclosed )
				} )[ 0 ];
			}

			function getDsValues( country ) {
				if ( !hasFlags ) return false;
				return ds.groupBy( 'country' ).filter( function ( d ) {
					return d.country === country;
				} )[ 0 ];
			}

			var bar = graph.selectAll( 'rect.' + className ).data( stackedData, function ( d, i ) {
				return d.key + d.disclosed;
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
				.attr( 'class', className );

			bar
				.on( 'mouseover', function ( d ) {
					var
						content = "",
						numDisclosed = Number( findData( d.key, true ).value ),
						numUndisclosed = Number( findData( d.key, false ).value ),
						top = $( d3.event.target ).offset().top,
						left = leftOffset + xScale( xData[ d.key ] );

					left += ( hasFlags ) ? 50 : 30;

					if (
						hasFlags &&
						( Object.keys( ds.filters ).length !== 0 &&
						typeof ds.filters.type !== "undefined" )
					) {
						var filteredData = ds.groupBy( 'country' )[ d.key ];
						var filter = ds.filters.type;
						content = "<b>" + filter + " Requests</b>"
							+ "<span>" +  ( Number(filteredData[ 0 ] ) + Number( filteredData[ 1 ] ) ) + "</span>"
							+ "<b>Information Produced For</b>"
							+ "<span>" + filteredData[ 1 ] + "</span>";
					}

					if ( content === "" ) {
						content = '<b>Total Requests</b>'
							+ '<span>' + ( numDisclosed + numUndisclosed ) + '</span>'
							+ '<b>Information Produced For</b>'
							+ '<span>' + numDisclosed + '</span>';
					}

					return tooltip
						.html( content )
						.style( 'top', top + 'px' )
						.style( 'left', left + 'px' )
						.style( 'display', 'block' );
				} )
				.on( 'mouseout', function () {
					return tooltip.style( 'display', 'none' );
				} )
				.attr( 'height', '12' )
				.attr( 'y', function ( d ) {
					return ( ( yScale( d.key ) + 1 ) * 40 ) + 3;
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
			bar.exit().remove();


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
				.on( 'mouseover', function ( d ) {
					var
						content = "",
						numDisclosed = Number( findData( d.key, true ).value ),
						numUndisclosed = Number( findData( d.key, false ).value ),
						top = $( d3.event.target ).offset().top + 20,
						left = leftOffset + xScale( xData[ d.key ] );

					left += ( hasFlags ) ? 50 : 30;

					if (
						hasFlags &&
						( Object.keys( ds.filters ).length !== 0 &&
						typeof ds.filters.type !== "undefined" )
					) {
						var filteredData = ds.groupBy( 'country' )[ d.key ];
						var filter = ds.filters.type;
						content = "<b>" + filter + " Requests</b>"
							+ "<span>" +  ( Number(filteredData[ 0 ] ) + Number( filteredData[ 1 ] ) ) + "</span>"
							+ "<b>Information Produced For</b>"
							+ "<span>" + filteredData[ 1 ] + "</span>";
					}

					if ( content === "" ) {
						content = '<b>Total Requests</b>'
							+ '<span>' + ( numDisclosed + numUndisclosed ) + '</span>'
							+ '<b>Information Produced For</b>'
							+ '<span>' + numDisclosed + '</span>';
					}

					return tooltip
						.html( content )
						.style( 'top', top + 'px' )
						.style( 'left', left + 'px' )
						.style( 'display', 'block' );
				} )
				.on( 'mouseout', function () {
					return tooltip.style( 'display', 'none' );
				} )
				.attr( 'y', function ( d, i ) {
					return ( i + 1 ) * 40;
				} )
				.attr( 'dy', -3 )
				.attr( 'x', 5 )
				.html( function ( d ) {
					return d.key;
				} );
			labels.exit().remove()

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
					.on( 'mouseover', function ( d ) {
						var
							content = "",
							numDisclosed = Number( findData( d.key, true ).value ),
							numUndisclosed = Number( findData( d.key, false ).value ),
							top = $( d3.event.target ).offset().top + 10,
							left = leftOffset + xScale( xData[ d.key ] );

						left += ( hasFlags ) ? 50 : 30;

						if (
							hasFlags &&
							( Object.keys( ds.filters ).length !== 0 &&
							typeof ds.filters.type !== "undefined" )
						) {
							var filteredData = ds.groupBy( 'country' )[ d.key ];
							var filter = ds.filters.type;
							content = "<b>" + filter + " Requests</b>"
								+ "<span>" +  ( Number(filteredData[ 0 ] ) + Number( filteredData[ 1 ] ) ) + "</span>"
								+ "<b>Information Produced For</b>"
								+ "<span>" + filteredData[ 1 ] + "</span>";
						}

						if ( content === "" ) {
							content = '<b>Total Requests</b>'
								+ '<span>' + ( numDisclosed + numUndisclosed ) + '</span>'
								+ '<b>Information Produced For</b>'
								+ '<span>' + numDisclosed + '</span>';
						}

						return tooltip
							.html( content )
							.style( 'top', top + 'px' )
							.style( 'left', left + 'px' )
							.style( 'display', 'block' );
					} )
					.on( 'mouseout', function () {
						return tooltip.style( 'display', 'none' );
					} )
					.attr( 'width', 28 )
					.attr( 'height', 16 )
					.attr( 'xlink:href', function ( d ) {
						return '/images/flags_svg/' + codes[ d.key ] + '.svg';
					} )
					.attr( 'y', function ( d, i ) {
						return ( ( i + 1 ) * 40 ) - 8;
					} )
					.attr( 'x', -33 );
				flags.exit().remove()
			}

		}

		makeBars( graph, data, yScale, ds, dispatch, 'gray_bars', true );
		makeBars( graph, data, yScale, ds, dispatch, 'blue_bars', true );


		dispatch.on( 'filter.' + element, function () {
			var new_data = ds.groupBy( groupBy, true );
			makeBars( graph, new_data, yScale, ds, dispatch, 'blue_bars' );
		} );

		dispatch.on( 'timerange.' + element, function () {
			var new_data = ds.groupBy( groupBy, true );
			makeBars( graph, new_data, yScale, ds, dispatch, 'gray_bars', true );
			makeBars( graph, new_data, yScale, ds, dispatch, 'blue_bars', true );
		} );

	}


	/*---Bubble Graph---------*/
	bubbleGraph = function ( elementId, data, dispatch, tooltip ) {

		var margin = { top: 10, right: 10, bottom: 10, left: 10 },
			width = $( '#' + elementId ).width() - margin.left - margin.right,
			height = $( '#' + elementId ).height() - margin.top - margin.bottom;
		var svg = d3.select( '#' + elementId )
			.append( 'svg' )
		var graph = svg
			.attr( 'width', width + margin.left + margin.right )
			.attr( 'height', height + margin.top + margin.bottom )
			.append( 'g' )
			.attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')');
		var leftOffset = $( svg[0] ).offset().left;

		var topOffset = $( graph[0] ).offset().top;
		function makeCircles ( csv_data ) {
			var data = csv_data;

			var max = d3.max( data, function ( d ) {
				return d.requests;
			} );

			var gap = max / 4;
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
				if ( xScale( d.requests / 2 ) < 40 ) {
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
				.on( 'mouseover', function ( d ) {
					return tooltip
						.html( '<b>Total Requests</b><span>' + d.requests + '</span>'
							+ '<b>Information Produced</b><span>' + d.complied + '</span>'
						 )
						.style( 'top', topOffset - xScale( d.requests / 2) + 20  + 'px' )
						.style( 'left', leftOffset + xScale( d.x ) - 60 + 'px' )
						.style( 'display', 'block' );
				} )
				.on( 'mouseout', function () {
					return tooltip.style( 'display', 'none' );
				} )

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
				.on( 'mouseover', function ( d ) {
					return tooltip
						.html( '<b>Total Requests</b><span>' + d.requests + '</span>'
							+ '<b>Information Produced</b><span>' + d.complied + '</span>'
						 )
						.style( 'top', topOffset - xScale( d.requests/2) + 20  + 'px' )
						.style( 'left', leftOffset + xScale( d.x ) - 60 + 'px' )
						.style( 'display', 'block' );
				} )
				.on( 'mouseout', function () {
					return tooltip.style( 'display', 'none' );
				} )
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
						return ( height / 2 ) - ( ( i + 1 ) * 30 );
					} else {
						return 4;
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
					return yScale( yCentre ) + xScale( d.requests / 2 ) + 5;
				} )
				.attr( 'y2', function ( d, i ) {
					return height - ( ( i + 2 ) * 27 );
				} )
				.style( 'opacity', function ( d ) {
					return ( d.tiny ) ? 1 : 0;
				} );

			bottomLine.exit().remove();


		}

		makeCircles ( data );
	}

	/*---DOM Ready---------*/
	$( function () {
		d3.csv( '/data/other_companies.csv', convertNumbers, function ( error, data ) {
			if ( error ) throw error;
			var dispatch = d3.dispatch( 'timerange' );
			var tooltip = d3
				.select( 'body' )
				.append( 'div' )
				.attr( 'class', 'bubble_tooltip' )
				.style( 'display', 'none' );

			bubbleGraph( 'compare_graph', data, dispatch, tooltip );
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
							"disclosed": disclosed,
							"duration": d.duration
						} );
					}
				}

				addFact( d[ 'Country' ], 'Criminal Subpoenas', 'Yes', d[ 'Criminal Subpoena Complied' ] );
				addFact( d[ 'Country' ], 'Criminal Subpoenas', 'No', d[ 'Criminal Subpoena' ] - d[ 'Criminal Subpoena Complied' ] );
				addFact( d[ 'Country' ], 'Informal Non-Government Requests', 'Yes', d[ 'Informal Request Complied' ] );
				addFact( d[ 'Country' ], 'Informal Non-Government Requests', 'No', d[ 'Informal Request' ] - d[ 'Informal Request Complied' ] );
				addFact( d[ 'Country' ], 'Informal Government Requests', 'Yes', d[ 'Government Complied' ] );
				addFact( d[ 'Country' ], 'Informal Government Requests', 'No', d[ 'Government' ] - d[ 'Government Complied' ] );
				addFact( d[ 'Country' ], 'Civil Subpoenas', 'Yes', d[ 'Civil Subpoena Complied' ] );
				addFact( d[ 'Country' ], 'Civil Subpoenas', 'No', d[ 'Civil Subpoena' ] - d[ 'Civil Subpoena Complied' ] );
			} );
			data = facts;

			var ds = new Requests();
			ds.init( data );
			ds.filters.duration = "jul12jun13";
			var dispatch = d3.dispatch( 'filter', 'timerange' );
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

			$( '.user_data_tabs' ).click( function () {
				$( '.user_data_tabs' ).removeClass( 'active' );
				$( this ).addClass( 'active' );
				var duration = $( this ).attr( 'id' ).split( '_' )[ 2 ];
				if ( duration === 'all' ) {
					delete ds.filters.duration;
				} else {
					ds.filters.duration = duration;
				}
				delete ds.filters.type;
				delete ds.filters.country;
				$( '#by_country_show_all, #request_type_show_all' ).addClass( 'disabled' );
				dispatch.timerange();
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
