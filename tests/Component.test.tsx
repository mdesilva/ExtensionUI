import Component from "../src/Component"
import KeyNotDefinedError from "../src/Exceptions/KeyNotDefinedError";
import ExtensionUI from "../src/ExtensionUI";

describe("setState", () => {
    test("modifies the state when given a valid key", () => {
        const myComponent = new Component({name: "Manuja"});
        myComponent['setState']({name: "DeSilva"});
        expect(myComponent['state']['name']).toBe("DeSilva");
    })
    
    test("modifies the state when given valid keys", () => {
        const myState = {address: "1 Rodeo Drive", email: "mdesilva@bu.edu"};
        const myComponent = new Component(myState);
        const newState = {address: "1 New York Lane", email: "manuja@desilva.codes"};
        myComponent['setState'](newState);
        expect(myComponent['state']['address']).toEqual(newState.address);
        expect(myComponent['state']['email']).toEqual(newState.email);
        expect(myComponent['state']).toStrictEqual(newState);
    })
    
    test("throws KeyNotDefinedError when given an invalid key, and leaves state unchanged", () => {
        const myComponent = new Component();
        const functionCallToSetState = () => {myComponent['setState']({doesntexist: "doesntexist"})};
        expect(functionCallToSetState).toThrowError();
        expect(functionCallToSetState).toThrow(KeyNotDefinedError);
        expect(myComponent['state']).toStrictEqual({});
    })
    
    test("throws KeyNotDefinedError if at least one key is invalid, even if others are valid, and leaves state unchanged", () => {
        const myState = {firstName: "Manuja", lastName: "DeSilva", email: "mdesilva@bu.edu"};
        const myComponent = new Component(myState);
        const functionCallToSetState = () => { myComponent['setState']({...myState, address: "1 Rodeo Drive"})};
        expect(functionCallToSetState).toThrowError();
        expect(functionCallToSetState).toThrow(KeyNotDefinedError);
        expect(myComponent['state']).toStrictEqual(myState);
    })
    
    test("keeps members not requested for changes intact", () => {
        const myComponent = new Component({firstName: "", lastName: "", planet: "Earth"});
        myComponent['setState']({firstName: "Manuja", lastName: "DeSilva"});
        expect(myComponent['state']['planet']).toBe("Earth");
        expect(myComponent['state']).toStrictEqual({firstName: "Manuja", lastName: "DeSilva", planet: "Earth"});
    
    })

    test("triggers re-render of extensionui elements with updated state when state is updated", () => {
        const identifier = "myVideoElement";
        class MyComponent extends Component {
            constructor() {
                super({muted: true});
            }

            public setMuteFalse() {
                this.setState({muted: false});
            }

            render() {
                const VideoStream = <video id={identifier} muted={this.state.muted}/>;
                this.addElement(VideoStream);
            }

        }
        const myComponentInstance = new MyComponent();
        let element = document.getElementById(identifier);
        expect(element.getAttribute("muted")).toBe("true");
        myComponentInstance.setMuteFalse();
        element = document.getElementById(identifier);
        expect(element.getAttribute("muted")).toBe("false");
    })
})

beforeEach(() => {
    //reset DOM before each test, otherwise each test contains the state of the test before it
    document.getElementsByTagName('html')[0].innerHTML = '';
})

describe("append", () => {
    test("adds element to body", () => {
        const myComponent = new Component();
        myComponent['addElement'](ExtensionUI.createElement("div", {class: "myDiv"}));
        expect(document.body.childElementCount).toBe(1);
        expect(document.body.firstElementChild.tagName).toBe("DIV");
        expect(document.body.firstElementChild.className).toBe("myDiv");  
    })

    test("adds element to specified parent element", () => {
        const parentElement = ExtensionUI.createElement("div", {class: "myDiv"});
        document.body.append(parentElement);
        const myComponent = new Component();
        const childElement = ExtensionUI.createElement("p", {class: "myText"}, "This is the child");
        myComponent['addElement'](childElement, document.getElementsByClassName("myDiv")[0]);
        expect(document.body.childElementCount).toBe(1);
        expect(document.body.firstElementChild.tagName).toBe("DIV");
        expect(document.body.firstElementChild.className).toBe("myDiv");
        expect(document.body.firstElementChild.childElementCount).toBe(1);
        expect(document.body.firstElementChild.firstElementChild.tagName).toBe("P");
        expect(document.body.firstElementChild.firstElementChild.className).toBe("myText");
        expect(document.body.firstElementChild.firstElementChild.textContent).toBe("This is the child");
    })
})

describe("remove", () => {
    test("deletes extensionui element from body", () => {
        const myComponent = new Component();
        const element = ExtensionUI.createElement("div", {class: "myDiv"});
        document.body.append(element);
        expect(document.body.childElementCount).toBe(1);
        expect(document.body.firstElementChild.className).toBe("myDiv");
        myComponent['removeElements']();
        expect(document.body.childElementCount).toBe(0);
        expect(document.body.hasChildNodes()).toBeFalsy();
    })

    test("deletes multiple extensionui elements from body", () => {
        const myComponent = new Component()
        const myBody =
        <div class="myDiv">
            <p class="myText"></p>
        </div>;
        document.body.append(myBody);
        expect(document.body.childElementCount).toBe(1);
        expect(document.body.firstElementChild.tagName).toBe("DIV");
        expect(document.body.firstElementChild.className).toBe("myDiv");
        expect(document.body.firstElementChild.childElementCount).toBe(1);
        expect(document.body.firstElementChild.firstElementChild.tagName).toBe("P");
        expect(document.body.firstElementChild.firstElementChild.className).toBe("myText");
        myComponent['removeElements']();
        expect(document.body.childElementCount).toBe(0);
        expect(document.body.hasChildNodes()).toBeFalsy();
    });

    test("deletes extensionui elements from body but retains non-extensionui elements", () => {
        const myComponent = new Component();
        const nativeElement = document.createElement("div");
        nativeElement.className = "nativeElement";
        document.body.append(nativeElement);
        const myElement = 
        <div class="myElem"></div>
        document.body.append(myElement);
        expect(document.body.childElementCount).toBe(2);
        myComponent['removeElements']();
        expect(document.body.childElementCount).toBe(1);
        expect(document.body.firstElementChild.tagName).toBe("DIV");
        expect(document.body.firstElementChild.className).toBe("nativeElement");
    })
})