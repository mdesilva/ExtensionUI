import { expect, test } from "@jest/globals";
import ExtensionUI from "../src/ExtensionUI";

test("createElement returns h1 element with 'theater-heading' class and 'red' style color", () => {
    const element = 
    ExtensionUI.createElement("h1", {
        class: "theater-heading",
        style: "color:red"
    });
    expect(element.className).toBe("theater-heading");
    expect(element.style.color).toBe("red");
})

test("createElement returns div element with one child, h1, which has some text", () => {
    const element = ExtensionUI.createElement(
        "div", 
        null, 
        ExtensionUI.createElement("h1", null, "Heading 1")
    );
    expect(element.hasChildNodes()).toBeTruthy();
    expect(element.firstChild.tagName).toBe("H1");
    expect(element.firstChild.innerText).toBe("Heading 1");
})

test("createElement returns div parent with two children, h1 and p, each which has text", () => {
    const element = ExtensionUI.createElement(
        "div",
        null,
        ExtensionUI.createElement("h1", null, "Heading 1"),
        ExtensionUI.createElement("p", null, "This is some text")
    );
    expect(element.hasChildNodes()).toBeTruthy();
    expect(element.childElementCount).toEqual(2);
    expect(element.firstChild.tagName).toBe("H1");
    expect(element.firstChild.innerText).toBe("Heading 1");
    expect(element.lastChild.tagName).toBe("P");
    expect(element.lastChild.innerText).toBe("This is some text");
})

test("createElement returns div parent with various attributes and h1 and p children with attributes", () => {
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
    expect(element.style.color).toBe("red");
    expect(element.firstChild.className).toBe("theater-heading");
    expect(element.lastChild.className).toBe("theater-text");
})

test("successfully adds div parent with h1 child to dom", () => {
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
    expect(document.body.firstChild.className).toBe("theater-wrapper");
    expect(document.body.firstChild.firstChild.innerText).toBe(headingText);
})