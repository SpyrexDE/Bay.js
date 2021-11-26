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
		class BayComponent extends HTMLElement {
			connectedCallback() {
				// Load in component's script
				window.eval(script.textContent);
				this.data = data;

				this._attachShadowRoot();
				this._registerData(script.textContent);
				this._attachListeners(script.textContent);

				this.updateVariables();
			}

			_attachShadowRoot() {
				this.shadow = this.attachShadow( { mode: 'open' } );
				this.shadow.appendChild( style.cloneNode( true ) );
				this.shadow.appendChild( document.importNode( template.content, true ) );
			}

			_registerData() {
				let shadow = this.shadow;
				let o = this;

				// Replace vars with var tags
				let html = shadow.innerHTML;
				var htmlLines = html.split("\n");

				for (var i = 0; i < htmlLines.length; i++){
					let line = htmlLines[i];

					if(line.includes("{{") && line.includes("}}")) {
						let varName = line.substring(
							line.indexOf("{{") + 2, 
							line.lastIndexOf("}}")
						);
						line = line.replaceAll("{{" + varName + "}}", "<variable " + varName.replaceAll(" ", "") + "></variable>");
					}
					htmlLines[i] = line;
				}

				if(shadow.innerHTML != htmlLines.join("\n")) {
					shadow.innerHTML = htmlLines.join("\n");
				}
				

				Object.keys(data).forEach( ( key ) => {

					Object.defineProperty(data, "_" + key, {

						value: this.data[key],
						writable: true,
						enumerable: true,
						configurable: true,

					});

					Object.defineProperty(data, key, {

						get () {
							return this["_" + key];
						},

						set(value) {
							this["_" + key] = value;
							
							o.updateVariables(key);
						}
					});
				} );
			}

			updateVariables(key) {
				if (key == undefined) {
					Object.keys(data).forEach( ( key ) => {
						this.updateVariables(key);
					});
				}

				let shadow = this.shadow;
				let els = [];

				for(var i = 0; i < shadow.children.length; i++) {
					let vars = shadow.children[i].getElementsByTagName("variable");
					
					for(var k = 0; k < vars.length; k++) {
						els.push(vars[k]);
					}
				}
				
				for(var i = 0; i < els.length; i++) {
					let el = els[i];
					if(el.attributes[0].name == key) {
						el.innerText = data[key];
					}
				}
			}

			_attachListeners() {
				Object.keys(listeners).forEach( ( event ) => {
					this.addEventListener( event, window[listeners[event]], false );
				} );
			}
		}

		return customElements.define( name, BayComponent );
	}

	function loadComponent( URL ) {
		return fetchAndParse( URL ).then( getSettings ).then( registerComponent );
	}

	return loadComponent;
}() );
