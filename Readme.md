Seamless Iframes
================

A jQuery plugin to apply the parent frame's CSS styling to an embedded iframe.

Not production ready.

Transfered Styles
-----------------

Two types of styling from the parent page are transferred to the embedded iframe.

1. Styles having selectors that match the iframe's class.  For example,
~~~html
<style>
p {
	color: blue;
}
.my-embed p {
	color: red
}
</style>
<iframe class="my-embed" src="http://example.com/foo/bar"></iframe>
~~~

In the above, the `.my-embed p` styling will be transferred to the embedded iframe
since its selector matches the iframe's class.

2. Additionally, more generic styling (default fonts, colors, etc.) can be
transferred to the iframe by adding some dummy markup inside the `<iframe>` tag.

~~~html
<iframe class="my-embed" src="http://example.com/foo/bar">
	<h1>This</h1>
	<h2>Is</h2>
	<h3>Some</h3>
	<p>dummy</p>
	<p class="something">hidden</p>
	<em>markup</em>
	<strong>only</strong>
	<a href="#">used</a>
	<p>to <a href="#">calculate</a> some</p>
	<ul>
		<li>default</li>
	</ul>
	<ol>
		<li>styling</li>
	</ol>
</iframe>
~~~

In the above, the plugin will calculate the computed style for each of the elements
in the dummy markup.  Selectors for those elements are then generated based on each
element's class, id, tagname, and position in dummy markup's tree.  The selectors
and computed style are then transferred to the embedded iframe as CSS rules.

The notion is that, in the markup you output on the parent page, you should include
a basic example version of what you're embedding as this dummy markup.  That way,
the iframe's contents get styled as though it was directly output in the parent page.

Use
---

The parent frame should include the `seamless-iframe.js` jQuery plugin, then call:
~~~js
jQuery( selector ).seamless();
~~~

Where `selector` is the jQuery selector for the iframes you want to make seamless.

The embedded frame should include a basic postMessage event handler and some simple
base styling.

~~~html
<style>
html, body {
	margin: 0;
	padding: 0;
	background-color: transparent;
}
</style>
window.addEventListener( 'message', receiveMessage, false );
function receiveMessage( event ) {
	var style = document.createElement( 'style' );
	var styles = document.getElementsByTagName( 'style' );

	style.innerHTML = event.data;
	if ( styles.length ) {
		styles[0].parentNode.insertBefore( style, styles[0] );
	} else {
		document.head.appendChild( style );
	}
}
</script>
~~~

Todo
----

* Automatically adjust width/height of `<iframe>` to match the embedded page's width/height.
* The postMessage calls should be restricted by origin.
* Should the `.my-embed` CSS rules be applied as-is, or should they be converted
  to `body` rules?
