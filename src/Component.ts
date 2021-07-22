import ExtensionUI, { ExtensionUIElement } from "./ExtensionUI";
import { EXTENSIONUI_ATTRIBUTE_KEY, PropType } from "./Enums";
import InvalidExtensionUINode from "./Exceptions/InvalidExtensionUINode";
import KeyNotDefinedError from "./Exceptions/KeyNotDefinedError";
import { v4 as uuidv4 } from "uuid";
import StateObject from "./StateObject";
import StateProp from "./StateProp";
import ExtensionUINode from "./ExtensionUINode";

type State = {
    [key: string]: any
}

type StatePropMap = {
    [key: string]: StateProp[]
}

type StateMap = {
    [key: string]: string[]
}

export type StateObjectKey = string;

export default class Component {
    private _state: State;
    protected state: ProxyHandler<object>;
    private statePropMap: StatePropMap = {};//map of nodes to their state props
    private stateMap: StateMap = {}; //map of state to their dependent nodes
    constructor(_state: object = {}) {
        this._state = _state;
        this.state = new Proxy(this._state, { get: (target, prop, receiver): StateObject => { return new StateObject(prop.toString(), target[String(prop)]) }});
        this.render();
    }

    protected setState(newState: State): void {
        const originalState = this._state;
        Object.keys(newState).map(key => {
            if (!(key in this._state)) {
                this._state = originalState;
                throw new KeyNotDefinedError(key);
            } else {
                this._state[key] = newState[key];
                this.stateMap[key] &&
                this.stateMap[key].map(nodeId => {
                    this.hydrateNode(nodeId);
                })
            } 
        })
    }

    protected addNode(node: ExtensionUINode, parentElement: Element = document.body): void {
        if (!node.element && !node.stateProps) throw new InvalidExtensionUINode();
        if (!(node.element instanceof Element) && !(node.stateProps instanceof Array)) throw new InvalidExtensionUINode();
        
        const nodeId = uuidv4();
        node.element.setAttribute(EXTENSIONUI_ATTRIBUTE_KEY, nodeId);
        
        this.statePropMap[nodeId] = node.stateProps;
        node.stateProps.map(stateProp => {
            const stateKey: StateObjectKey = stateProp.stateKey;
            stateKey in this.stateMap ? this.stateMap[stateKey].push(nodeId) : this.stateMap[stateKey] = [nodeId];
        })

        node.children.map(child => {
            this.addNode(child, node.element);
        })

        parentElement.append(node.element);
    }


    protected reset(): void {
        document.querySelectorAll(`[${EXTENSIONUI_ATTRIBUTE_KEY}]`).forEach(element => element.remove());
        this._state = {};
        this.stateMap = {};
        this.statePropMap = {};
    }

    /*
    TODO: throw exception for invalid node id
    */
    private hydrateNode(nodeId: string){
        const element: ExtensionUIElement | null = document.querySelector(`[${EXTENSIONUI_ATTRIBUTE_KEY}="${nodeId}"]`);
        const stateProps = this.statePropMap[nodeId];
        element && stateProps.map(stateProp => {
            const propType = stateProp.type;
            const propKey = stateProp.key;
            const propValue = this._state[stateProp.stateKey];
            switch(propType) {
                case PropType.PROPERTY:
                    element[propKey] = propValue;
                    break;
                case PropType.ATTRIBUTE:
                    element.setAttribute(propKey, propValue);
                    break;
                case PropType.TEXT:
                    element.innerHTML = propValue;
                    break;
            }
        })
    }

    protected render() {}
}