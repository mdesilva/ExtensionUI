import { expect, test } from "@jest/globals";
import { EXTENSIONUI_ATTRIBUTE } from "../src/Enums";
import ExtensionUI from "../src/ExtensionUI";


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


describe("createElement", () => {
    test("returns h1 element with 'theater-heading' class and 'red' style color", () => {
        const element: Element = 
        ExtensionUI.createElement("h1", {
            class: "theater-heading",
            style: "color: red;"
        });
        expect(element.className).toBe("theater-heading");
        expect(element.getAttribute("style")).toBe("color: red;");
    })
    
    test("returns div element with one child, h1, which has some text", () => {
        const element = ExtensionUI.createElement(
            "div", 
            null, 
            ExtensionUI.createElement("h1", null, "Heading 1")
        );
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
        );
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
        )
        expect(element.hasChildNodes()).toBeTruthy();
        expect(element.className).toBe("theater-wrapper");
        expect(element.getAttribute("style")).toBe("color: red;");
        expect(element.firstElementChild.className).toBe("theater-heading");
        expect(element.lastElementChild.className).toBe("theater-text");
    })
    
    test("returns div with heading child that can be properly added to the DOM", () => {
        const headingText = "Dynamically generated heading";
        const element = ExtensionUI.createElement(
            "div",
            {
                class: "theater-wrapper"
            },
            ExtensionUI.createElement("h1", null, headingText)
        );
        document.body.appendChild(element);
        expect(document.body.hasChildNodes()).toBeTruthy();
        expect(document.body.firstElementChild.className).toBe("theater-wrapper");
        expect(document.body.firstChild.firstChild.textContent).toBe(headingText);
    })
    
    test("generates paragraph element via direct JSX", () => {
        const text = "This is some text";
        const element = <p class="theater-toggle">{text}</p>
        expect(element.tagName).toBe("P");
        expect(element.className).toBe("theater-toggle");
        expect(element.textContent).toBe(text);
    })
    
    
    test("generates paragraph element via a functional component", () => {
        const myClass = "custom-paragraph";
        const myText = "My text"
        const element = <MockParagraphComponent className={myClass} text={myText}/>
        expect(element.tagName).toBe("P");
        expect(element.className).toBe(myClass);
        expect(element.textContent).toBe(myText);
    })
    
    test("generates paragraph element with two children, text and strong text child, via a functional component", () => {
        const MockBylineComponent = ({className, contribution, author}) => {
            return(<p class={className}>{contribution} - <strong>{author}</strong></p>)
        }
        const myClass = "byline";
        const contribution = "Technical Work";
        const author = "Manuja DeSilva"
        const element = <MockBylineComponent className={myClass} contribution={contribution} author={author}/>
        expect(element.tagName).toBe("P");
        expect(element.className).toBe(myClass);
        expect(element.hasChildNodes()).toBeTruthy();
        expect(element.firstChild.textContent).toBe(contribution);
        expect(element.lastChild.tagName).toBe("STRONG");
        expect(element.lastChild.textContent).toBe(author);
        expect(element.textContent).toBe("Technical Work - Manuja DeSilva")
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
        const element = <MockModalComponent text={myText}/>
        expect(element.tagName).toBe("DIV");
        expect(element.className).toBe("modal");
        expect(element.hasChildNodes()).toBeTruthy();
        expect(element.firstChild.className).toBe("modal-text")
        expect(element.firstChild.textContent).toBe(myText);
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
        const element = <MockModalComponent/>
        expect(element.className).toBe("modal");
        expect(element.childElementCount).toBe(2);
        assertControlAttributes(element.firstChild, "Muted", "false");
        assertControlAttributes(element.lastChild, "Camera Enabled", "true");
    })

    test("generates an element with an implicitly declared child via a functional component", () => {
        const element = 
        <MockModalComponentWithChildren>
            <input type="text" name="firstName" value="Manuja"/>
        </MockModalComponentWithChildren>
        expect(element.tagName).toBe("DIV");
        expect(element.className).toBe("modal");
        expect(element.hasChildNodes()).toBeTruthy();
        const child = element.firstElementChild;
        expect(child.tagName).toBe("INPUT");
        expect(child.getAttribute("type")).toBe("text");
        expect(child.getAttribute("name")).toBe("firstName");
        expect(child.getAttribute("value")).toBe("Manuja");
    })

    test("generates an element with implicitly declared children via a functional component", () => {
        const element: Element = 
        <MockModalComponentWithChildren>
            <input type="text" name="email" value="myemail"/>
            <input type="password" name="password" value="mypassword"/>
        </MockModalComponentWithChildren>
        expect(element.tagName).toBe("DIV");
        expect(element.className).toBe("modal");
        expect(element.childElementCount).toBe(2);
        const firstChild = element.firstElementChild;
        expect(firstChild.getAttribute("type")).toBe("text");
        expect(firstChild.getAttribute("name")).toBe("email");
        expect(firstChild.getAttribute("value")).toBe("myemail");
        const lastChild = element.lastElementChild;
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
        const element: Element = 
        <MockModalComponent color={myColorProp}>
            <p class="custom-text">{myText}</p>
        </MockModalComponent>
        expect(element.tagName).toBe("DIV");
        expect(element.className).toBe("modal");
        expect(element.childElementCount).toBe(3);
        const firstChild = element.firstElementChild;
        expect(firstChild.tagName).toBe("DIV");
        expect(firstChild.getAttribute("color")).toBe(myColorProp);
        expect(firstChild.className).toBe("header");
        const middleChild: Element = element.children[1];
        expect(middleChild.tagName).toBe("P");
        expect(middleChild.className).toBe("custom-text");
        expect(middleChild.textContent).toBe(myText);
        const lastChild = element.lastElementChild;
        expect(lastChild.tagName).toBe("DIV");
        expect(lastChild.getAttribute("color")).toBe(myColorProp)
        expect(lastChild.className).toBe("footer");
    })

    test("does not add child element to functional component that doesn't accept children", () => {
        const myText = "Should not have a child";
        const element: Element = 
        <MockParagraphComponent className="myParagraph" text={myText}>
            <div id="child"> Text that shouldn't be here</div>
        </MockParagraphComponent>
        expect(element.textContent).toBe(myText);
        expect(element.childElementCount).toBe(0);
        expect(element.firstElementChild).toBeNull();
        expect(element.childNodes.length).toBe(1);
        expect(element.childNodes[0].textContent).toBe(myText);
    })

    test("creates element with special extensionui attribute", () => {
        const element: Element = <div></div>;
        expect(element.getAttribute(EXTENSIONUI_ATTRIBUTE.KEY)).toBeTruthy();
        expect(element.getAttribute(EXTENSIONUI_ATTRIBUTE.KEY)).toBe(EXTENSIONUI_ATTRIBUTE.VALUE);
    })
    
})

