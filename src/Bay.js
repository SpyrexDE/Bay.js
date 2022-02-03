import BayComponent from "./BayComponent.js";
var Bay = {};

Bay.loadComponent = ( function() {
	function fetchAndParse( URL ) {

		return fetch( URL ).then( ( response ) => {
			return response.text();
		} ).then( ( html ) => {
			const parser = new DOMParser();
			const document = parser.parseFromString( html, 'text/html' );
			const head = document.head;
			const template = head.querySelector( 'template' );
			const style = head.querySelector( 'style' );
			const script = head.querySelector( 'script' );
			var name = URL.split(/[/.]+/);
			name = name[name.length - 2];

			return {
				name,
				template,
				style,
				script
			};
		} );
	}

	function getSettings( { name, template, style, script } ) {
		if(!script)
			return{
				name,
				script: "",
				listeners: {},
				template,
				style
			}
		
		// Set script to its textContent, remove comments
		script = script.textContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,'');

		const jsFile = new Blob( [ script ], { type: 'application/javascript' } );
		const jsURL = URL.createObjectURL( jsFile );

		// Register listeners
		function getListeners( script ) {
			var listeners = {};

			var lines = script.split("\n");
			for(var i=0; i < lines.length; i++)
			{
				if(!lines[i].includes("function on"))
					continue;
				
				listeners[lines[i].split(" on")[1].split("(")[0].toLowerCase()] = "on" + lines[i].split(" on")[1].split("(")[0];
			}
			return listeners
		}

		const listeners = getListeners( script );

		return {
				name,
				script,
				listeners,
				template,
				style
		}
	}

	function registerComponent( { template, style, name, listeners, script } ) {
		console.log(name);
		window.customElements.define( name, BayComponent );
		return new BayComponent(template, style, name, listeners, script);
	}

	function loadComponent( URL ) {
		return fetchAndParse( URL ).then( getSettings ).then( registerComponent );
	}
	
	return loadComponent;
}() );

export default Bay;