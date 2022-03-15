var Bay = {};

Bay.loadComponent = ( function() { 
	function fetchAndParse( URL, extending_class ) {

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
				script,
                extending_class
			};
		} );
	}

	function getSettings( { name, template, style, script, extending_class } ) {
		if(!script)
			return{
				name,
				script: "",
				listeners: {},
				template,
				style
			}
		
		// Set script to textContent, remove comments
		script = script.textContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,'');

		const jsFile = new Blob( [ script ], { type: 'application/javascript' } );
		const jsURL = URL.createObjectURL( jsFile );

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

		return{
				name,
				script,
				listeners,
				template,
				style,
                extending_class
		}
	}

	function registerComponent( { template, style, name, listeners, script, extending_class } ) {
		class BayComponent extends extending_class {
			connectedCallback() {
				this._attachShadowRoot();

				// Load in component's script
				window.eval(script);
				this._registerFunctions(script);
				this._registerVariables(script);

				this._addAttributesToData();

				if (typeof this.data !== 'undefined') {
					this._registerData(script);
					this._attachListeners(script);
					this.updateVariables();
				} else {
					this._attachListeners(script);
				}
			}

			_registerFunctions(script) {

				var lines = script.split("\n");
				for(var i=0; i < lines.length; i++)
				{
					if(!lines[i].includes("function"))
						continue;
					
					this[lines[i].split("function ")[1].split("(")[0]] = eval(lines[i].split("function ")[1].split("(")[0]);
				}
			}

			_registerVariables(script) {

				var lines = script.split("\n");
				for(var i=0; i < lines.length; i++)
				{
					const keywords = ["let", "var", "const"];
					
					keywords.forEach((keyword) => {
						if(!lines[i].includes(keyword))
							return;
						
						// If variable is defined
						if(lines[i].includes("=")){
							const varName = lines[i].split(keyword + " ")[1].split("=")[0].replaceAll(" ", "");
							this[varName] = eval(varName);
						}
					})
				}
			}

			_attachShadowRoot() {
				this.shadow = this.attachShadow( { mode: 'open' } );

				if(style)
					this.shadow.appendChild( style.cloneNode( true ) );
				
				this.shadow.appendChild( document.importNode( template.content, true ) );
			}

			_addAttributesToData() {
				if(this.attributes.length > 0 && typeof data === 'undefined')
					this.data = {}
				for(var i = 0; i < this.attributes.length; i++) {
					const attribute = this.attributes[i];
					if (attribute.name.startsWith(":")) {
						const types = ["Number", "BigInt", "Symbol", "String", "Boolean"]
						let v = attribute.value;

						for(var k = 0; k < types.length; k++) {
							try {
								v = eval("new " + types[i] + "(" + v + ")");

							} catch(Excention) { /*ignore */}
						}						

						this.data[attribute.name.replace(":", "")] = v;
					}
				}
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
							line.indexOf("}}")
						);
						line = line.replaceAll("{{" + varName + "}}", "<variable " + varName.replaceAll(" ", "") + "></variable>");
					}
					htmlLines[i] = line;
				}

				if(shadow.innerHTML != htmlLines.join("\n")) {
					shadow.innerHTML = htmlLines.join("\n");
				}
				
				// Register getters and setters for data vars
				Object.keys(this.data).forEach( ( key ) => {

					Object.defineProperty(this.data, "_" + key, {

						value: this.data[key],
						writable: true,
						enumerable: true,
						configurable: true,

					});

					Object.defineProperty(this.data, key, {

						get () {
							if (typeof o["$$_" + key] !== 'undefined') {
								const newVal = o["$$_" + key](this["_" + key]);
								switch(newVal)
								{
									case "prevent_default": return;
									default: return newVal;
								}
							}
							return this["_" + key];
						},

						set(value) {
							if (typeof o["$_" + key] !== 'undefined') {
								const newVal = o["$_" + key](value);
								switch(newVal)
								{
									case "prevent_default": return;
									default: this["_" + key] = newVal; o.updateVariables(key); return;
								}
							}

							this["_" + key] = value;
							
							o.updateVariables(key);
						}
					});
				} );
			}

			updateVariables(key) {
				if (key == undefined) {
					Object.keys(this.data).forEach( ( key ) => {
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
						el.innerText = this.data[key];
					}
				}
			}

			_attachListeners() {
				Object.keys(listeners).forEach( ( event ) => {
					this.addEventListener( event, this[listeners[event]], false );
				} );
			}
		}

		return customElements.define(name, BayComponent);
	}

	function loadComponent( URL, extending_class = HTMLElement ) {
        return fetchAndParse( URL, extending_class ).then( getSettings ).then( registerComponent );
	}

	return loadComponent;
}() );
