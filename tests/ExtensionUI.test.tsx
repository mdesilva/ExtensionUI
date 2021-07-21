import { expect, test } from "@jest/globals";
import { StateObjectKey } from "../src/Component";
import { PropType } from "../src/Enums";
import ExtensionUI from "../src/ExtensionUI";
import ExtensionUINode from "../src/ExtensionUINode";
import StateObject from "../src/StateObject";
import StateProp from "../src/StateProp";

const MockParagraphComponent = ({className, text}) => {
    return(<p class={className}>{text}</p>)
}        

const MockCheckboxComponent = ({selected}) => {
    return(
        <input type="checkbox" value={selected}/>
    )
}

const MockControlComponent = ({label, selected}) => {
    return(
        <div class="control">
            <label>{label}</label>
            <MockCheckboxComponent selected={selected}/>
        </div>
    )
}

const MockModalComponentWithChildren = ({children}) => {
    return(
        <div class="modal">
            {children}
        </div>
    )
}

function verifyStateProp(stateProp: StateProp, type: PropType, stateKey: StateObjectKey,  key: string = "") {
    expect(stateProp.type).toBe(type);
    expect(stateProp.stateKey).toBe(stateKey);
    expect(stateProp.key).toBe(key);
}

test("createElement returns ExtensionUINode object", () => {
    const node: ExtensionUINode = <div></div>;
    expect(node.constructor.name).toBe("ExtensionUINode");
    expect(node.children).toBeDefined();
    expect(node.stateProps).toBeDefined();
    expect(node.element).toBeDefined();
})


beforeEach(() => {
    document.querySelector('html').innerHTML = "";
});

