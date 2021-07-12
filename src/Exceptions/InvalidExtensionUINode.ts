export default class InvalidExtensionUINode extends Error {
    constructor(){
        super();
        this.message = "The provided node does not conform to the ExtensionUINode object."
    }
}