import { EXTENSIONUI_ATTRIBUTE } from "./Enums";
import KeyNotDefinedError from "./Exceptions/KeyNotDefinedError";

export default class Component {
    protected state: object;

    constructor(state: object = {}) {
        this.state = state;
        this.render();
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
        this.removeElements();
        this.render();
    }

    protected addElement(element: Element, parentElement?: Element): void {
        if (parentElement) {
            parentElement.append(element);
        } else {
            document.body.append(element);
        }
    }

    /*
    Remove all ExtensionUI elements from DOM
    */
    private removeElements(): void {
        const elements = document.querySelectorAll(`[${EXTENSIONUI_ATTRIBUTE.KEY}="${EXTENSIONUI_ATTRIBUTE.VALUE}"]`);
        elements.forEach(element => element.remove());
    }

    protected render() {}

}