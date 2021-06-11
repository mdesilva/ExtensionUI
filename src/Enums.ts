export enum EXTENSIONUI_ATTRIBUTE {
    KEY="extensionui",
    VALUE="0"
}

export enum PROP_TYPE {
    EVENT="EVENT",
    PROPERTY="PROPERTY",
    ATTRIBUTE="ATTRIBUTE"
}

/*
Maps props to their prop types.
*/
export const PropsMap =  {
    "onscroll": PROP_TYPE.EVENT,
    "onselect": PROP_TYPE.EVENT,
    "onshow": PROP_TYPE.EVENT,
    "onwheel": PROP_TYPE.EVENT,
    "oncopy": PROP_TYPE.EVENT,
    "oncut": PROP_TYPE.EVENT,
    "onpaste": PROP_TYPE.EVENT,
    "onblur": PROP_TYPE.EVENT,
    "onfocus": PROP_TYPE.EVENT,
    "onfullscreenchange": PROP_TYPE.EVENT,
    "onfullscreenerror": PROP_TYPE.EVENT,
    "onkeydown": PROP_TYPE.EVENT,
    "onkeyup": PROP_TYPE.EVENT,
    "onauxclick": PROP_TYPE.EVENT,
    "onclick": PROP_TYPE.EVENT,
    "oncontextmenu": PROP_TYPE.EVENT,
    "ondblclick": PROP_TYPE.EVENT,
    "onmousedown": PROP_TYPE.EVENT,
    "onmouseenter": PROP_TYPE.EVENT,
    "onmouseleave": PROP_TYPE.EVENT,
    "onmousemove": PROP_TYPE.EVENT,
    "onmouseout": PROP_TYPE.EVENT,
    "onmouseover": PROP_TYPE.EVENT,
    "srcObject": PROP_TYPE.PROPERTY
}

