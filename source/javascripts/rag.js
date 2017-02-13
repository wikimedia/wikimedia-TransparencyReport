;( function ( d3, $ ) {
	var tooltip = d3
		.select( 'body' )
		.append( 'div' )
		.attr( 'class', 'graph_tooltip' )
		.style( 'display', 'none' );

	var codes = {
		"Argentina": "ar",
		"Afghanistan": "af",
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
		"Dominican Republic": "do",
		"Guatemala": "gt",
		"Uruguay": "uy"
	}

	var durationCode = {
		'juldec16': 'Jul - Dec 2016',
		'janjun16': 'Jan - Jun 2016',
		'juldec15': 'Jul - Dec 2015',
		'janjun15': 'Jan - Jun 2015',
		'juldec14': 'Jul - Dec 2014',
		'janjun14': 'Jan - Jun 2014',
		'juldec13': 'Jul - Dec 2013',
		'jul12jun13': 'Jul 2012 - Jun 2013'
	}

	function returnDate(el, dur) {

		if (dur !== 'all') {
			return durationCode[dur]
		}
		else {
			if (el === 'where_from' || el === 'dmca_requests') {
				return 'JUL 2012 - JUN 2016'
			} else {
				return 'JUL 2013 - JUN 2016'
			}
		}

	}

	window.requestsAndGranted = function( data, el, duration ) {
		var current = duration;
		var $el = $( '#' + el + '_graph' );
		var margin = {
				top: 10,
				right: 10,
				bottom: 10,
				left: 40
			},
			width = $el.width() - margin.left - margin.right,
			height = $el.height() - margin.top - margin.bottom;

		var svg = d3.select( '#' + el + '_graph'  )
			.append( 'svg' )
			.attr( 'width', width + margin.left + margin.right )
			.attr( 'height', height + margin.top + margin.bottom )

		var graph = svg
			.append( 'g' )
			.attr( 'transform', 'translate(' + margin.left + ',' + margin.top + ')');
		var leftOffset = $( svg[0] ).offset().left;

		function getData( data, current ) {
			if ( current === 'all' ) {
				var all_data = {}, all_data_array = [];

				data.forEach( function ( d ) {
					if ( all_data[ d.key ] ) {
						all_data[ d.key ].requests += Number( d.requests );
						all_data[ d.key ].complied += Number( d.complied );
					} else {
						all_data[ d.key ] = {};
						all_data[ d.key ].requests = Number( d.requests );
						all_data[ d.key ].complied = Number( d.complied );
					}
				} );

				Object.keys( all_data ).forEach( function ( d ) {
					var row = {
						key: d,
						requests: all_data[ d ].requests,
						complied: all_data[ d ].complied,
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
				var aKey = a.key.toLowerCase(),
					bKey = b.key.toLowerCase();

				if ( a.requests !== b.requests ) {
					return b.requests - a.requests;
				} else {
					if ( aKey < bKey ) return -1;
					if ( aKey > bKey ) return 1;
				}
			} )

			// Put unnamed project at the end
			var names = data.map( function ( d ) {
				return d.key;
			} );
			var unnamed = names.indexOf( 'Unknown' );
			if ( unnamed > -1 ) {
				var unnamed_row = data.splice( unnamed, 1 );
				data.push( unnamed_row[ 0 ] );
			}


			var height = ( data.length * 40 ) + 40;

			$el.height( height );
			svg.attr( 'height', height );

			var y_range = [];
			for( var i = 0; i < data.length; i++ ) y_range.push( i );

			var yScale = d3.scale.ordinal()
				.domain( data.map( function ( d ) {
					return d.key;
				 } ) )
				.range( y_range );

			var xScale = d3.scale.linear()
				.domain( [0, d3.max( data, function (d) {
					return Number( d.requests );
				} ) ] )
				.range( [ 20, width ] );

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
				.attr( 'x', '-100' )
				.style( 'opacity', '0' )
				.attr( 'class', 'blue_bars' );

			labels
				.text( function ( d ) {
					var id = '#t_';
					id += d.key.replace( /\W+/g, ' ' ).split( ' ' ).join( '_').toLowerCase();
					if ($(id).size() === 0)console.log( id );
					return $( id ).val();
				} )
				.on( 'mouseover', function ( d ) {
					var
						numDisclosed = Number( findData( d.key, true ).value ),
						numUndisclosed = Number( findData( d.key, false ).value ),
						top = $( d3.event.target ).offset().top + 20,
						left = leftOffset + xScale( xData[ d.key ] ) + 50,
						content = '<b>' + $( '#t_total_requests' ).val() + '</b>'
							+ '<span>' + ( numDisclosed + numUndisclosed ) + '</span>'
							+ '<b>' + $( '#t_request_granted' ).val() + '</b>'
							+ '<span>' + numDisclosed + '</span>';

					return tooltip
						.html( content )
						.style( 'top', top + 'px' )
						.style( 'left', left + 'px' )
						.style( 'display', 'block' );
				} )
				.on( 'mouseout', function () {
					return tooltip.style( 'display', 'none' );
				} )
				.on( 'click', function ( d ) {
					if ( d.url !== "" && typeof d.url !== 'undefined' ) {
						window.open( '//' + d.url );
					}
				} )
				.classed( 'targeted', function ( d ) {
					return d.url !== "" && typeof d.url !== 'undefined';
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
			} );
			flags
				.enter()
				.append( 'image' )
				.attr( 'class', 'flags' )
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
				.attr( 'width', 24 )
				.attr( 'height', 18 )
				.attr( 'xlink:href', function ( d ) {
					if ( typeof codes[ d.key.split( '*' )[0] ] !== 'undefined' ) {
						return './images/flags_svg/' + codes[ d.key.split( '*' )[0] ] + '.svg';
					}
				} )
				.on( 'mouseover', function ( d ) {
					var
						numDisclosed = Number( findData( d.key, true ).value ),
						numUndisclosed = Number( findData( d.key, false ).value ),
						top = $( d3.event.target ).offset().top + 11,
						left = leftOffset + xScale( xData[ d.key ] ) + 50,
						content = '<b>' + $( '#t_total_requests' ).val() + '</b>'
							+ '<span>' + ( numDisclosed + numUndisclosed ) + '</span>'
							+ '<b>' + $( '#t_request_granted' ).val() + '</b>'
							+ '<span>' + numDisclosed + '</span>';

					return tooltip
						.html( content )
						.style( 'top', top + 'px' )
						.style( 'left', left + 'px' )
						.style( 'display', 'block' );
				} )
				.on( 'mouseout', function () {
					return tooltip.style( 'display', 'none' );
				} )
				.transition()
				.attr( 'y', function ( d, i ) {
					return ( ( i + 1 ) * 40 ) - 8;
				} )
				.attr( 'x', -33 );
			flags.exit().remove();

			var stackedData = [], xData = [];

			data.forEach( function ( d ) {
				xData[d.key] = Number( d.requests );
				stackedData.push( {
					key: d.key,
					disclosed: true,
					value: +d.complied,
					x: Number( d.requests ) - Number(d.complied)
				} );
				stackedData.push( {
					key: d.key,
					disclosed: false,
					value: Number( d.requests ) - Number(d.complied),
					x: 0
				} );
			} );

			function findData( key, disclosed ) {
				return stackedData.filter( function ( d ) {
					return ( d.key === key && d.disclosed === disclosed )
				} )[ 0 ];
			}

			var bar = graph.selectAll( 'rect.blue_bars' ).data( stackedData, function ( d, i ) {
				return d.key + d.disclosed;
			} )
			bar
				.enter()
				.append( 'rect' )
				.attr( 'class', 'blue_bars' );

			bar
				.on( 'mouseover', function ( d ) {
					var
						numDisclosed = Number( findData( d.key, true ).value ),
						numUndisclosed = Number( findData( d.key, false ).value ),
						top = $( d3.event.target ).offset().top,
						left = leftOffset + xScale( xData[ d.key ] ) + 50,
						content = '<b>' + $( '#t_total_requests' ).val() + '</b>'
							+ '<span>' + ( numDisclosed + numUndisclosed ) + '</span>'
							+ '<b>' + $( '#t_request_granted' ).val() + '</b>'
							+ '<span>' + numDisclosed + '</span>';

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
				.attr( 'y', function ( d, i ) {
					return ( ( yScale( d.key ) + 1 ) * 40 ) + 3;
				} )
				.classed( 'disclosed', function ( d ) {
					return d.disclosed;
				} )
				.transition()
				.attr( 'x', function ( d ) {
					return xScale( d.x ) - 20
				} )
				.attr( 'width', function ( d ) {
					if ( d.value === 0 ) return 0
					return xScale( d.value );
				} );
			bar.exit().remove();
		}

		function scorecardValue( data, duration ) {

			var currentData = getData( data, duration )

			var totalReceived = currentData.reduce(function(s, el) {
					return s + Number(el.requests)
			}, 0)

			var totalGranted = currentData.reduce(function(s, el) {
				return s + Number(el.complied)
			}, 0)

			var $nearbyScorecardWrapper = $el.parent().siblings('.col-md-4')

			$nearbyScorecardWrapper.find('.scorecard--1 dd').text(totalReceived)
			$nearbyScorecardWrapper.find('.scorecard--2 dd').text(totalGranted)

			$nearbyScorecardWrapper.find('.scorecard--1 h2').text(returnDate(el, duration))
			$nearbyScorecardWrapper.find('.scorecard--2 h2').text(returnDate(el, duration))

		}

		function updateFlagBorder() {

			$('.flagBorder').remove()

			var flags = [].slice.call(document.querySelectorAll( '#' + el + '_graph .flags'));

			flags.forEach(function(x, i) {

				if (x.getAttribute('href')) {
					d3.select( '#' + el + '_graph svg g')
						.append('rect')
						.attr({
							'class': 'flagBorder',
							'width': '24',
							'height': '18',
							'y': function() {
								return x.getAttribute('y')
							},
							'x': function() {
								return x.getAttribute('x')
							}
						})
				}
			})
		}

		makeGraph( data, current );
		scorecardValue( data, current );

		$( '.' + el + '_tabs' ).click( function () {
			$( '.' + el + '_tabs' ).removeClass( 'active' );
			$( this ).addClass( 'active' );
			var duration =  $( this ).attr( 'id' ).split( '_' )[ 2 ];
			makeGraph( data, duration );
			scorecardValue( data, duration )
			setTimeout(updateFlagBorder, 350);
		} );

	}
} ) ( d3, jQuery );
