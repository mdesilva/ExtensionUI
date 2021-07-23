export const EXTENSIONUI_ATTRIBUTE_KEY = "extensionui";

export enum PropType {
    EVENT="EVENT",
    PROPERTY="PROPERTY",
    ATTRIBUTE="ATTRIBUTE",
    TEXT="TEXT"
}

/*
Maps prop keys to their prop types.
*/
export const PropsMap =  {
    "onscroll": PropType.EVENT,
    "onselect": PropType.EVENT,
    "onshow": PropType.EVENT,
    "onwheel": PropType.EVENT,
    "oncopy": PropType.EVENT,
    "oncut": PropType.EVENT,
    "onpaste": PropType.EVENT,
    "onblur": PropType.EVENT,
    "onfocus": PropType.EVENT,
    "onfullscreenchange": PropType.EVENT,
    "onfullscreenerror": PropType.EVENT,
    "onkeydown": PropType.EVENT,
    "onkeyup": PropType.EVENT,
    "onauxclick": PropType.EVENT,
    "onclick": PropType.EVENT,
    "oncontextmenu": PropType.EVENT,
    "ondblclick": PropType.EVENT,
    "onmousedown": PropType.EVENT,
    "onmouseenter": PropType.EVENT,
    "onmouseleave": PropType.EVENT,
    "onmousemove": PropType.EVENT,
    "onmouseout": PropType.EVENT,
    "onmouseover": PropType.EVENT,
    "onsubmit": PropType.EVENT,
    "oninput": PropType.EVENT,
    "srcObject": PropType.PROPERTY
}

