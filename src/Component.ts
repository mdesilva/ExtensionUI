import KeyNotDefinedError from "./Exceptions/KeyNotDefinedError";

export default class Component {
    protected state: object;

    constructor(state: object = {}) {
        this.state = state;
    }

    protected setState(newState: object): void {
        const newStateKeys = Object.keys(newState);
        for(let i=0; i<newStateKeys.length; i++) {
            const key = newStateKeys[i];
            if (!(key in this.state)) {
                throw new KeyNotDefinedError(key);
            }
        }
        newStateKeys.map((key, idx) => {
            this.state[key] = newState[key]
        })
    }


}