describe("createElement generates ExtensionUINode", () => {

    test("returns h1 element with 'theater-heading' class and 'red' style color", () => {
        const element: Element = 
        ExtensionUI.createElement("h1", {
            class: "theater-heading",
            style: "color: red;"
        }).element;
        expect(element.className).toBe("theater-heading");
        expect(element.getAttribute("style")).toBe("color: red;");
    })
    
    test("returns div element with one child, h1, which has some text", () => {
        const node: ExtensionUINode = <div><h1>Heading 1</h1></div>
        const children: Array<ExtensionUINode> = node.children;
        expect(children.length).toBe(1);
        expect(children[0].element.tagName).toBe("H1");
        expect(children[0].children[0].element.tagName).toBe("SPAN");
        expect(children[0].children[0].element.textContent).toBe("Heading 1");
    })
    
    test("returns div parent with two children, h1 and p, each which has text", () => {
        const node: ExtensionUINode = ExtensionUI.createElement(
            "div",
            null,
            ExtensionUI.createElement("h1", null, "Heading 1"),
            ExtensionUI.createElement("p", null, "This is some text")
        );
        const children: Array<ExtensionUINode> = node.children;
        expect(children.length).toBe(2);
        expect(children[0].element.tagName).toBe("H1");
        children[0].element.append(children[0].children[0].element);
        expect(children[0].element.textContent).toBe("Heading 1");
        expect(children[1].element.tagName).toBe("P");
        children[1].element.append(children[1].children[0].element);
        expect(children[1].element.textContent).toBe("This is some text");
    })
    
    test("returns div parent with various attributes and h1 and p children with attributes", () => {
        const node: ExtensionUINode = ExtensionUI.createElement(
            "div",
            {
                class: "theater-wrapper",
                style: "color: red;"
            },
            ExtensionUI.createElement("h1", {class: "theater-heading"}, "Heading 1"),
            ExtensionUI.createElement("p", {class: "theater-text"}, "This is some text")
        );
        const children: Array<ExtensionUINode> = node.children;
        expect(children.length).toBe(2);
        expect(node.element.className).toBe("theater-wrapper");
        expect(node.element.getAttribute("style")).toBe("color: red;");
        expect(children[0].element.className).toBe("theater-heading");
        expect(children[1].element.className).toBe("theater-text");
    })
    
    test("generates paragraph element via direct JSX", () => {
        const text = "This is some text";
        const node: ExtensionUINode = <p class="theater-toggle">{text}</p>
        expect(node.element.tagName).toBe("P");
        expect(node.element.className).toBe("theater-toggle");
        node.element.append(node.children[0].element);
        expect(node.element.textContent).toBe(text);
    })
    
    
    test("generates paragraph element via a functional component", () => {
        const myClass = "custom-paragraph";
        const myText = "My text"
        const node: ExtensionUINode = <MockParagraphComponent className={myClass} text={myText}/>
        expect(node.element.tagName).toBe("P");
        expect(node.element.className).toBe(myClass);
        node.element.append(node.children[0].element);
        expect(node.element.textContent).toBe(myText);
    })
    
    test("generates paragraph element with one text child via a functional component", () => {
        const MockBylineComponent = ({className, contribution, author}) => {
            return(<p class={className}>{contribution} - <strong>{author}</strong></p>)
        }
        const myClass = "byline";
        const contribution = "Technical Work";
        const author = "Manuja DeSilva"
        const node: ExtensionUINode = <MockBylineComponent className={myClass} contribution={contribution} author={author}/>
        expect(node.element.tagName).toBe("P");
        expect(node.element.className).toBe(myClass);
        node.element.append(node.children[0].element);
        node.element.append(node.children[1].element);
        expect(node.element.textContent).toBe(`${contribution} - `);
        node.children[2].element.append(node.children[2].children[0].element);
        node.element.append(node.children[2].element);
        expect(node.element.textContent).toBe(`${contribution} - ${author}`);
    })
    
    test("generates a div with a functional component explicitly declared as a child", () => {
        const MockModalComponent = ({text}) => {
            return(
                <div class="modal">
                    <MockParagraphComponent className="modal-text" text={text}/>
                </div>
            )
        }
        const myText = "This is a modal";
        const node: ExtensionUINode = <MockModalComponent text={myText}/>
        expect(node.element.tagName).toBe("DIV");
        expect(node.element.className).toBe("modal");
        const children: Array<ExtensionUINode> = node.children;
        expect(children.length).toBe(1);
        expect(children[0].element.className).toBe("modal-text")
        expect(children[0].children[0].element.textContent).toBe(myText);
    })
    
    test("generates a div with two functional component children, each with their own label and functional component children", () => {
        const MockModalComponent = () => {
            return(
                <div class="modal">
                    <MockControlComponent label="Muted" selected={false}/>
                    <MockControlComponent label="Camera Enabled" selected={true}/>
                </div>
            )
        }
        const assertControlAttributes = (control: ExtensionUINode, label, selected) => {
            expect(control.element.className).toBe("control");
            const controlChildren: Array<ExtensionUINode> = control.children;
            expect(controlChildren[0].element.tagName).toBe("LABEL");
            expect(controlChildren[0].children[0].element.textContent).toBe(label);
            expect(controlChildren[1].element.tagName).toBe("INPUT");
            expect(controlChildren[1].element.getAttribute("type")).toBe("checkbox");
            expect(controlChildren[1].element.getAttribute("value")).toBe(selected);
        }
        const node: ExtensionUINode = <MockModalComponent/>
        expect(node.element.className).toBe("modal");
        const children: Array<ExtensionUINode> = node.children;
        expect(children.length).toBe(2);
        assertControlAttributes(children[0], "Muted", "false");
        assertControlAttributes(children[1], "Camera Enabled", "true");
    })

    test("generates an element with a child via a functional component", () => {
        const node: ExtensionUINode = 
        <MockModalComponentWithChildren>
            <input type="text" name="firstName" value="Manuja"/>
        </MockModalComponentWithChildren>
        expect(node.element.tagName).toBe("DIV");
        expect(node.element.className).toBe("modal");
        const children: Array<ExtensionUINode> = node.children;
        expect(children.length).toBe(1);
        expect(children[0].element.tagName).toBe("INPUT");
        expect(children[0].element.getAttribute("type")).toBe("text");
        expect(children[0].element.getAttribute("name")).toBe("firstName");
        expect(children[0].element.getAttribute("value")).toBe("Manuja");
    })

    test("generates an element with children via a functional component", () => {
        const node: ExtensionUINode = 
        <MockModalComponentWithChildren>
            <input type="text" name="email" value="myemail"/>
            <input type="password" name="password" value="mypassword"/>
        </MockModalComponentWithChildren>
        expect(node.element.tagName).toBe("DIV");
        expect(node.element.className).toBe("modal");
        const firstChild = node.children[0].element;
        expect(firstChild.getAttribute("type")).toBe("text");
        expect(firstChild.getAttribute("name")).toBe("email");
        expect(firstChild.getAttribute("value")).toBe("myemail");
        const lastChild = node.children[1].element;
        expect(lastChild.getAttribute("type")).toBe("password");
        expect(lastChild.getAttribute("name")).toBe("password");
        expect(lastChild.getAttribute("value")).toBe("mypassword");
    })

    //explicit - prewritten elements
    //implicit - arbitrary elements (can be passed in by user when function is called)
    test("generates an element with both explicitly and implicitly declared children via a functional component", () =>{
        const MockModalComponent = ({color, children}) =>{
            return(
                <div class="modal">
                    <div color={color} class="header"></div>
                    {children}
                    <div color={color} class="footer"></div>
                </div>
            )
        }
        const myColorProp = "red";
        const myText = "You made it!"
        const node: ExtensionUINode = 
        <MockModalComponent color={myColorProp}>
            <p class="custom-text">{myText}</p>
        </MockModalComponent>
        expect(node.element.tagName).toBe("DIV");
        expect(node.element.className).toBe("modal");
        const children: ExtensionUINode[] = node.children;
        expect(children.length).toBe(3);
        const firstChild = children[0].element;
        expect(firstChild.tagName).toBe("DIV");
        expect(firstChild.getAttribute("color")).toBe(myColorProp);
        expect(firstChild.className).toBe("header");
        const middleChild = children[1].element;
        expect(middleChild.tagName).toBe("P");
        expect(middleChild.className).toBe("custom-text");
        expect(children[1].children[0].element.textContent).toBe(myText);
        const lastChild = children[2].element;
        expect(lastChild.tagName).toBe("DIV");
        expect(lastChild.getAttribute("color")).toBe(myColorProp)
        expect(lastChild.className).toBe("footer");
    })

    test("does not add child element to functional component that doesn't accept children", () => {
        const myText = "Should not have a child";
        const node: ExtensionUINode = 
        <MockParagraphComponent className="myParagraph" text={myText}>
            <div id="child"> Text that shouldn't be here</div>
        </MockParagraphComponent>
        expect(node.children[0].element.textContent).toBe(myText);
        expect(node.children.length).toBe(1);
    })

    test("returns extensionui element object when given StateObject props as child", () => {
        const _state = {firstName: "Manuja"};
        const node: ExtensionUINode = <p>{new StateObject("firstName", _state.firstName)}</p>;
        expect(node.element.tagName).toBe("P");
        expect(node.children[0].element.textContent).toBe(_state.firstName);
        verifyStateProp(node.children[0].stateProps[0], PropType.TEXT, "firstName");
    })

    test("returns extensionui element object when given StateObject props as props", () => {
        const _state = {color: "red"};
        const node: ExtensionUINode = <p color={new StateObject("color", _state.color)}>Alert</p>;
        expect(node.element.tagName).toBe("P");
        expect(node.element.getAttribute("color")).toBe(_state.color);
        expect(node.children[0].element.textContent).toBe("Alert");
        verifyStateProp(node.stateProps[0], PropType.ATTRIBUTE, "color", "color");
    })

    test("returns extensionui element object that has stateProps for itself and its children, with state being passed in as children and props", () => {
        const _state = {firstName: "Manuja", age: 23, lastName: "DeSilva"};
        const node: ExtensionUINode = <div dataLastName={new StateObject("lastName", _state.lastName)}>
            <h1>{new StateObject("firstName", _state.firstName)}</h1>
            <p>{new StateObject("age", _state.age)}</p>
        </div>
        verifyStateProp(node.stateProps[0], PropType.ATTRIBUTE, "lastName", "dataLastName");
        verifyStateProp(node.children[0].children[0].stateProps[0], PropType.TEXT, "firstName");
        verifyStateProp(node.children[1].children[0].stateProps[0], PropType.TEXT, "age");
    })

    test("returns extensionui element when given a functional component that depends on state", () => {
        const node: ExtensionUINode = <MockParagraphComponent className={new StateObject("className", "myParagraph")} text={new StateObject("greeting", "Hello world")}/>;
        expect(node.element.className).toBe("myParagraph");
        expect(node.children[0].element.textContent).toBe("Hello world");
        expect(node.stateProps.length).toBe(1);
        const nodeStateProp = node.stateProps[0];
        expect(nodeStateProp.type).toBe(PropType.ATTRIBUTE);
        expect(nodeStateProp.key).toBe("class");
        expect(nodeStateProp.stateKey).toBe("className");
        expect(node.children[0].stateProps.length).toBe(1);
        const textChildStateProp = node.children[0].stateProps[0];
        expect(textChildStateProp.type).toBe(PropType.TEXT);
        expect(textChildStateProp.key).toBe("");
        expect(textChildStateProp.stateKey).toBe("greeting");
    })

    test("returns span element within a paragraph element when given plain text", () => {
        const node: ExtensionUINode = <p>Manuja DeSilva</p>;
        const textChild = node.children[0];
        expect(textChild.element.tagName).toBe("SPAN");
        expect(textChild.element.textContent).toBe("Manuja DeSilva");
        expect(textChild.children.length).toBe(0);
        expect(textChild.stateProps.length).toBe(0);
    })
})

