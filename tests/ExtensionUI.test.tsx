import { expect, test } from "@jest/globals";
import ExtensionUI from "../src/ExtensionUI";

const MockParagraphComponent = ({className, text}) => {
    return(<p class={className}>{text}</p>)
}

const MockBylineComponent = ({className, contribution, author}) => {
    return(<p class={className}>{contribution} - <strong>{author}</strong></p>)
}

const MockModalComponentOne = ({text}) => {
    return(
        <div class="modal">
            <MockParagraphComponent className="modal-text" text={text}/>
        </div>
    )
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
const MockModalComponentTwo = () => {
    return(
        <div class="modal">
            <MockControlComponent label="Muted" selected={false}/>
            <MockControlComponent label="Camera Enabled" selected={true}/>
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
    
    test("generates a div with a functional component as a child", () => {
        const myText = "This is a modal";
        const element = <MockModalComponentOne text={myText}/>
        expect(element.tagName).toBe("DIV");
        expect(element.className).toBe("modal");
        expect(element.hasChildNodes()).toBeTruthy();
        expect(element.firstChild.className).toBe("modal-text")
        expect(element.firstChild.textContent).toBe(myText);
    })
    
    test("generates a div with two functional component children, each with their own label and functional component children", () => {
        const assertControlAttributes = (control, label, selected) => {
            expect(control.className).toBe("control");
            expect(control.firstChild.tagName).toBe("LABEL");
            expect(control.firstChild.textContent).toBe(label);
            expect(control.lastChild.tagName).toBe("INPUT");
            expect(control.lastChild.type).toBe("checkbox");
            expect(control.lastChild.value).toBe(selected);
        }
        const element = <MockModalComponentTwo/>
        expect(element.className).toBe("modal");
        expect(element.childElementCount).toBe(2);
        assertControlAttributes(element.firstChild, "Muted", "false");
        assertControlAttributes(element.lastChild, "Camera Enabled", "true");
    })
    
    
})

