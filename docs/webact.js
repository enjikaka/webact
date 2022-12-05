var Se=Object.defineProperty,ge=Object.defineProperties;var ye=Object.getOwnPropertyDescriptors;var V=Object.getOwnPropertySymbols;var ve=Object.prototype.hasOwnProperty,we=Object.prototype.propertyIsEnumerable;var X=(a,e,r)=>e in a?Se(a,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):a[e]=r,K=(a,e)=>{for(var r in e||(e={}))ve.call(e,r)&&X(a,r,e[r]);if(V)for(var r of V(e))we.call(e,r)&&X(a,r,e[r]);return a},k=(a,e)=>ge(a,ye(e));(function(){"use strict";if("adoptedStyleSheets"in document)return;var a="ShadyCSS"in window&&!window.ShadyCSS.nativeShadow,e=[],r=[],s=new WeakMap,l=new WeakMap,n=new WeakMap,m=new WeakMap,g=new WeakMap,_={loaded:!1},y={body:null,CSSStyleSheet:null},j=CSSStyleSheet,oe=/@import\surl(.*?);/gi;function I(t){return t instanceof j||t instanceof y.CSSStyleSheet}function ie(t,o){var i=o===document?"Document":"ShadowRoot";if(!Array.isArray(t))throw new TypeError("Failed to set the 'adoptedStyleSheets' property on "+i+": Iterator getter is not callable.");if(!t.every(I))throw new TypeError("Failed to set the 'adoptedStyleSheets' property on "+i+": Failed to convert value to 'CSSStyleSheet'");var c=t.filter(function(h,d){return t.indexOf(h)===d});return s.set(o,c),c}function $(){return document.readyState==="loading"}function z(t){return s.get(t.parentNode===document.documentElement?document:t)}function B(t){var o=t.match(oe,"")||[],i=t;return o.length&&(console.warn("@import rules are not allowed here. See https://github.com/WICG/construct-stylesheets/issues/119#issuecomment-588352418"),o.forEach(function(c){i=i.replace(c,"")})),i}var ae=["addImport","addPageRule","addRule","deleteRule","insertRule","removeImport","removeRule"],ce=["replace","replaceSync"];function J(t){ce.forEach(function(o){t[o]=function(){return O.prototype[o].apply(this,arguments)}}),ae.forEach(function(o){var i=t[o];t[o]=function(){var c=arguments,h=i.apply(this,c);if(l.has(this)){var d=l.get(this),p=d.adopters,S=d.actions;p.forEach(function(f){f.sheet&&f.sheet[o].apply(f.sheet,c)}),S.push([o,c])}return h}})}function G(t){var o=l.get(t),i=o.adopters,c=o.basicStyleElement;i.forEach(function(h){h.innerHTML=c.innerHTML})}var O=function(){function t(){var i=document.createElement("style");_.loaded?y.body.appendChild(i):(document.head.appendChild(i),i.disabled=!0,e.push(i));var c=i.sheet;return l.set(c,{adopters:new Map,actions:[],basicStyleElement:i}),c}var o=t.prototype;return o.replace=function(c){var h=this,d=B(c);return new Promise(function(p,S){if(l.has(h)){var f=l.get(h),u=f.basicStyleElement;u.innerHTML=d,p(u.sheet),G(h)}else S(new Error("Can't call replace on non-constructed CSSStyleSheets."))})},o.replaceSync=function(c){var h=B(c);if(l.has(this)){var d=l.get(this),p=d.basicStyleElement;return p.innerHTML=h,G(this),p.sheet}else throw new Error("Failed to execute 'replaceSync' on 'CSSStyleSheet': Can't call replaceSync on non-constructed CSSStyleSheets.")},t}();Object.defineProperty(O,Symbol.hasInstance,{configurable:!0,value:I});function L(t){for(var o=document.createDocumentFragment(),i=z(t),c=m.get(t),h=0,d=i.length;h<d;h++){var p=l.get(i[h]),S=p.adopters,f=p.basicStyleElement,u=S.get(t);u?(c.disconnect(),o.appendChild(u),(!u.innerHTML||u.sheet&&!u.sheet.cssText)&&(u.innerHTML=f.innerHTML),c.observe()):(u=document.createElement("style"),u.innerHTML=f.innerHTML,n.set(u,t),g.set(u,0),S.set(t,u),o.appendChild(u)),t===document.head&&r.push(u)}t.insertBefore(o,t.firstChild);for(var w=0,D=i.length;w<D;w++){var C=l.get(i[w]),M=C.adopters,E=C.actions,b=M.get(t),ue=g.get(b);if(E.length>0){for(var H=ue,pe=E.length;H<pe;H++){var Q=E[H],fe=Q[0],me=Q[1];b.sheet[fe].apply(b.sheet,me)}g.set(b,E.length-1)}}}function he(t,o){for(var i=z(t),c=0,h=o.length;c<h;c++)if(!(i.indexOf(o[c])>-1)){var d=l.get(o[c]),p=d.adopters,S=m.get(t),f=p.get(t);f||(f=p.get(document.head)),S.disconnect(),f.parentNode.removeChild(f),S.observe()}}function de(t){for(var o=0,i=t.length;o<i;o++){for(var c=t[o],h=c.addedNodes,d=c.removedNodes,p=0,S=d.length;p<S;p++){var f=n.get(d[p]);f&&L(f)}if(!a)for(var u=0,w=h.length;u<w;u++)for(var D=document.createNodeIterator(h[u],NodeFilter.SHOW_ELEMENT,function(M){return M.shadowRoot&&M.shadowRoot.adoptedStyleSheets.length>0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT},null,!1),C=void 0;C=D.nextNode();)L(C.shadowRoot)}}function Y(t){var o=new MutationObserver(de),i={observe:function(){o.observe(t,{childList:!0,subtree:!0})},disconnect:function(){o.disconnect()}};m.set(t,i),i.observe()}function Z(){var t=document.createElement("iframe");t.hidden=!0,document.body.appendChild(t),y.body=t.contentWindow.document.body,y.CSSStyleSheet=t.contentWindow.CSSStyleSheet,J(t.contentWindow.CSSStyleSheet.prototype),Y(document.body),_.loaded=!0;for(var o=document.createDocumentFragment(),i=0,c=e.length;i<c;i++)e[i].disabled=!1,o.appendChild(e[i]);y.body.appendChild(o);for(var h=0,d=r.length;h<d;h++)o.appendChild(r[h]);document.body.insertBefore(o,document.body.firstChild),e.length=0,r.length=0}function le(){var t={configurable:!0,get:function(){return s.get(this)||[]},set:function(c){var h=s.get(this)||[];ie(c,this);var d=this===document?$()?this.head:this.body:this,p="isConnected"in d?d.isConnected:document.body.contains(d);window.requestAnimationFrame(function(){p&&(L(d),he(d,h))})}};if(Object.defineProperty(Document.prototype,"adoptedStyleSheets",t),typeof ShadowRoot<"u"){var o=Element.prototype.attachShadow;Element.prototype.attachShadow=function(){var i=a?this:o.apply(this,arguments);return Y(i),i},Object.defineProperty(ShadowRoot.prototype,"adoptedStyleSheets",t)}}J(j.prototype),window.CSSStyleSheet=O,le(),$()?document.addEventListener("DOMContentLoaded",Z):Z()})();function Ce(a){return a.replace(/(-)([a-z])/g,e=>e[1].toUpperCase())}function x(a){return a.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()}function v(a){return a?Array.from(a).reduce((e,{localName:r,value:s})=>k(K({},e),{[Ce(r)]:s}),{}):{}}function F(a){return document.createRange().createContextualFragment(a)}function _e(a,...e){let r=new CSSStyleSheet;return r.replace(String.raw(...arguments)),r}function Me(a,...e){let r=document.createElement("style");return r.innerText=String.raw(...arguments),r}function N(a,...e){let r=!1;try{let s=new CSSStyleSheet;r=!0}catch(s){r=!1}return r?_e(a,...e):Me(a,...e)}function ee(){return F(String.raw(...arguments))}var A={},Ee={},q=class extends HTMLElement{constructor(e){super(),e?this.componentPath=e:(console.warn("You did not send a path to the super method in your constructor. Thus CSS and HTML cannot be read for this component.",this),console.warn("If shipping for modern browser, then call super with import.meta.url. If not, specify a path that is similar to import.meta.url yourself."),console.warn("Should be the path to the component you are making."))}$(e){return this._sDOM.querySelector(e)}get cssPath(){return this.componentPath&&this.componentPath.replace(/\.(html|js)/gi,".css")}get htmlPath(){return this.componentPath&&this.componentPath.replace(/\.(css|js)/gi,".html")}get props(){return v(this.attributes)}async _render(){if(!Ee[this.cssPath]&&this.cssPath){let s=await this.fetchCSSAsStyleSheet();this._sDOM.adoptedStyleSheets=[s]}let r=this.render(this.props);return F(r)}async fetchHTMLAsDocFrag(){let e=await fetch(this.htmlPath);if(e.ok){let r=await e.text();return F(r)}throw new Error("Fetch failed")}async fetchCSSAsStyleSheet(){let e=new CSSStyleSheet,r=await fetch(this.cssPath);if(r.ok&&r.headers.get("content-type").indexOf("text/css")!==-1){let s=await r.text();await e.replace(s)}return e}async _renderHTMLFile(){let e=btoa(this.componentPath);A[e]||(A[e]=Promise.all([this.fetchHTMLAsDocFrag(),this.fetchCSSAsStyleSheet()]));let[r,s]=await A[e];return this._sDOM.adoptedStyleSheets=[s],r.cloneNode(!0)}componentDidMount(){}async connectedCallback(){this._sDOM=this.attachShadow({mode:"closed"});let e;this.render?e=await this._render():this.componentPath?e=await this._renderHTMLFile():console.error("No render function or component path found for static html/css."),this._sDOM.innerHTML=null,this._sDOM.appendChild(e),requestAnimationFrame(()=>{requestAnimationFrame(()=>{this.componentDidMount&&this.componentDidMount()})})}};function te(a,{name:e}={name:void 0}){let r="is"in a?a.is:a.prototype.constructor.name,s=e||x(r);return customElements.define(s,a),s}var ne=[],W=new Map,T=new Map,P=new Map,R=new Map,U=new Map,re=new Map;function be(a,{metaUrl:e,observedAttributes:r,kebabName:s,shadowRootMode:l="closed"}){return class extends HTMLElement{constructor(){super(),this._postRender=void 0,this._propsChanged=void 0,this._hmrUpdate=!1,this._componentPath=e,this._hasRendered=!1,document.addEventListener("esm-hmr:webact-function-component",()=>{this._hmrUpdate=!0,a=W.has(s)?W.get(s):a,this._render()})}set _html(n){if(!T.has(s)||this._hmrUpdate){let m=document.createElement("template");m.content.appendChild(n),T.set(s,m)}}get _html(){return T.has(s)?T.get(s).content.cloneNode(!0):null}set _css(n){(!P.has(s)||this._hmrUpdate)&&P.set(s,n)}get _css(){return P.has(s)?P.get(s):null}get cssPath(){return this._componentPath&&this._componentPath.replace(/\.(html|js)/gi,".css")}get htmlPath(){return this._componentPath&&this._componentPath.replace(/\.(css|js)/gi,".html")}static get observedAttributes(){return r}async _render(n){this._rendering=a.apply(this.customThis,[n]),this._rendering instanceof Promise&&await this._rendering,this._css?("adoptedStyleSheets"in this._sDOM&&this._css instanceof CSSStyleSheet&&requestAnimationFrame(()=>{this._sDOM.adoptedStyleSheets=[this._css]}),this._css instanceof HTMLStyleElement&&this._sDOM.appendChild(this._css)):document.location.href.includes("localhost")&&console.warn(`<${s}>: Missing CSS. Will render without it.`),this._html?requestAnimationFrame(()=>this._sDOM.appendChild(this._html)):document.location.href.includes("localhost")&&console.warn(`<${s}>: Missing HTML. Will render without it.`),this._postRender instanceof Function&&requestAnimationFrame(()=>{requestAnimationFrame(()=>{this._postRender(),this._hmrUpdate=!1,this._hasRendered=!0})})}get _props(){return v(this.attributes)}get customThis(){return{html:(n,...m)=>{if(!(this._html!==null&&this._hmrUpdate===!1))return this._html=ee(n,...m),this._html},css:(n,...m)=>{if(!(this._css!==null&&this._hmrUpdate===!1))return this._css=N(n,...m),this._css},useHTML:async n=>{if(U.has(s))return U.get(s);if(n=n||this.htmlPath,!n)return;n instanceof URL&&(n=n.toString());let g=(async()=>{let y=await(await fetch(n)).text();this.customThis.html([y])})();return U.set(s,g),g},useCSS:async n=>{if(R.has(s))return R.get(s);if(n=n||this.cssPath,!n)return;n instanceof URL&&(n=n.toString());let g=(async()=>{let y=await(await fetch(n)).text();this.customThis.css([y]),R.delete(s)})();return R.set(s,g),g},postRender:n=>{this._postRender=n},deRender:n=>{this._deRender=n},propsChanged:n=>{this._propsChanged=n},$:n=>n===void 0||n===":host"?this:n===":root"?this._sDOM:this._sDOM.querySelector(n),$$:n=>this._sDOM.querySelectorAll(n)}}async attributeChangedCallback(){this._rendering instanceof Promise&&await this._rendering,requestAnimationFrame(()=>{if(this._propsChanged instanceof Function){let n=JSON.stringify(v(this.attributes));if(re.get(s)===n)return;this._propsChanged(v(this.attributes)),re.set(s,n)}else document.location.href.includes("localhost")&&console.error(`
            <${s}>: Attribute has changed and you are observing attributes, but not handling them in a propsChanged handler.
            Remove observedAttributes or or actually use them.
          `)})}async connectedCallback(){this._sDOM=this.attachShadow({mode:l}),this._render(this._props)}disconnectedCallback(){this._deRender&&this._deRender()}}}function se(a,{metaUrl:e,observedAttributes:r,name:s}={metaUrl:void 0,observedAttributes:[],name:void 0}){let l=s||x(a.name);if(customElements.get(l))if(ne.includes(l))W.set(l,a),document.dispatchEvent(new CustomEvent("esm-hmr:webact-function-component"));else throw new Error(`
        Some else has already registered <${l}> in the custom element registry.
      `);else{let n=be(a,{metaUrl:e,observedAttributes:r,kebabName:l});customElements.define(l,n),ne.push(l)}return l}export{q as Component,te as registerComponent,se as registerFunctionComponent};
//# sourceMappingURL=index.js.map
