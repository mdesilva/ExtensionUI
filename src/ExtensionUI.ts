type ElementTag = keyof HTMLElementTagNameMap;

export default class ExtensionUI {

    public static createElement(type: ((props: object, children?: Element[]) => Element) | ElementTag, props: object, ...children: Element[] | string[]): Element {
        let element: Element;
        if (typeof type == "function") {
            element = type({...props, children: children});
            children = [];
        } else {
            element = document.createElement(type);
        }
        if (props) {
            Object.keys(props).map(key => {
                element.setAttribute(key, props[key]);
            })
        }
        children.map(child => {
            if (Array.isArray(child)) {
                child.map(subchild => {
                    element.append(subchild);
                })
            } else {
                element.append(child);
            }
        })
        return element;
    }

}