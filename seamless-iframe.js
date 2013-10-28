jQuery.fn.seamless = function() {
	var i, j, cssRule;
	var cssRules = [];
	var does_match;
	var some_styles = [
		'color', 'font', 'opacity', 'kerning', 'letter-spacing', 'text-align'
	];
	var styles = [
		'background', 'border',
		'text-decoration', 'list-style',
		'top', 'bottom', 'left', 'right', 'z-index',
		'max-height', 'max-width', 'min-height', 'min-width',
		'margin', 'padding',
		'position', 'float',
		'display', 'visibility'
	];
	var $html, $body;

	$.merge( styles, some_styles );

	for ( i = 0; i < document.styleSheets.length; i++ ) {
		for ( j = 0; j < document.styleSheets[i].cssRules.length; j++ ) {
			cssRule = document.styleSheets[i].cssRules[j];
			if ( cssRule.STYLE_RULE === cssRule.type ) {
				cssRules.push( cssRule );
			}
		}
	}

	$iframes = this.filter( 'iframe' ).add( this.find( 'iframe' ) ).filter( '[seamless]' );

	if ( cssRules.length > 0 ) {
		$html = $( 'html' );
		$body = $( 'body' );

		if ( cssRules[0].hasOwnProperty( 'selectorText' ) ) {
			does_match = function( classes ) {
				var re = new RegExp( '[.](?:' + classes.join( '|' ) + ')' );
				return function( cssRule ) {
					return re.exec( cssRule.selectorText );
				}
			}
		} else {
			does_match = function( classes ) {
				var re = new RegExp( '[.](?:' + classes.join( '|' ) + ')' );
				return function( cssRule ) {
					return re.exec( cssRule.cssText.split( "\x7b" )[0] ); // An opening brace
					// Use a hex literal to not confuse naive IDEs' open/close matching algorimths: (), [], <>, {}, ... 
				}
			}
		}

		$iframes.each( function() {
			var $this = $( this );
			var does_match_this_iframe = does_match( this.className.split( /\s+/ ) );
			var rules = [];
			var $div = $( '<div />' ).hide().addClass( this.className ).html( $this.text() );
			var div = $div.get( 0 );
			var origin = this.src.split( '/' ).slice( 0, 3 ).join( '/' );

			function add_element_rule( selector, $element, these_styles ) {
				var rule = selector + "{\n";
				these_styles = these_styles || styles;
				for ( i = 0; i < these_styles.length; i++ ) {
					rule += these_styles[i] + ': ' + $element.css( these_styles[i] ) + ";\n";
				}
				rules.push( rule + "}" );
			}

			function get_path( element ) {
				var path = [];
				var piece;
				var first = true;
				while ( element != div && element != document.body ) {
					if ( element.id ) {
						piece = '#' + element.id;
					} else if ( first && ! element.className ) {
						piece = element.tagName;
					} else {
						piece = '';
					}

					if ( element.className ) {
						piece += '.' + element.className.replace( /\s+/, '.' );
					}

					path.push( piece );

					first = false;
					element = element.parentNode;
				}
				return path.reverse().join( ' ' );
			}

			$this.after( $div ).text( '' );

			add_element_rule( 'html', $html, some_styles );
			add_element_rule( 'body', $body, some_styles );

			// "Inherited" rules for this iframe
			$div.find( '*' ).each( function() {
				add_element_rule( get_path( this ), $( this ) );
			} );

			// Specific rules for this iframe
			for ( i = 0; i < cssRules.length; i++ ) {
				if ( does_match_this_iframe( cssRules[i] ) ) {
					rules.push( cssRules[i].cssText );
				}
			}

			this.contentWindow.postMessage( rules.join( "\n" ), origin );
			$div.remove();
		} );
	}

	return this;
};
