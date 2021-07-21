import { StateObjectKey } from "../dist/Component";

export default class StateObject {
    public key: StateObjectKey;
    public value: any;

    constructor(key: StateObjectKey, value: any) {
        this.key = key;
        this.value = value;
    }
}