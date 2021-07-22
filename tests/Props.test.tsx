import StateObject from "../src/StateObject";
import Props from "../src/Props";
import { PropType } from "../src/Enums";

describe("Props class", () => {
    test("returns pureProps when given pure props", () => {
        let myProps = new Props({dataName: "manuja"});
        expect(myProps.pureProps.length).toBe(1);
        const prop = myProps.pureProps[0];
        expect(prop.type).toBe(PropType.ATTRIBUTE);
        expect(prop.key).toBe("dataName");
        expect(prop.value).toBe("manuja");
        expect(myProps.stateProps.length).toBe(0);
    })

    test("returns stateProps and pureProps when given props with state objects", () => {
        let myStateObject = new StateObject("myStyle", "color: red;")
        let myProps = new Props({style: myStateObject});
        expect(myProps.stateProps.length).toBe(1);
        const stateProp = myProps.stateProps[0];
        expect(stateProp.type).toBe(PropType.ATTRIBUTE);
        expect(stateProp.key).toBe("style");
        expect(stateProp.stateKey).toBe("myStyle");
        expect(myProps.pureProps.length).toBe(1);
        const prop = myProps.pureProps[0];
        expect(prop.type).toBe(PropType.ATTRIBUTE);
        expect(prop.key).toBe("style");
        expect(prop.value).toBe("color: red;");
    })

})