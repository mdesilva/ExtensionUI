type ElementTag = keyof HTMLElementTagNameMap;

export default class ExtensionUI {

    public static createElement(type: ((props: object) => Element) | ElementTag, props: object, ...children: any[]): Element {
        if (typeof type === "function") {
            return type(props);
        }
        let element: HTMLElement = document.createElement(type);
        if (props) {
            const propKeys = Object.keys(props);
            for (let i=0; i<propKeys.length; i++) {
                const key = propKeys[i]
                element.setAttribute(key, props[key]);
            }
        }
        children.map((child, idx) => {
            element.append(child);
        })
        return element;
    }

}