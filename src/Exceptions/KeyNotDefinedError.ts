export default class KeyNotDefinedError extends Error {
    private key: string;

    constructor(key: string) {
        super();
        this.message = `${key} is not defined in state.`;
    }
}