describe("createElement correctly assigns event listeners to elements", () => {
    test("non-functional element has working event listener", () => {
        const myNativeElement = document.createElement("p");
        myNativeElement.id = "myNativeElement";
        myNativeElement.textContent = "This was written once."
        document.body.append(myNativeElement);
        const changeText = () => {
            document.getElementById("myNativeElement").textContent = "This was written twice.";
        }
        const node: ExtensionUINode = <div id="myElement" onclick={changeText}/>
        document.body.append(node.element);
        expect(document.getElementById("myElement").getAttribute("onclick")).toBeFalsy();
        expect(document.getElementById("myNativeElement").textContent).toBe("This was written once.")
        document.getElementById("myElement").click();
        expect(document.getElementById("myNativeElement").textContent).toBe("This was written twice.")
    })

    test("functional component has working event listener", () => {
        const myNativeElement = document.createElement("p");
        myNativeElement.id = "myNativeElement";
        myNativeElement.textContent = "This was written once."
        document.body.append(myNativeElement);
        const changeText = () => {
            document.getElementById("myNativeElement").textContent = "This was written twice.";
        }
        const Toggle = ({id, callback}) => {
            return(
                <div id={id} onclick={callback}/>
            )
        }
        let node: ExtensionUINode = <Toggle id="myToggle" callback={changeText}/>;
        document.body.append(node.element);
        let testElement = document.getElementById("myToggle");
        expect(testElement.getAttribute("callback")).toBeFalsy();
        expect(testElement.getAttribute("onclick")).toBeFalsy();
        expect(testElement.getAttribute("id")).toBe("myToggle");
        expect(document.getElementById("myNativeElement").textContent).toBe("This was written once.")
        document.getElementById("myToggle").click();
        expect(document.getElementById("myNativeElement").textContent).toBe("This was written twice.")
    })
})

