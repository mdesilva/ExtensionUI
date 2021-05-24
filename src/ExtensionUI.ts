export default class ExtensionUI {
    constructor(){
    }

    public static createElement(type: keyof HTMLElementTagNameMap, attributes: object, ...children: any[]) {
        let element = document.createElement(type);
        if (attributes) {
            const attributeKeys = Object.keys(attributes);
            for (let i=0; i<attributeKeys.length; i++) {
                const key = attributeKeys[i]
                element.setAttribute(key, attributes[key]);
            }
        }
        children.map((child, idx) => {
            if (typeof child == "string" && child != " ") {
                element.innerText = child;
            } else {
                element.appendChild(child);
            }
        })
        return element;
    }
}