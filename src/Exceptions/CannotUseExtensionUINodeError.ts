export default class CannotUseExtensionUINodeError extends Error {
    constructor() {
        super();
        this.message = "You cannot add plain ExtensionUINode objects to the DOM. ExtensionUINode objects must be wrapped in an anonymous function."
    }
}