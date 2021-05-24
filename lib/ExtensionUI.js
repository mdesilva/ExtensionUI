"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class ExtensionUI {
  constructor() {}

  static createElement(type, attributes) {
    var element = document.createElement(type);

    if (attributes) {
      var attributeKeys = Object.keys(attributes);

      for (var i = 0; i < attributeKeys.length; i++) {
        var key = attributeKeys[i];
        element.setAttribute(key, attributes[key]);
      }
    }

    for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      children[_key - 2] = arguments[_key];
    }

    children.map((child, idx) => {
      if (typeof child == "string" && child != " ") {
        element.innerText = child;
      } else {
        element.appendChild(child);
      }
    });
    return element;
  }

}

exports.default = ExtensionUI;