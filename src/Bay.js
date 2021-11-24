var Bay = {};

Bay.loadComponent = ( function() { 
	function fetchAndParse( URL ) {

		// Load dictionary
		if(!URL.endsWith(".html")) {
			// TODO - Seem like it's not possibile in plain js ._.
		}

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
		const jsFile = new Blob( [ script.textContent ], { type: 'application/javascript' } );
		const jsURL = URL.createObjectURL( jsFile );

		function getListeners( script ) {
			var listeners = {};

			var lines = script.textContent.split("\n");
			for(i=0; i < lines.length; i++)
			{
				if(lines[i] == "")
					continue;

				if(!lines[i].includes("function on"))
					continue;
				
				listeners[lines[i].split(" on")[1].split("(")[0].toLowerCase()] = "on" + lines[i].split(" on")[1].split("(")[0];
			}
			return listeners
		}

		const listeners = getListeners( script );

		return{
				name,
				script,
				listeners,
				template,
				style
		}
	}

	function registerComponent( { template, style, name, listeners, script } ) {
		class UnityComponent extends HTMLElement {
			connectedCallback() {
				this._upcast();
				this._attachListeners(script.textContent);
			}

			_upcast() {
				const shadow = this.attachShadow( { mode: 'open' } );

				shadow.appendChild( style.cloneNode( true ) );
				shadow.appendChild( document.importNode( template.content, true ) );
			}

			_attachListeners(script) {
				window.eval(script);

				Object.keys(listeners).forEach( ( event ) => {
					this.addEventListener( event, window[listeners[event]], false );
				} );
			}
		}

		return customElements.define( name, UnityComponent );
	}

	function loadComponent( URL ) {
		return fetchAndParse( URL ).then( getSettings ).then( registerComponent );
	}

	return loadComponent;
}() );
