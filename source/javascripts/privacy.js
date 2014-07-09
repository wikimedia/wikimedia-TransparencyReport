;( function ( d3, $ ) {

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

			bar.enter().append( 'rect' ).attr( 'class', className );
			bar
				.on( 'click', function ( d ) {
					if ( ds.filters[ 'country' ] === d.key ) {
						delete ds.filters[ 'country' ];
					} else {
						ds.filters[ 'country' ] = d.key;
					}
					dispatch.filter();
				} )
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
	horizontalGraph = function ( element, groupBy, ds, dispatch ) {
		var data = ds.groupBy( groupBy, true );
		var margin = { top: 10, right: 10, bottom: 10, left: 10 },
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
			.rangeRoundBands( [ margin.top, height ], 0.1 );
		var xScale = d3.scale.linear()
			.domain( [0, d3.max( data, function (d) {
				return d.value;
			} ) ] )
			.range( [ 0, width ] );


		function makeBars( graph, data, xScale, yScale, ds, dispatch, className ) {
			var bar = graph.selectAll( 'rect.' + className ).data( data )
			bar.enter().append( 'rect' ).attr( 'class', className );
			bar
				.attr( 'height', yScale.rangeBand() )
				.attr( 'y', function ( d ) {
					return yScale( d.key );
				} )
				.attr( 'x', 0 )
				.on( 'click', function ( d ) {
					if ( ds.filters[ groupBy ] === d.key ) {
						delete ds.filters[ groupBy ];
					} else {
						ds.filters[ groupBy ] = d.key;
					}
					dispatch.filter();
				} )
				.transition()
				.attr( 'width', function ( d ) {
					return xScale( d.value )
				} );
		}
		makeBars( graph, data, xScale, yScale, ds, dispatch, 'gray_bars' );
		makeBars( graph, data, xScale, yScale, ds, dispatch, 'blue_bars' );

		dispatch.on( 'filter.' + element, function () {
			var new_data = ds.groupBy( groupBy, true );
			makeBars( graph, new_data, xScale, yScale, ds, dispatch, 'blue_bars' );
		} );
	}

	/*---DOM Ready---------*/
	$( function () {
		d3.json( '/data/privacy.json', function ( error, data ) {
			if ( error ) throw error;
			var ds = new Requests();
			ds.init( data );
			var dispatch = d3.dispatch( "filter" );

			countryGraph( '#bar_graph_by_country', ds, dispatch );
			horizontalGraph( 'bar_graph_by_type', 'type', ds, dispatch );
			horizontalGraph( 'bar_graph_by_disclosed', 'disclosed', ds, dispatch );
		} );
	} );

} ( d3, jQuery ) )
