import { expect, test } from "@jest/globals";
import { StateObject } from "../src/Component";
import ExtensionUI from "../src/ExtensionUI";
import { ExtensionUINode } from "../src/ExtensionUI";

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

function mockStateObject(key: string, value: any): StateObject {
    return {
        _extensionUIStateMember: true,
        key: key,
        value: value
    }
}

test("createElement returns ExtensionUINode object", () => {
    const node: ExtensionUINode = <div></div>;
    expect(Object.keys(node)).toStrictEqual(["element", "stateProps"]);
    expect(node['element'] instanceof Element).toBeTruthy();
    expect(node['stateProps'] instanceof Array).toBeTruthy();
})


beforeEach(() => {
    document.querySelector('html').innerHTML = "";
});

describe("createElement generates elements", () => {

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
        const element = ExtensionUI.createElement(
            "div", 
            null, 
            ExtensionUI.createElement("h1", null, "Heading 1")
        ).element;
        expect(element.hasChildNodes()).toBeTruthy();
        expect(element.firstElementChild.tagName).toBe("H1");
        expect(element.firstChild.textContent).toBe("Heading 1");
    })
    
    test("returns div parent with two children, h1 and p, each which has text", () => {
        const element = ExtensionUI.createElement(
            "div",
            null,
            ExtensionUI.createElement("h1", null, "Heading 1"),
            ExtensionUI.createElement("p", null, "This is some text")
        ).element;
        expect(element.hasChildNodes()).toBeTruthy();
        expect(element.childElementCount).toEqual(2);
        expect(element.firstElementChild.tagName).toBe("H1");
        expect(element.firstChild.textContent).toBe("Heading 1");
        expect(element.lastElementChild.tagName).toBe("P");
        expect(element.lastChild.textContent).toBe("This is some text");
    })
    
    test("returns div parent with various attributes and h1 and p children with attributes", () => {
        const element = ExtensionUI.createElement(
            "div",
            {
                class: "theater-wrapper",
                style: "color: red;"
            },
            ExtensionUI.createElement("h1", {class: "theater-heading"}, "Heading 1"),
            ExtensionUI.createElement("p", {class: "theater-text"}, "This is some text")
        ).element
        expect(element.hasChildNodes()).toBeTruthy();
        expect(element.className).toBe("theater-wrapper");
        expect(element.getAttribute("style")).toBe("color: red;");
        expect(element.firstElementChild.className).toBe("theater-heading");
        expect(element.lastElementChild.className).toBe("theater-text");
    })
    
    test("returns div with heading child that can be properly added to the DOM", () => {
        const headingText = "Dynamically generated heading";
        const node = ExtensionUI.createElement(
            "div",
            {
                class: "theater-wrapper"
            },
            ExtensionUI.createElement("h1", null, headingText)
        );
        document.body.appendChild(node.element);
        expect(document.body.hasChildNodes()).toBeTruthy();
        expect(document.body.firstElementChild.className).toBe("theater-wrapper");
        expect(document.body.firstChild.firstChild.textContent).toBe(headingText);
    })
    
    test("generates paragraph element via direct JSX", () => {
        const text = "This is some text";
        const node: ExtensionUINode = <p class="theater-toggle">{text}</p>
        expect(node.element.tagName).toBe("P");
        expect(node.element.className).toBe("theater-toggle");
        expect(node.element.textContent).toBe(text);
    })
    
    
    test("generates paragraph element via a functional component", () => {
        const myClass = "custom-paragraph";
        const myText = "My text"
        const node: ExtensionUINode = <MockParagraphComponent className={myClass} text={myText}/>
        expect(node.element.tagName).toBe("P");
        expect(node.element.className).toBe(myClass);
        expect(node.element.textContent).toBe(myText);
    })
    
    test("generates paragraph element with two children, text and strong text child, via a functional component", () => {
        const MockBylineComponent = ({className, contribution, author}) => {
            return(<p class={className}>{contribution} - <strong>{author}</strong></p>)
        }
        const myClass = "byline";
        const contribution = "Technical Work";
        const author = "Manuja DeSilva"
        const node: ExtensionUINode = <MockBylineComponent className={myClass} contribution={contribution} author={author}/>
        expect(node.element.tagName).toBe("P");
        expect(node.element.className).toBe(myClass);
        expect(node.element.hasChildNodes()).toBeTruthy();
        expect(node.element.firstChild.textContent).toBe(contribution);
        expect(node.element.lastChild.tagName).toBe("STRONG");
        expect(node.element.lastChild.textContent).toBe(author);
        expect(node.element.textContent).toBe("Technical Work - Manuja DeSilva")
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
        expect(node.element.hasChildNodes()).toBeTruthy();
        expect(node.element.firstChild.className).toBe("modal-text")
        expect(node.element.firstChild.textContent).toBe(myText);
    })
    
    test("generates a div with two explicitly declared functional component children, each with their own label and explicitly declared functional component children", () => {
        const MockModalComponent = () => {
            return(
                <div class="modal">
                    <MockControlComponent label="Muted" selected={false}/>
                    <MockControlComponent label="Camera Enabled" selected={true}/>
                </div>
            )
        }
        const assertControlAttributes = (control, label, selected) => {
            expect(control.className).toBe("control");
            expect(control.firstChild.tagName).toBe("LABEL");
            expect(control.firstChild.textContent).toBe(label);
            expect(control.lastChild.tagName).toBe("INPUT");
            expect(control.lastChild.type).toBe("checkbox");
            expect(control.lastChild.value).toBe(selected);
        }
        const node: ExtensionUINode = <MockModalComponent/>
        expect(node.element.className).toBe("modal");
        expect(node.element.childElementCount).toBe(2);
        assertControlAttributes(node.element.firstChild, "Muted", "false");
        assertControlAttributes(node.element.lastChild, "Camera Enabled", "true");
    })

    test("generates an element with an implicitly declared child via a functional component", () => {
        const node: ExtensionUINode = 
        <MockModalComponentWithChildren>
            <input type="text" name="firstName" value="Manuja"/>
        </MockModalComponentWithChildren>
        expect(node.element.tagName).toBe("DIV");
        expect(node.element.className).toBe("modal");
        expect(node.element.hasChildNodes()).toBeTruthy();
        const child = node.element.firstElementChild;
        expect(child.tagName).toBe("INPUT");
        expect(child.getAttribute("type")).toBe("text");
        expect(child.getAttribute("name")).toBe("firstName");
        expect(child.getAttribute("value")).toBe("Manuja");
    })

    test("generates an element with implicitly declared children via a functional component", () => {
        const node: ExtensionUINode = 
        <MockModalComponentWithChildren>
            <input type="text" name="email" value="myemail"/>
            <input type="password" name="password" value="mypassword"/>
        </MockModalComponentWithChildren>
        expect(node.element.tagName).toBe("DIV");
        expect(node.element.className).toBe("modal");
        expect(node.element.childElementCount).toBe(2);
        const firstChild = node.element.firstElementChild;
        expect(firstChild.getAttribute("type")).toBe("text");
        expect(firstChild.getAttribute("name")).toBe("email");
        expect(firstChild.getAttribute("value")).toBe("myemail");
        const lastChild = node.element.lastElementChild;
        expect(lastChild.getAttribute("type")).toBe("password");
        expect(lastChild.getAttribute("name")).toBe("password");
        expect(lastChild.getAttribute("value")).toBe("mypassword");
    })

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
        expect(node.element.childElementCount).toBe(3);
        const firstChild = node.element.firstElementChild;
        expect(firstChild.tagName).toBe("DIV");
        expect(firstChild.getAttribute("color")).toBe(myColorProp);
        expect(firstChild.className).toBe("header");
        const middleChild: Element = node.element.children[1];
        expect(middleChild.tagName).toBe("P");
        expect(middleChild.className).toBe("custom-text");
        expect(middleChild.textContent).toBe(myText);
        const lastChild = node.element.lastElementChild;
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
        expect(node.element.textContent).toBe(myText);
        expect(node.element.childElementCount).toBe(0);
        expect(node.element.firstElementChild).toBeNull();
        expect(node.element.childNodes.length).toBe(1);
        expect(node.element.childNodes[0].textContent).toBe(myText);
    })

    test("returns extensionui element object when given StateObject props as child", () => {
        const _state = {firstName: "Manuja"};
        const node: ExtensionUINode = <p>{mockStateObject("firstName", _state.firstName)}</p>;
        expect(node.element.tagName).toBe("P");
        expect(node.element.textContent).toBe(_state.firstName);
        expect(node.stateProps).toStrictEqual(['firstName']);
    })

    test("returns extensionui element object when given StateObject props as props", () => {
        const _state = {color: "red"};
        const node: ExtensionUINode = <p color={mockStateObject("color", _state.color)}>Alert</p>;
        expect(node.element.tagName).toBe("P");
        expect(node.element.textContent).toBe("Alert");
        expect(node.stateProps).toStrictEqual(["color"])
    })

    test("returns extensionui element object that has stateProps for itself and its children, with state being passed in as children and props", () => {
        const _state = {firstName: "Manuja", age: 23, lastName: "DeSilva"};
        const node: ExtensionUINode = <div dataLastName={mockStateObject("lastName", _state.lastName)}>
            <h1>{mockStateObject("firstName", _state.firstName)}</h1>
            <p>{mockStateObject("age", _state.age)}</p>
        </div>
        expect(node.stateProps.includes("firstName")).toBeTruthy();
        expect(node.stateProps.includes("age")).toBeTruthy();
        expect(node.stateProps.includes("lastName")).toBeTruthy();
    })

    test("returns extensionui element when given a functional component that depends on state", () => {
        const _state = {className: "myParagraph", text: "Hello world"};
        const node: ExtensionUINode = <MockParagraphComponent className={mockStateObject("className", _state.className)} text={mockStateObject("text", _state.text)}/>;
        expect(node.stateProps).toStrictEqual(["className", "text"]);
        expect(node.element.className).toBe("myParagraph");
        expect(node.element.textContent).toBe("Hello world");
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

describe("addChildToParentElement", () => {
    test("properly adds child element and its stateProps to parent element and returns extensionuielement", () => {
        let childElement = ExtensionUI.createElement("h1", null);
        let element: ExtensionUINode = ExtensionUI['addChildToParentElement'](childElement, document.createElement("div"), []);
        expect(element.element.tagName).toBe("DIV");
        expect(element.element.firstElementChild.tagName).toBe("H1");
        expect(element.stateProps).toStrictEqual([]);
    })

    test("properly adds child string to parent element and returns extensionui element", () => {
        let child = "Heading 1";
        let element: ExtensionUINode = ExtensionUI['addChildToParentElement'](child, document.createElement("h1"), []);
        expect(element.element.tagName).toBe("H1");
        expect(element.element.textContent).toBe("Heading 1");
        expect(element.stateProps).toStrictEqual([]);
    })
})