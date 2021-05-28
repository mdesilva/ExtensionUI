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
            /*
            When child element(s) are passed in as props to functional component, 
            in the next recursive frame it becomes an array of those child(s),
            which is then added onto the children parameter, which itself is an array of an indeterminate number of arguments. 
            So when we hit a child in the children parameter that is not an element or a string, but an
            array itself, we need to loop through that inner array and append its nodes.
            */
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