import Children from "./Children";
import StateProp from "./StateProp";


export default class ExtensionUINode {
    public element: Element;
    public children: ExtensionUINode[];
    public stateProps: StateProp[];

    constructor(element: Element, children?: Children, stateProps?: StateProp[]) {
        this.element = element;
        this.children = children?.children || [];
        this.stateProps = stateProps || [];
    }
}