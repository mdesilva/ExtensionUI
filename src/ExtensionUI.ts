import { PROP_TYPE, EXTENSIONUI_ATTRIBUTE, PropsMap } from "./Enums";

type ElementTag = keyof HTMLElementTagNameMap;
type PropValue = "string" | (() => void) 

export default class ExtensionUI {

    public static createElement(type: ((props: object, children?: Element[]) => Element) | ElementTag, props: object, ...children: Element[] | string[]): Element {
        if (typeof type == "function") {
            return type({...props, children: children});
        } 
        const element: Element = document.createElement(type);
        props && Object.keys(props).map(prop => {
            const propValue: PropValue = props[prop];
            switch (this.getPropType(prop)) {
                case PROP_TYPE.EVENT:
                    typeof propValue === "function" && element.addEventListener(prop.slice(2), propValue);
                    break;
                case PROP_TYPE.PROPERTY:
                    element[prop] =  propValue; //here, the propValue can be 'any'
                    break;
                case PROP_TYPE.ATTRIBUTE:
                    typeof propValue === "string" && element.setAttribute(prop, propValue);
                    break;
            }

        })
        element.setAttribute(EXTENSIONUI_ATTRIBUTE.KEY, EXTENSIONUI_ATTRIBUTE.VALUE); //identifier for all elements created through ExtensionUI
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
    
    private static getPropType = (prop: keyof typeof PropsMap): PROP_TYPE => {
        return prop in PropsMap ? PropsMap[prop] : PROP_TYPE.ATTRIBUTE;
    }

}