import Component from "../src/Component"
import { EXTENSIONUI_ATTRIBUTE_KEY } from "../src/Enums";
import InvalidExtensionUINode from "../src/Exceptions/InvalidExtensionUINode";
import KeyNotDefinedError from "../src/Exceptions/KeyNotDefinedError";
import ExtensionUI from "../src/ExtensionUI";
import ExtensionUINode from "../src/ExtensionUINode";
import StateObject from "../src/StateObject";
import {v4 as uuidv4} from "uuid";

describe("state", () => {
    test("accessing the state returns a StateObject", () => {
        const myComponent = new Component({firstName: "Manuja", lastName: "DeSilva"});
        const requestedState: StateObject = myComponent['state']['firstName'];
        expect(requestedState).toBeInstanceOf(StateObject);
        expect(requestedState.key).toBe("firstName");
        expect(requestedState.value).toBe("Manuja");
    })
})

describe("setState", () => {
    test("modifies the state when given a valid key", () => {
        const myComponent = new Component({name: "Manuja"});
        myComponent['setState']({name: "DeSilva"});
        expect(myComponent['_state']['name']).toBe("DeSilva");
    })
    
    test("modifies the state when given valid keys", () => {
        const myState = {address: "1 Rodeo Drive", email: "mdesilva@bu.edu"};
        const myComponent = new Component(myState);
        const newState = {address: "1 New York Lane", email: "manuja@desilva.codes"};
        myComponent['setState'](newState);
        expect(myComponent['_state']['address']).toEqual(newState.address);
        expect(myComponent['_state']['email']).toEqual(newState.email);
        expect(myComponent['_state']).toStrictEqual(newState);
    })
    
    test("throws KeyNotDefinedError when given an invalid key, and leaves state unchanged", () => {
        const myComponent = new Component();
        const functionCallToSetState = () => {myComponent['setState']({doesntexist: "doesntexist"})};
        expect(functionCallToSetState).toThrowError();
        expect(functionCallToSetState).toThrow(KeyNotDefinedError);
        expect(myComponent['_state']).toStrictEqual({});
    })
    
    test("throws KeyNotDefinedError if at least one key is invalid, even if others are valid, and leaves state unchanged", () => {
        const myState = {firstName: "Manuja", lastName: "DeSilva", email: "mdesilva@bu.edu"};
        const myComponent = new Component(myState);
        const functionCallToSetState = () => { myComponent['setState']({...myState, address: "1 Rodeo Drive"})};
        expect(functionCallToSetState).toThrowError();
        expect(functionCallToSetState).toThrow(KeyNotDefinedError);
        expect(myComponent['_state']).toStrictEqual(myState);
    })
    
    test("keeps members not requested for changes intact", () => {
        const myComponent = new Component({firstName: "", lastName: "", planet: "Earth"});
        myComponent['setState']({firstName: "Manuja", lastName: "DeSilva"});
        expect(myComponent['_state']['planet']).toBe("Earth");
        expect(myComponent['_state']).toStrictEqual({firstName: "Manuja", lastName: "DeSilva", planet: "Earth"});
    })

    test("updates nodes who were affected by the state change", () =>{
        const myComponent = new Component({firstName: "Manuja", planet: "Earth"});
        const hydrateNodeSpy = jest.spyOn(Component.prototype, "hydrateNode");
        const nodeOne = <h1 id="nodeOne">Hello, {myComponent['state']['firstName']}</h1>;
        const nodeTwo = <p id="nodeTwo">Today you are on planet {myComponent['state']['planet']}</p>;
        myComponent['addNode'](nodeOne);
        myComponent['addNode'](nodeTwo);
        expect(document.body.childElementCount).toBe(2);
        expect(document.getElementById("nodeOne").textContent).toBe(`Hello, Manuja`);
        expect(document.getElementById("nodeTwo").textContent).toBe("Today you are on planet Earth");
        myComponent['setState']({firstName: "Jyoti"});
        expect(hydrateNodeSpy).toBeCalledTimes(1);
        expect(document.body.childElementCount).toBe(2);
        expect(document.getElementById("nodeOne").textContent).toBe(`Hello, Jyoti`);
        expect(document.getElementById("nodeTwo").textContent).toBe("Today you are on planet Earth");
    })
})

beforeEach(() => {
    //reset DOM before each test, otherwise each test contains the state of the test before it
    document.getElementsByTagName('html')[0].innerHTML = '';
})

function mockAddNode(node: ExtensionUINode, layout: Component, parentElement: Element = document.body): string{
    const nodeId = uuidv4();
    node.element.setAttribute(EXTENSIONUI_ATTRIBUTE_KEY, nodeId);
    layout['statePropMap'][nodeId] = node.stateProps;
    node.children.map(child => {
        mockAddNode(child, layout, node.element)
    })
    parentElement.append(node.element);
    return nodeId;
}

