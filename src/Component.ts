import { EXTENSIONUI_ATTRIBUTE_KEY } from "./Enums";
import CannotUseExtensionUINodeError from "./Exceptions/CannotUseExtensionUINodeError";
import InvalidExtensionUINode from "./Exceptions/InvalidExtensionUINode";
import KeyNotDefinedError from "./Exceptions/KeyNotDefinedError";
import ExtensionUI, { ExtensionUINode } from "./ExtensionUI";
import { v4 as uuidv4 } from "uuid";

type State = {
    [key: string]: any
}

type FamilyMap = {
    [key: string]: Element
}

type FunctionMap = {
    [key: string]: (()=> ExtensionUINode)
}

type StateMap = {
    [key: string]: string[]
}

interface LayoutNode extends ExtensionUINode {
    id: string
}

export type StateObjectKey = string;

export interface StateObject {
    _extensionUIStateMember: boolean,
    key: StateObjectKey,
    value: any
}

export default class Component {
    private _state: State;
    protected state: ProxyHandler<object>;
    private familyMap: FamilyMap = {}; //map of nodes to their parents
    private functionMap: FunctionMap = {};//map of nodes to their functions
    private stateMap: StateMap = {}; //map of state to their dependent nodes

    constructor(_state: object = {}) {
        this._state = _state;
        this.state = new Proxy(this._state, { get: (target, prop, receiver): StateObject => { return {  _extensionUIStateMember: true, key: prop.toString(), value: target[prop] }}});
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

    protected addNode(_node: (() => ExtensionUINode), parentElement=document.body): void {
        if (typeof _node != "function") throw new CannotUseExtensionUINodeError();
        
        let node: LayoutNode = Object.assign({id: uuidv4()}, _node());

        if (!node.element && !node.stateProps) throw new InvalidExtensionUINode();
        if (!(node.element instanceof Element) && !(node.stateProps instanceof Array)) throw new InvalidExtensionUINode();

        node.element.setAttribute(EXTENSIONUI_ATTRIBUTE_KEY, node.id);

        this.familyMap[node.id] = parentElement;
        this.functionMap[node.id] = _node;
        node.stateProps.map(stateProp => {
            stateProp in this.stateMap ? this.stateMap[stateProp].push(node.id) : this.stateMap[stateProp] = [node.id];
        })

        parentElement.append(node.element);
    }

    /*
    Remove all ExtensionUI elements from DOM and clear state, stateMap, familyMap, and functionMap
    */
    protected reset(): void {
        document.querySelectorAll(`[${EXTENSIONUI_ATTRIBUTE_KEY}]`).forEach(element => element.remove());
        this._state = {};
        this.stateMap = {};
        this.familyMap = {};
        this.functionMap = {};
    }

    /*
    Remove a node from the DOM, re-run its function and append it back to its parent
    TODO: throw exception for invalid node id
    */
    private hydrateNode(nodeId: string){
        if (this.familyMap[nodeId] && this.functionMap[nodeId]) {
            document.querySelector(`[${EXTENSIONUI_ATTRIBUTE_KEY}="${nodeId}"]`)?.remove();
            this.familyMap[nodeId].append(this.functionMap[nodeId]().element);  
        }
    }

    protected render() {}
}