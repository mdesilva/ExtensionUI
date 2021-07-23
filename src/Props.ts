import { PropsMap, PropType } from "./Enums";
import StateProp from "./StateProp";

export interface PropsObject {
    [key: string]: any
}
type PropKey = keyof typeof PropsMap | string;

export default class Props {
    public stateProps: StateProp[] = [];
    public pureProps: Prop[] = [];

    constructor(props: PropsObject) {
        if (props) {
            Object.keys(props).map(propKey => {
                const propType = Prop.getPropType(propKey);
                const propValue = props[propKey];
                if (propValue.constructor.name != "StateObject") {
                    this.pureProps.push(new Prop(propType, propKey, propValue));
                } else {
                    this.stateProps.push(new StateProp(propType, propKey, propValue.key));
                    this.pureProps.push(new Prop(propType, propKey, propValue.value));
                }
            })
        }
    }

}

export class Prop {
    public type: PropType;
    public key: PropKey;
    public value: any;

    constructor(type: PropType, key: PropKey, value: any){
        this.type = type;
        this.key = key;
        this.value = value;
    }

    public static getPropType(propKey: PropKey): PropType {
        return propKey in PropsMap ? PropsMap[propKey] : PropType.ATTRIBUTE;
    }
}