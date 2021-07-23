import { PropType } from "./Enums";
import ExtensionUINode from "./ExtensionUINode";
import StateObject from "./StateObject";
import StateProp from "./StateProp";

type InputChildren = (ExtensionUINode | string | StateObject)[];

export default class Children {
    public children: ExtensionUINode[] = [];

    constructor(_children: InputChildren) {
        _children.map(child => {
            if (Array.isArray(child)) {
                child.map(subchild => this.children.push(new Child(subchild).child));
            } else {
                this.children.push(new Child(child).child);
            }
        })
    }
}

export class Child {
    public child: ExtensionUINode;

    constructor(child: ExtensionUINode | string | StateObject) {
        switch (child.constructor.name) {
            case "String":
                this.child = Child.createExtensionUINodeFromPlainText(child);
                break;
            case "StateObject":
                this.child = Child.createExtensionUINodeFromStateObject(child);
                break;
            default:
                this.child = child;
                break;
        }
    }

    private static createExtensionUINodeFromPlainText(text: string): ExtensionUINode {
        let element = document.createElement("span");
        element.append(text);
        return new ExtensionUINode(element);
    }

    private static createExtensionUINodeFromStateObject(stateObject: StateObject): ExtensionUINode {
        let element = document.createElement("span");
        element.append(stateObject.value);
        return new ExtensionUINode(element, new Children([]), [new StateProp(PropType.TEXT, "", stateObject.key)]);
    }
}