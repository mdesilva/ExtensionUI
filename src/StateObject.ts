import { StateObjectKey } from "./Component";

export default class StateObject {
    public key: StateObjectKey;
    public value: any;

    constructor(key: StateObjectKey, value: any) {
        this.key = key;
        this.value = value;
    }
}