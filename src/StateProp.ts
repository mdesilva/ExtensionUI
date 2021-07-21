import { StateObjectKey } from "../dist/Component";
import { PropType } from "./Enums";

export default class StateProp {
    public type: PropType;
    public key: string;
    public stateKey: StateObjectKey;

    constructor(type: PropType, key: string, stateKey: StateObjectKey) {
        this.type = type;
        this.key = key;
        this.stateKey = stateKey;
    }
}