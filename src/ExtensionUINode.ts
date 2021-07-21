import StateProp from "./StateProp";


export default class ExtensionUINode {
    public element: Element;
    public children: ExtensionUINode[];
    public stateProps: StateProp[];

    constructor(element: Element, children?: ExtensionUINode[], stateProps?: StateProp[]) {
        this.element = element;
        this.children = children || [];
        this.stateProps = stateProps || [];
    }
}