describe("hydrateNode", () => {
    test("updates property on node", () => {
        const layout: Component = new Component({myMediaStream: {sourceName: "Manuja"}});
        const node: ExtensionUINode = <video id="myNode" srcObject={layout['state']['myMediaStream']}></video>;
        const nodeId = mockAddNode(node, layout);
        expect(document.getElementById("myNode").srcObject).toStrictEqual({sourceName: "Manuja"});
        layout['_state']['myMediaStream'] = {sourceName: "Randula"};
        layout['hydrateNode'](nodeId);
        expect(document.getElementById("myNode").srcObject).toStrictEqual({sourceName: "Randula"});
    })

    test("updates attribute on node", () => {
        const layout: Component = new Component({style: "color: red;"});
        const node: ExtensionUINode = <p id="myNode" style={layout['state']['style']}></p>;
        const nodeId = mockAddNode(node, layout);
        expect(document.getElementById("myNode").getAttribute("style")).toBe("color: red;");
        layout['_state']['style'] = "color: blue;";
        layout['hydrateNode'](nodeId);
        expect(document.getElementById("myNode").getAttribute("style")).toBe("color: blue;");
    });

    test("updates text on node", () => {
        const layout: Component = new Component({text: "Today you are on planet Earth."});
        const node: ExtensionUINode = <p id="myNode">{layout['state']['text']}</p>;
        mockAddNode(node, layout);
        const childNodeId = document.getElementById("myNode").firstElementChild.getAttribute(EXTENSIONUI_ATTRIBUTE_KEY);
        expect(document.getElementById("myNode").textContent).toBe("Today you are on planet Earth.");
        layout['_state']['text'] = "Tomorrow you are on planet Mars.";
        layout['hydrateNode'](childNodeId);
        expect(document.getElementById("myNode").textContent).toBe("Tomorrow you are on planet Mars.");
    })

    test("should put focus on node after updating", () => {
        const layout: Component = new Component({value: "Manuja"});
        const nativeNode = document.createElement("input");
        nativeNode.id = "nativeNode";
        nativeNode.type = "text";
        document.body.append(nativeNode)
        const myNode: ExtensionUINode = <input id="myNode" type="text" value={layout['state']['value']}></input>
        const myNodeId = mockAddNode(myNode, layout);
        document.getElementById("nativeNode").focus()
        expect(document.activeElement).toBe(document.getElementById("nativeNode"));
        layout['_state']['value'] = "Jyoti";
        layout['hydrateNode'](myNodeId);
        expect(document.activeElement).toBe(document.getElementById("myNode"));
    })
})

describe("addNode", () => {
    test("adds element to body", () => {
        const myComponent = new Component();
        myComponent['addNode'](ExtensionUI.createElement("div", {class: "myDiv"}));
        expect(document.body.childElementCount).toBe(1);
        expect(document.body.firstElementChild.tagName).toBe("DIV");
        expect(document.body.firstElementChild.className).toBe("myDiv");  
    })

    test("adds element to specified parent element", () => {
        const parentNode: ExtensionUINode = ExtensionUI.createElement("div", {class: "myDiv"});
        document.body.append(parentNode.element);
        const myComponent = new Component();
        const childNode = ExtensionUI.createElement("p", {class: "myText"}, "This is the child");
        myComponent['addNode'](childNode, document.getElementsByClassName("myDiv")[0]);
        expect(document.body.childElementCount).toBe(1);
        expect(document.body.firstElementChild.tagName).toBe("DIV");
        expect(document.body.firstElementChild.className).toBe("myDiv");
        expect(document.body.firstElementChild.childElementCount).toBe(1);
        expect(document.body.firstElementChild.firstElementChild.tagName).toBe("P");
        expect(document.body.firstElementChild.firstElementChild.className).toBe("myText");
        expect(document.body.firstElementChild.firstElementChild.textContent).toBe("This is the child");
    })

    test("throws error if ExtensionUINode object shape is invalid", () => {
        const myComponent = new Component();
        const addNodeCall = () => { myComponent['addNode']({notElement: null})};
        expect(addNodeCall).toThrow(InvalidExtensionUINode);
    })

    test("throws error if ExtensionUINode shape is valid but has invalid values", () =>{
        const myComponent = new Component();
        const addNodeCall = () => { myComponent['addNode']({element: [], stateProps: null, children: []})};
        expect(addNodeCall).toThrow(InvalidExtensionUINode);
    })

    test("paragraph element with stateObject is correctly added to the DOM", () => {
        const myComponent = new Component({firstName: "Manuja"});
        const nodeOne = <p id="myNode">{myComponent['state']['firstName']}</p>;
        myComponent['addNode'](nodeOne);
        expect(document.getElementById("myNode").textContent).toBe("Manuja");
    })

    test("adds text node to dom, assigns it and child nodes an id, records its child's state props, records child's state map dependency", () => {
        const myComponent = new Component({firstName: "Manuja"});
        const myNode: ExtensionUINode = <h1 id="myNode">{myComponent['state']['firstName']}</h1>; //here we manually assign the element an id so we can find it in the DOM
        myComponent['addNode'](myNode);
        expect(document.body.childElementCount).toBe(1);
        const myNodeInDOM = document.getElementById("myNode");
        expect(myNodeInDOM.getAttribute(EXTENSIONUI_ATTRIBUTE_KEY)).toBeTruthy();
        const childNodeId = myNodeInDOM.firstElementChild.getAttribute(EXTENSIONUI_ATTRIBUTE_KEY);
        expect(myComponent['stateMap']['firstName']).toStrictEqual([childNodeId]);
        expect(myComponent['statePropMap'][childNodeId]).toStrictEqual(myNode.children[0].stateProps);
    })

    test("node that uses state prop already in stateMap is added as dependent of that state prop in stateMap", () =>{
        const myComponent = new Component({firstName: "Manuja", lastName: "DeSilva"});
        const nodeOne = <h1 id="nodeOne">{myComponent['state']['lastName']}</h1>;
        const nodeTwo = <p id="nodeTwo">{myComponent['state']['lastName']}, {myComponent['state']['firstName']}</p>;
        myComponent['addNode'](nodeOne);
        myComponent['addNode'](nodeTwo);
        expect(myComponent['stateMap']['lastName'].length).toBe(2);
    });

})

