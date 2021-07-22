import Props, { PropsObject } from "./Props";
import { PropType } from "./Enums";
import StateObject from "./StateObject";
import StateProp from "./StateProp";
import ExtensionUINode from "./ExtensionUINode";

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
        let children: ExtensionUINode[] = [];
        _children.map(child => {
            /*
            When child element(s) are passed in as props to functional component, 
            in the next recursive frame it becomes an array of those child(s),
            which is then added onto the children parameter, which itself is an array of an indeterminate number of arguments. 
            So when we hit a child in the children parameter that is not an element or a string, but an
            array itself, we need to loop through that inner array to process the child nodes.
            */
           if (Array.isArray(child)) {
               child.map(subchild => children.push(ExtensionUI.transformChild(subchild)));
           } else {
               children.push(ExtensionUI.transformChild(child));
           }
           
        })
        return new ExtensionUINode(element, children, props.stateProps);
    }

    private static createTextNodeFromPlainText(text: string): ExtensionUINode {
        let element = document.createElement("span");
        element.append(text);
        return new ExtensionUINode(element);
    }

    private static createTextNodeFromStateObject(stateObject: StateObject): ExtensionUINode {
        let element = document.createElement("span");
        element.append(stateObject.value);
        return new ExtensionUINode(element, [], [new StateProp(PropType.TEXT, "", stateObject.key)]);
    }

    private static transformChild(child: ExtensionUINode | StateObject | string): ExtensionUINode {
        switch(child.constructor.name) {
            case "String":
                return ExtensionUI.createTextNodeFromPlainText(child)
            case "StateObject":
                return ExtensionUI.createTextNodeFromStateObject(child);
            case "ExtensionUINode":
                return child;
        }
    }
}