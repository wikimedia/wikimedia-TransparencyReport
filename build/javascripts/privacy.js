;( function ( d3, $ ) {

	var codes = {
		"Argentina": "ar",
		"Bangladesh": "bd",
		"Austria": "at",
		"Australia": "au",
		"Belgium": "be",
		"Bulgaria": "bg",
		"Chile": "cl",
		"Denmark": "dk",
		"Hong Kong": "hk",
		"Ireland": "ie",
		"Israel": "il",
		"Iran": "ir",
		"Italy": "it",
		"South Korea": "kr",
		"Korea": "kr",
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
		"Saudi Arabia": "sa",
		"Serbia": "rs",
		"Slovenia": "si",
		"Slovakia": "sk",
		"Senegal": "sn",
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
		"Japan": "jp",
		"Czech Republic": "cz",
		"Sweden": "se",
		"Turkey": "tr",
		"Greece": "gr",
		"Cyprus": "cy",
		"Ukraine": "ua",
		"Taiwan": "tw",
		"Suriname": "sr",
		"Romania": "ro",
		"Indonesia": "id",
		"Liechtenstein": "li",
		"Philippines": "ph",
		"South Africa": "za",
		"Tanzania": "tz",
		"Portugal": "pt",
		"Hungary": "hu",
		"Venezuela": "ve",
		"Croatia": "hr",
		"Ecuador": "ec",
		"Egypt": "eg",
		"Estonia": "ee",
		"Finland": "fi",
		"Georgia": 'ge',
		"Malta": "mt",
		"Morocco": "ma",
		"Dominican Republic": "do"
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
				data[ row[ column ] ] = [ 0, 0, 0 ];
			}
		}

		function increment( row, column ) {
			init( row, column );
			var index;
			switch (row.disclosed) {
				case 'All':
					index = 0;
					break;
				case 'No':
					index = 1;
					break;
				case 'Partial':
					index = 2;
					break;
			}
			// var index = ( row.disclosed === 'All' ) ? 0 : 1;
			// console.log(row, column, index)
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
				.range( [ 20, width ] );
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
					disclosed: 'all',
					value: d.value[0],
					x: d.value[1] + d.value[2]
				} );
				stackedData.push( {
					key: d.key,
					disclosed: 'partial',
					value: d.value[2],
					x: d.value[1]
				} );
				stackedData.push( {
					key: d.key,
					disclosed: 'no',
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
						disclosedAll = Number( findData( d.key, 'all' ).value ),
						disclosedPartial = Number( findData( d.key, 'partial' ).value ),
						disclosedNone = Number( findData( d.key, 'no' ).value ),
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
						content = "<b>" + filter + "</b>"
							+ "<span>" +  ( Number(filteredData[ 0 ] ) + Number( filteredData[ 1 ] ) + Number( filteredData[ 2 ] ) ) + "</span>"
							+ "<b>" + $( '#t_information_produced_all' ).val() + "</b>"
							+ "<span>" + filteredData[ 0 ] + "</span>"
							+ "<b class='partial-data'>" + $( '#t_information_produced_partial' ).val() + "</b>"
							+ "<span class='partial-data'>" + filteredData[ 2 ] + "</span>";
					}

					if ( content === "" ) {
						content = '<b>' + $( '#t_total_requests' ).val() + '</b>'
							+ '<span>' + ( disclosedAll + disclosedPartial + disclosedNone ) + '</span>'
							+ '<b>' + $( '#t_information_produced_all' ).val() + '</b>'
							+ '<span>' + disclosedAll + '</span>'
							+ '<b class="partial-data">' + $( '#t_information_produced_partial' ).val() + '</b>'
							+ '<span class="partial-data">' + disclosedPartial + '</span>'
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
				.classed( 'disclosed--all', function ( d ) {
					// console.log(d)
					return d.disclosed === 'all';
				} )
				.classed( 'disclosed--partial', function ( d ) {
					// console.log(d)
					return d.disclosed === 'partial';
				} )
				.classed( 'disclosed--none', function ( d ) {
					// console.log(d)
					return d.disclosed === 'no';
				} )
				.transition()
				.attr( 'x', function ( d ) {
					return xScale( d.x ) - 20;
				} )
				.attr( 'width', function ( d ) {
					if ( d.value === 0) return 0;
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
						disclosedAll = Number( findData( d.key, 'all' ).value ),
						disclosedPartial = Number( findData( d.key, 'partial' ).value ),
						disclosedNone = Number( findData( d.key, 'no' ).value ),
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
						content = "<b>" + filter + "</b>"
							+ "<span>" +  ( Number(filteredData[ 0 ] ) + Number( filteredData[ 1 ] ) + Number( filteredData[ 2 ] ) ) + "</span>"
							+ "<b>" + $( '#t_information_produced_all' ).val() + "</b>"
							+ "<span>" + filteredData[ 0 ] + "</span>"
							+ "<b class='partial-data'>" + $( '#t_information_produced_partial' ).val() + "</b>"
							+ "<span class='partial-data'>" + filteredData[ 2 ] + "</span>";
					}

					if ( content === "" ) {
						content = '<b>' + $( '#t_total_requests' ).val() + '</b>'
							+ '<span>' + ( disclosedAll + disclosedPartial + disclosedNone ) + '</span>'
							+ '<b>' + $( '#t_information_produced_all' ).val() + '</b>'
							+ '<span>' + disclosedAll + '</span>'
							+ '<b class="partial-data">' + $( '#t_information_produced_partial' ).val() + '</b>'
							+ '<span class="partial-data">' + disclosedPartial + '</span>'
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
				.text( function ( d ) {
					var id = '#t_';
					id += d.key.replace( /\W+/g, ' ' ).split( ' ' ).join( '_').toLowerCase();
					return $( id ).val();
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
					.classed( 'flag', true)
					.each(function(d, i) {
						// add both rect and flag at same position to make it
						// look like a border
						if ( typeof codes[ d.key.split( '*' )[0] ] !== 'undefined' ) {
							graph
							.append('rect')
							.attr({
								'class': 'flagBorder',
								'width': '24',
								'height': '18',
								'y': function() {
									return ( ( i + 1 ) * 40 ) - 8
								},
								'x': '-33'
							})
						}

					})

				flags
					.on( 'mouseover', function ( d ) {
						var
							content = "",
							disclosedAll = Number( findData( d.key, 'all' ).value ),
							disclosedPartial = Number( findData( d.key, 'partial' ).value ),
							disclosedNone = Number( findData( d.key, 'no' ).value ),
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
							content = "<b>" + filter + "</b>"
								+ "<span>" +  ( Number(filteredData[ 0 ] ) + Number( filteredData[ 1 ] ) + Number( filteredData[ 2 ] ) ) + "</span>"
								+ "<b>" + $( '#t_information_produced_all' ).val() + "</b>"
								+ "<span>" + filteredData[ 0 ] + "</span>"
								+ "<b>" + $( '#t_information_produced_partial' ).val() + "</b>"
								+ "<span>" + filteredData[ 2 ] + "</span>";
						}

						if ( content === "" ) {
							content = '<b>' + $( '#t_total_requests' ).val() + '</b>'
								+ '<span>' + ( disclosedAll + disclosedPartial + disclosedNone ) + '</span>'
								+ '<b>' + $( '#t_information_produced_all' ).val() + '</b>'
								+ '<span>' + disclosedAll + '</span>'
								+ '<b>' + $( '#t_information_produced_partial' ).val() + '</b>'
								+ '<span>' + disclosedPartial + '</span>'
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
					.attr( 'width', 24 )
					.attr( 'height', 18 )
					.attr( 'xlink:href', function ( d ) {
						if ( typeof codes[ d.key.split( '*' )[0] ] !== 'undefined' ) {
							return './images/flags_svg/' + codes[ d.key.split( '*' )[0] ] + '.svg';
						}
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
						.html( '<b>' + $( '#t_total_requests' ).val() + '</b><span>' + d.requests + '</span>'
							+ '<b>' + $( '#t_information_produced' ).val() + '</b><span>' + d.complied + '</span>'
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
					return 2 + xScale( d.requests / 2 );
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
						.html( '<b>' + $( '#t_total_requests' ).val() + '</b><span>' + d.requests + '</span>'
							+ '<b>' + $( '#t_information_produced' ).val() + '</b><span>' + d.complied + '</span>'
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
					var ratio = d.complied / d.requests;
						totalRad =  2 + xScale( d.requests / 2 ); // constant for legibility
					return ratio * totalRad;
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
				.text( function ( d ) {
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

	/*---Pie Chart---------*/
	pieChart = function (data) {
		var wrapper = $('.pieChart'),
			width = wrapper.width(),
			height = wrapper.height(),
			radius = Math.min(width, height) / 2;

		var labelFactor, polylineFactor, arc, outerArc;

		// this is to appropriately scale chart slices
	    if (width < 371) {

	        labelFactor = radius * 0.42;
	        polylineFactor = radius * 0.4;

	        arc = d3.svg.arc()
	            .outerRadius(radius * 0.35)
	            .innerRadius(0);

	        outerArc = d3.svg.arc()
	            .innerRadius(radius * 0.4)
	            .outerRadius(radius * 0.4);

	    }
	    else if (width < 431) {

	        labelFactor = radius * 0.5;
	        polylineFactor = radius * 0.48;

	        arc = d3.svg.arc()
	            .outerRadius(radius * 0.35)
	            .innerRadius(0);

	        outerArc = d3.svg.arc()
	            .innerRadius(radius * 0.45)
	            .outerRadius(radius * 0.45);

	    }
	    else if (width < 631) {

	        labelFactor = radius * 0.6;
	        polylineFactor = radius * 0.58;

	        arc = d3.svg.arc()
	            .outerRadius(radius * 0.5)
	            .innerRadius(radius * 0.35);

	        outerArc = d3.svg.arc()
	            .innerRadius(radius * 0.6)
	            .outerRadius(radius * 0.6);

	    } else {

	        labelFactor = radius;
	        polylineFactor = radius * 0.95;

	        arc = d3.svg.arc()
	            .outerRadius(radius * 0.6)
	            .innerRadius(radius * 0.4);

	        outerArc = d3.svg.arc()
	            .innerRadius(radius * 0.95)
	            .outerRadius(radius * 0.95);

	    }

	    var svg = d3.select('.pieChart').append('svg')
	    	.attr({
	    		'width': width,
	    		'height': height
	    	})
	    	.append('g');

	    svg.attr('transform', 'translate(' + width/2 + ', ' + height/2 + ')');

	    svg.append('g')
	    	.attr('class', 'lines')
	    svg.append('g')
	    	.attr('class', 'slices')
	    svg.append('g')
	    	.attr('class', 'labels')

	    var colors = ['#347bff', '#3464bc', '#344e7a', '#343838'];

	    var pie = d3.layout.pie()
	    	.value(function(d) {
	    		return d[1];
	    	})
	    	.sort(null);

	    var slice = svg.select('.slices')
	    	.datum(data)
	    	.selectAll('path')
	    	.data(pie);

	    slice
	    	.enter().append('path')
	    	.attr({
	    		'fill': function(d, i) {
	    			return colors[i];
	    		},
	    		'd': arc,
	    		'class': 'pieChart__slice'
	    	})

	    // this will come handy in positioning our 
	    // lables and lines outside the chart
	    function midAngle(d) {
	    	return d.startAngle + (d.endAngle - d.startAngle) / 2;
	    }

	    var text = svg.select('.labels').selectAll('text')
	    	.data(pie(data))

	    text.enter()
	    	.append('text')
	    	.attr({
	    		'dy': '0.35em',
	    		'class': 'pieChart__label',
	    		'transform': function(d) {
	    			var pos = outerArc.centroid(d);
	    			pos[0] = labelFactor * (midAngle(d) < 3.14 ? 1 : -1);
	    			return 'translate('+ pos +')';
	    		}
	    	})
	    	.style('text-anchor', function(d) {
	    		return midAngle(d) < 3.14 ? 'start' : 'end';
	    	})
	    	.text(function(d) {
	    		return d.data[0];
	    	})

	    text.enter()
	    	.append('text')
	    	.attr({
	    		'dy': '1.35em',
	    		'class': 'pieChart__label',
	    		'transform': function(d) {
	    			var pos = outerArc.centroid(d);
	    			pos[0] = labelFactor * (midAngle(d) < 3.14 ? 1 : -1);
	    			return 'translate('+ pos +')';
	    		}
	    	})
	    	.style('text-anchor', function(d) {
	    		return midAngle(d) < 3.14 ? 'start' : 'end';
	    	})
	    	.text(function(d) {
	    		return ' ( ' + d.data[1] + ' )';
	    	})

	    var polyline = svg.select('.lines').selectAll('polyline')
	    	.data(pie(data));

	    polyline.enter()
	    	.append('polyline')
	    	.attr({
	    		'points': function(d) {
		    		var pos = outerArc.centroid(d);
		    		pos[0] = polylineFactor * (midAngle(d) < 3.14 ? 1 : -1);
		    		return [arc.centroid(d), outerArc.centroid(d), pos];
	    		},
	    		'class': 'pieChart__line' 
	    })

	}


	/*---DOM Ready---------*/
	$( function () {
		d3.csv( './data/other_companies.csv', convertNumbers, function ( error, data ) {
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

		d3.csv( './data/sum.csv', convertNumbers, function ( data ) {
			var facts = { requests: [] };
			data.forEach( function ( d ) {
				if ( d[ 'Total' ] !== ( d[ 'Criminal Subpoena' ] +
					d[ 'Informal Request' ] +
					d[ 'Government' ] +
					d[ 'Civil Subpoena' ] +
					d[ 'Warrant' ] +
					d[ 'Court orders' ] ) )
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

				// console.log(d)

				addFact( d[ 'Country' ], 'Criminal Subpoenas', 'All', d[ 'Criminal Subpoena Complied (All)' ] );
				addFact( d[ 'Country' ], 'Criminal Subpoenas', 'No', d[ 'Criminal Subpoena' ] - d['Criminal Subpoena Complied (Partial)'] - d[ 'Criminal Subpoena Complied (All)' ] );
				addFact( d[ 'Country' ], 'Criminal Subpoenas', 'Partial', d[ 'Criminal Subpoena Complied (Partial)' ] );

				addFact( d[ 'Country' ], 'Informal Non-Government Requests', 'All', d[ 'Informal Request Complied (All)' ] );
				addFact( d[ 'Country' ], 'Informal Non-Government Requests', 'No', d[ 'Informal Request' ] - d['Informal Request Complied (Partial)'] - d[ 'Informal Request Complied (All)' ] );
				addFact( d[ 'Country' ], 'Informal Non-Government Requests', 'Partial', d[ 'Informal Request Complied (Partial)' ] );
				
				addFact( d[ 'Country' ], 'Informal Government Requests', 'All', d[ 'Government Complied (All)' ] );
				addFact( d[ 'Country' ], 'Informal Government Requests', 'No', d[ 'Government' ] - d['Government Complied (Partial)'] - d[ 'Government Complied (All)' ] );
				addFact( d[ 'Country' ], 'Informal Government Requests', 'Partial', d[ 'Government Complied (Partial)' ] );

				addFact( d[ 'Country' ], 'Civil Subpoenas', 'All', d[ 'Civil Subpoena Complied (All)' ] );
				addFact( d[ 'Country' ], 'Civil Subpoenas', 'No', d[ 'Civil Subpoena' ] - d['Civil Subpoena Complied (Partial)'] - d[ 'Civil Subpoena Complied (All)' ] );
				addFact( d[ 'Country' ], 'Civil Subpoenas', 'Partial', d[ 'Civil Subpoena Complied (Partial)' ] );

				addFact( d[ 'Country' ], 'Warrant', 'All', d[ 'Warrant Complied (All)' ] );
				addFact( d[ 'Country' ], 'Warrant', 'No', d[ 'Warrant' ] - d['Warrant Complied (Partial)'] - d[ 'Warrant Complied (All)' ] );
				addFact( d[ 'Country' ], 'Warrant', 'Partial', d[ 'Warrant Complied (Partial)' ] );

				addFact( d[ 'Country' ], 'Court orders', 'All', d[ 'Court orders complied (All)' ] );
				addFact( d[ 'Country' ], 'Court orders', 'No', d[ 'Court orders' ] - d['Court orders complied (Partial)'] - d[ 'Court orders complied (All)' ] );
				addFact( d[ 'Country' ], 'Court orders', 'Partial', d[ 'Court orders complied (Partial)' ] );
			} );

			data = facts;

			var ds = new Requests();
			ds.init( data );
			ds.filters.duration = "janjun16";
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

			var allDataTab = $('#user_data_all'),
				janJun16DataTab = $('#user_data_janjun16'),
				legendPartial = $('#partial'),
				legendYes = $('#yes'),
				legendNo = $('#no'),
				legendAll = $('#all'),
				legendNone = $('#none'),
				graphTooltip = $('.graph_tooltip')

			function updateFlagBorder() {
			
				$('.flagBorder').remove()

				var flags = document.querySelectorAll('#bar_graph_by_country .flag')

				flags.forEach(function(el, i) {

					if (el.getAttribute('href')) {
						d3.select('#bar_graph_by_country svg g')
							.append('rect')
							.attr({
								'class': 'flagBorder',
								'width': '24',
								'height': '18',
								'y': function() {
									return el.getAttribute('y')
								},
								'x': function() {
									return el.getAttribute('x')
								}
							})
					}
				})
			}

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


				if (allDataTab.hasClass('active') || janJun16DataTab.hasClass('active') ) {
					legendPartial.removeClass('inactive')
					legendAll.removeClass('inactive')
					legendNone.removeClass('inactive')
					legendYes.addClass('inactive')
					legendNo.addClass('inactive')

					graphTooltip.removeClass('partialInactive')
				} else {
					legendPartial.addClass('inactive')
					legendAll.addClass('inactive')
					legendNone.addClass('inactive')
					legendYes.removeClass('inactive')
					legendNo.removeClass('inactive')

					graphTooltip.addClass('partialInactive')
				}

				setTimeout(updateFlagBorder, 251);

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

		d3.csv('./data/number_of_disclosures.csv', function( data ) {			

			var transformedData = data.map(function(o) {
				return [o.key, o.value]
			})

			var sum = transformedData.reduce(function(s, i) {
				return s + parseInt(i[1])
			}, 0)

			pieChart(transformedData)

			var totalVal = document.querySelector('.totalValue');
			totalVal.innerHTML = "<span>Total</span><span class='colon'>:</span><span>" + sum + "</span>";

		} );
	} );

} ( d3, jQuery ) )
;