describe("reset", () => {
    test("deletes extensionui element from body and resets all Layout members", () => {
        const myComponent = new Component();
        const node: ExtensionUINode = ExtensionUI.createElement("div", {class: "myDiv"});
        node.element.setAttribute(EXTENSIONUI_ATTRIBUTE_KEY, "0");
        document.body.append(node.element);
        expect(document.body.childElementCount).toBe(1);
        expect(document.body.firstElementChild.className).toBe("myDiv");
        myComponent['reset']();
        expect(document.body.childElementCount).toBe(0);
        expect(document.body.hasChildNodes()).toBeFalsy();
        expect(myComponent['_state']).toStrictEqual({});
        expect(myComponent['stateMap']).toStrictEqual({});
        expect(myComponent['statePropMap']).toStrictEqual({});
    })

    test("deletes multiple extensionui elements from body and resets all Layout members", () => {
        const myComponent = new Component()
        const myNode: ExtensionUINode =
        <div class="myDiv">
            <p class="myText"></p>
        </div>;
        myNode.element.setAttribute(EXTENSIONUI_ATTRIBUTE_KEY, "0");
        myNode.children[0].element.setAttribute(EXTENSIONUI_ATTRIBUTE_KEY, "1");
        myNode.element.append(myNode.children[0].element);
        document.body.append(myNode.element);
        expect(document.body.childElementCount).toBe(1);
        expect(document.body.firstElementChild.tagName).toBe("DIV");
        expect(document.body.firstElementChild.className).toBe("myDiv");
        expect(document.body.firstElementChild.childElementCount).toBe(1);
        expect(document.body.firstElementChild.firstElementChild.tagName).toBe("P");
        expect(document.body.firstElementChild.firstElementChild.className).toBe("myText");
        myComponent['reset']();
        expect(document.body.childElementCount).toBe(0);
        expect(document.body.hasChildNodes()).toBeFalsy();
        expect(myComponent['_state']).toStrictEqual({});
        expect(myComponent['stateMap']).toStrictEqual({});
        expect(myComponent['statePropMap']).toStrictEqual({});
    });

    test("deletes extensionui elements from body but retains non-extensionui elements and resets all Layout members", () => {
        const myComponent = new Component();
        const nativeElement = document.createElement("div");
        nativeElement.className = "nativeElement";
        document.body.append(nativeElement);
        const myNode: ExtensionUINode = <div class="myElem"></div>
        myNode.element.setAttribute(EXTENSIONUI_ATTRIBUTE_KEY, "0");
        document.body.append(myNode.element);
        expect(document.body.childElementCount).toBe(2);
        myComponent['reset']();
        expect(document.body.childElementCount).toBe(1);
        expect(document.body.firstElementChild.tagName).toBe("DIV");
        expect(document.body.firstElementChild.className).toBe("nativeElement");
        expect(myComponent['_state']).toStrictEqual({});
        expect(myComponent['stateMap']).toStrictEqual({});
        expect(myComponent['statePropMap']).toStrictEqual({});
    })
})