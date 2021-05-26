import Component from "../src/Component"
import KeyNotDefinedError from "../src/Exceptions/KeyNotDefinedError";

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
})
