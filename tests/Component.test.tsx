import Component from "../src/Component"
import { EXTENSIONUI_ATTRIBUTE_KEY } from "../src/Enums";
import CannotUseExtensionUINodeError from "../src/Exceptions/CannotUseExtensionUINodeError";
import InvalidExtensionUINode from "../src/Exceptions/InvalidExtensionUINode";
import KeyNotDefinedError from "../src/Exceptions/KeyNotDefinedError";
import ExtensionUI, { ExtensionUINode } from "../src/ExtensionUI";

describe("state", () => {
    test("accessing the state returns a StateObject", () => {
        const myState = {firstName: "Manuja", lastName: "DeSilva"}
        const myComponent = new Component(myState);
        const requestedState = myComponent['state']['firstName'];
        expect(requestedState).toBeInstanceOf(Object);
        expect(requestedState).toStrictEqual({_extensionUIStateMember: true, key: "firstName", value: "Manuja"});
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

    test("updates the state, removes only nodes who were affected by the state change from the DOM, re-runs their function and appends those nodes back to their parents", () =>{
        const myComponent = new Component({firstName: "Manuja", planet: "Earth"});
        const hydrateNodeSpy = jest.spyOn(Component.prototype, "hydrateNode");
        const nodeOne = () => <h1 id="nodeOne">Hello, {myComponent['state']['firstName']}</h1>;
        const nodeTwo = () => <p id="nodeTwo">Today you are on planet {myComponent['state']['planet']}</p>;
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

describe("addElement", () => {
    test("adds element to body", () => {
        const myComponent = new Component();
        myComponent['addNode'](() => ExtensionUI.createElement("div", {class: "myDiv"}));
        expect(document.body.childElementCount).toBe(1);
        expect(document.body.firstElementChild.tagName).toBe("DIV");
        expect(document.body.firstElementChild.className).toBe("myDiv");  
    })

    test("adds element to specified parent element", () => {
        const parentNode: ExtensionUINode = ExtensionUI.createElement("div", {class: "myDiv"});
        document.body.append(parentNode.element);
        const myComponent = new Component();
        const childNode = () => ExtensionUI.createElement("p", {class: "myText"}, "This is the child");
        myComponent['addNode'](childNode, document.getElementsByClassName("myDiv")[0]);
        expect(document.body.childElementCount).toBe(1);
        expect(document.body.firstElementChild.tagName).toBe("DIV");
        expect(document.body.firstElementChild.className).toBe("myDiv");
        expect(document.body.firstElementChild.childElementCount).toBe(1);
        expect(document.body.firstElementChild.firstElementChild.tagName).toBe("P");
        expect(document.body.firstElementChild.firstElementChild.className).toBe("myText");
        expect(document.body.firstElementChild.firstElementChild.textContent).toBe("This is the child");
    })

    test("throws error if plain ExtensionUINode is passed in for node", () => {
        const myNode: ExtensionUINode = <div></div>;
        const myComponent = new Component();
        const addNodeCall = () => { myComponent['addNode'](myNode)};
        expect(addNodeCall).toThrow(CannotUseExtensionUINodeError);
    })

    test("throws error if ExtensionUINode object shape is invalid", () => {
        const myComponent = new Component();
        const addNodeCall = () => { myComponent['addNode'](() => {return {notElement: null}})};
        expect(addNodeCall).toThrow(InvalidExtensionUINode);
    })

    test("throws error if ExtensionUINode shape is valid but has invalid values", () =>{
        const myComponent = new Component();
        const addNodeCall = () => { myComponent['addNode'](() => {return {element: [], stateProps: null}})};
        expect(addNodeCall).toThrow(InvalidExtensionUINode);
    })

    test("executes node function, assigns it's element an id, records parent, records function, records state props, and appends node to DOM", () => {
        const myComponent = new Component({firstName: "Manuja"});
        const myNode = () => <h1 id="myNode">{myComponent['state']['firstName']}</h1>; //here we manually assign the element an id so we can find it in the DOM
        myComponent['addNode'](myNode);
        expect(document.body.childElementCount).toBe(1);
        const myNodeInDOM = document.getElementById("myNode");
        const myNodeId = myNodeInDOM.getAttribute(EXTENSIONUI_ATTRIBUTE_KEY);
        expect(myNodeId).toBeTruthy();
        expect(myComponent['familyMap'][myNodeId]).toBe(document.body);
        expect(myComponent['functionMap'][myNodeId]).toBe(myNode);
        expect(myComponent['stateMap']['firstName']).toStrictEqual([myNodeId]);
    })

    test("node that uses state prop already in stateMap is added as dependent of that state prop in stateMap", () =>{
        const myComponent = new Component({firstName: "Manuja", lastName: "DeSilva"});
        const nodeOne = () => <h1 id="nodeOne">{myComponent['state']['lastName']}</h1>;
        const nodeTwo = () => <p id="nodeTwo">{myComponent['state']['lastName']}, {myComponent['state']['firstName']}</p>;
        myComponent['addNode'](nodeOne);
        myComponent['addNode'](nodeTwo);
        expect(myComponent['stateMap']['lastName'].length).toBe(2);
        expect(myComponent['stateMap']['lastName']).toEqual([document.getElementById("nodeOne").getAttribute(EXTENSIONUI_ATTRIBUTE_KEY), document.getElementById("nodeTwo").getAttribute(EXTENSIONUI_ATTRIBUTE_KEY)])
    })
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
        expect(myComponent['familyMap']).toStrictEqual({});
        expect(myComponent['functionMap']).toStrictEqual({});
    })

    test("deletes multiple extensionui elements from body and resets all Layout members", () => {
        const myComponent = new Component()
        const myNode: ExtensionUINode =
        <div class="myDiv">
            <p class="myText"></p>
        </div>;
        myNode.element.setAttribute(EXTENSIONUI_ATTRIBUTE_KEY, "0");
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
        expect(myComponent['familyMap']).toStrictEqual({});
        expect(myComponent['functionMap']).toStrictEqual({});
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
        expect(myComponent['familyMap']).toStrictEqual({});
        expect(myComponent['functionMap']).toStrictEqual({});
    })
})