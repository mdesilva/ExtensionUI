import { PROP_TYPE, PropsMap } from "./Enums";
import { StateObject, StateObjectKey } from "./Component";

type ElementTag = keyof HTMLElementTagNameMap;
type PropKey = keyof typeof PropsMap;
type PropValue = (() => void) | string | boolean | StateObject;

type Prop = {
    [key: string]: PropValue
}

export interface ExtensionUINode {
    stateProps: StateObjectKey[], //a list of all the state members that the element is dependent on
    element: Element
}

export default class ExtensionUI {

    public static createElement(type: ((props: object, children?: Element[]) => ExtensionUINode) | ElementTag, props: Prop, ...children: ExtensionUINode[] | string[] | StateObject[]): ExtensionUINode {
        let stateProps: StateObjectKey[] = [];
        if (typeof type == "function") {
            return type({...props, children: children});
        } 
        let element: Element = document.createElement(type);
        props && Object.keys(props).map(propKey => { 
            let propValue: PropValue = props[propKey];
            if (typeof propValue === "object" && propValue._extensionUIStateMember) { 
                //the propValue is a StateObject, so we need to record that this node depends on the StateObject key and then resolve propValue to the StateObject value
                stateProps.push(propValue.key);
                propValue = propValue.value;
            }
            switch (this.getPropType(propKey)) { //get the prop type based on the name of the prop
                case PROP_TYPE.EVENT:
                    typeof propValue === "function" && element.addEventListener(propKey.slice(2), propValue);
                    break;
                case PROP_TYPE.PROPERTY:
                    element[propKey] =  propValue; //here, the propValue can be 'any'
                    break;
                case PROP_TYPE.ATTRIBUTE:
                    (typeof propValue === "string" || typeof propValue === "boolean") && element.setAttribute(propKey, String(propValue));
                    break;
            }

        })
        children.map(child => {
            /*
            When child element(s) are passed in as props to functional component, 
            in the next recursive frame it becomes an array of those child(s),
            which is then added onto the children parameter, which itself is an array of an indeterminate number of arguments. 
            So when we hit a child in the children parameter that is not an element or a string, but an
            array itself, we need to loop through that inner array and append its nodes.
            */
           if (typeof child === "object" && child._extensionUIStateMember) { //StateObject
               stateProps.push(child.key);
               element.append(child.value);
           } else { //ExtensionUINode | string
            if (Array.isArray(child)) {
                child.map(subchild => {
                    ({element, stateProps} = this.addChildToParentElement(subchild, element, stateProps));
                })
            } else {
                ({element, stateProps} = this.addChildToParentElement(child, element, stateProps));
            }
           }
        })
        return {
            element: element,
            stateProps: stateProps
        }
    }
    
    private static getPropType = (propKey: PropKey | string): PROP_TYPE => {
        return propKey in PropsMap ? PropsMap[propKey] : PROP_TYPE.ATTRIBUTE;
    }

    private static addChildToParentElement = (child: ExtensionUINode | string, parent: Element, stateProps: StateObjectKey[]): ExtensionUINode => {
        switch (typeof child) {
            case "object":
                stateProps = stateProps.concat(child.stateProps);
                parent.append(child.element);
                break;
            case "string":
                parent.append(child);
                break;
        }
        return {
            element: parent,
            stateProps: stateProps
        }
    }
}