describe("createElement correctly assigns properties to elements", () => {

    test("element has srcObject property", () => {
        let myMediaStream = {src: "mySrc"}
        let node: ExtensionUINode = <video id="myVideo" srcObject={myMediaStream}/>
        expect(node.element.srcObject).toBeTruthy();
        expect(node.element.srcObject).toBe(myMediaStream);
    })
})

describe("createTextNode returns ExtensionUINode containing span element", () => {
    test("when given plain text", () => {
        let node = ExtensionUI['createTextNodeFromPlainText']("This is some text");
        expect(node.element.tagName).toBe("SPAN");
        expect(node.element.textContent).toBe("This is some text");
        expect(node.children.length).toBe(0);
        expect(node.stateProps.length).toBe(0);
    })

    test("when given a state object", () => {
        let node = ExtensionUI['createTextNodeFromStateObject'](new StateObject("firstName", "Manuja"));
        expect(node.element.tagName).toBe("SPAN");
        expect(node.element.textContent).toBe("Manuja");
        expect(node.children.length).toBe(0);
        expect(node.stateProps.length).toBe(1);
        let stateProp = node.stateProps[0];
        expect(stateProp.type).toBe(PropType.TEXT);
        expect(stateProp.key).toBe("");
        expect(stateProp.stateKey).toBe("firstName");
    })
})