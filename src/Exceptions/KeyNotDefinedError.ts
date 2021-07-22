export default class KeyNotDefinedError extends Error {
    constructor(key: string) {
        super();
        this.message = `${key} is not defined in state.`;
    }
}