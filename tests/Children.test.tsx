import { Child } from "../src/Children";
import { PropType } from "../src/Enums";
import StateObject from "../src/StateObject";

describe("Children class", () => {
    test("returns ExtensionUINode with text element when given plain text", () => {
        let node = Child['createExtensionUINodeFromPlainText']("This is some text");
        expect(node.element.tagName).toBe("SPAN");
        expect(node.element.textContent).toBe("This is some text");
        expect(node.children.length).toBe(0);
        expect(node.stateProps.length).toBe(0);
    })
    
    test("returns ExtensionUINode with text element and stateProps when given a StateObject", () => {
        let node = Child['createExtensionUINodeFromStateObject'](new StateObject("firstName", "Manuja"));
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