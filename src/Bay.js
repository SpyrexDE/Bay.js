


// Bay Class

class Bay {
    static loadComponent( URL ) {
		return fetchAndParse( URL ).then( getSettings ).then( registerComponent );
	}
}

// BayComponent Class

class BayComponent extends HTMLElement {

    template;
    style;
    name;
    listeners;
    script;

    constructor( { template, style, name, listeners, script } ) {
        this.template = template;
        this.style = style;
        this.name = name;
        this.listeners = listeners;
        this.script = script;
    }

    connectedCallback() {
        this._attachShadowRoot();

        // Load in component's script
        window.eval(this.script);
        this._registerFunctions(this.script);
        this._registerVariables(this.script);

        this._addAttributesToData();

        if (typeof this.data !== 'undefined') {
            this._registerData(this.script);
            this._attachListeners(this.script);
            this.updateVariables();
        } else {
            this._attachListeners(this.script);
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

        if(this.style)
            this.shadow.appendChild( this.style.cloneNode( true ) );
        
        this.shadow.appendChild( document.importNode( this.template.content, true ) );
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
        Object.keys(this.listeners).forEach( ( event ) => {
            this.addEventListener( event, this[this.listeners[event]], false );
        } );
    }
}

