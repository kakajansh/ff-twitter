'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Node = FamousFramework.FamousEngine.core.Node;
var Align = FamousFramework.FamousEngine.components.Align;

var Swapper = (function (_Node) {
    _inherits(Swapper, _Node);

    function Swapper() {
        _classCallCheck(this, Swapper);

        _get(Object.getPrototypeOf(Swapper.prototype), 'constructor', this).call(this);

        this.currentSection = null;
        this.sections = [];

        this.addComponent({
            // onSizeChange: () => {
            //     this.sections = this.getChildren()[0].getChildren();
            //     setTimeout(function() {
            //         this.changeSection('Home');
            //     }.bind(this), 10);
            // }
        });
    }

    _createClass(Swapper, [{
        key: '_getNodeAlign',
        value: function _getNodeAlign(node) {
            if (!node._layoutAlign) {
                node._nodeAlign = new Align(node);
            }
            return node._nodeAlign;
        }
    }, {
        key: 'changeSection',
        value: function changeSection(to, transition) {
            var _this = this;

            if (!transition) transition = { duration: 500, curve: 'easeOutBounce' };

            this.sections.forEach(function (childNode) {
                childNode.id = childNode.getComponents()[3].getValue().id;
                childNode.align = _this._getNodeAlign(childNode);

                if (to === childNode.id) {
                    // childNode.show();
                    // childNode.getComponents()[3].setProperty('background-color', 'red')
                    childNode.align.set(0, 0, 0, transition);
                } else {
                    // childNode.hide();
                    // childNode.getComponents()[3].setProperty('background-color', 'green')
                    childNode.align.set(1, 0, 0, transition);
                }
            });
        }
    }]);

    return Swapper;
})(Node);

FamousFramework.registerCustomFamousNodeConstructors({ Swapper: Swapper });