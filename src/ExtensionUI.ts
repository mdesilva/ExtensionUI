import { PropType, PropsMap } from "./Enums";
import StateObject from "./StateObject";
import StateProp from "./StateProp";
import ExtensionUINode from "./ExtensionUINode";

type ElementTag = keyof HTMLElementTagNameMap;
type PropKey = keyof typeof PropsMap;
type PropValue = (() => void) | string | boolean | StateObject;

type Prop = {
    [key: string]: PropValue
}

export default class ExtensionUI {

    public static createElement(type: ((props: object, children?: Element[]) => ExtensionUINode) | ElementTag, props: Prop, ...children: ExtensionUINode[] | string[] | StateObject[]): ExtensionUINode {
        if (typeof type == "function") { 
            return type({...props, children: children});
        }
        let stateProps: StateProp[] = [];
        let childrenNodes: ExtensionUINode[] = [];
        let element: Element = document.createElement(type);
        props && Object.keys(props).map(propKey => {
            let propType: PropType = this.getPropType(propKey);
            let propValue: PropValue = props[propKey];
            if (propValue.constructor.name === "StateObject") { 
                stateProps.push(new StateProp(propType, propKey, propValue.key));
                propValue = propValue.value;
            }
            switch (propType) { 
                case PropType.EVENT:
                    typeof propValue === "function" && element.addEventListener(propKey.slice(2), propValue);
                    break;
                case PropType.PROPERTY:
                    element[propKey] =  propValue; //here, the propValue can be 'any'
                    break;
                case PropType.ATTRIBUTE:
                    (typeof propValue === "string" || typeof propValue === "boolean") && element.setAttribute(propKey, String(propValue));
                    break;
            }

        })
        children.map(child => { //plain string | StateObject | ExtensionUINode
            /*
            When child element(s) are passed in as props to functional component, 
            in the next recursive frame it becomes an array of those child(s),
            which is then added onto the children parameter, which itself is an array of an indeterminate number of arguments. 
            So when we hit a child in the children parameter that is not an element or a string, but an
            array itself, we need to loop through that inner array to process the child nodes.
            */
           if (Array.isArray(child)) {
               child.map(subchild => childrenNodes.push(ExtensionUI.transformChild(subchild)));
           } else {
               childrenNodes.push(ExtensionUI.transformChild(child));
           }
           
        })
        return new ExtensionUINode(element, childrenNodes, stateProps);
    }
    
    private static getPropType = (propKey: PropKey | string): PropType => {
        return propKey in PropsMap ? PropsMap[propKey] : PropType.ATTRIBUTE;
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