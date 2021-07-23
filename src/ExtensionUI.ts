import Props, { PropsObject } from "./Props";
import { PropType } from "./Enums";
import StateObject from "./StateObject";
import ExtensionUINode from "./ExtensionUINode";
import Children from "./Children";

type ElementTag = keyof HTMLElementTagNameMap;

export interface ExtensionUIElement extends Element {
    [key: string]: any
}

export default class ExtensionUI {

    public static createElement(type: ((props: object, children?: Element[]) => ExtensionUINode) | ElementTag, _props: PropsObject, ..._children: ExtensionUINode[] | string[] | StateObject[]): ExtensionUINode {
        if (typeof type == "function") { 
            return type({..._props, children: _children});
        }
        let element: ExtensionUIElement = document.createElement(type);
        let props: Props = new Props(_props);
        props.pureProps.map(prop => {
            const propKey = prop.key;
            const propValue = prop.value;
            switch (prop.type) { 
                case PropType.EVENT:
                    typeof propValue === "function" && element.addEventListener(propKey.slice(2), propValue);
                    break;
                case PropType.PROPERTY:
                    element[propKey] =  propValue;
                    break;
                case PropType.ATTRIBUTE:
                    (typeof propValue === "string" || typeof propValue === "boolean") && element.setAttribute(propKey, String(propValue));
                    break;
            }
        });
        return new ExtensionUINode(element, new Children(_children), props.stateProps);
    }
}