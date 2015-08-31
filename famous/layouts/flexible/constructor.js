'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Node = FamousFramework.FamousEngine.core.Node;
var Position = FamousFramework.FamousEngine.components.Position;
var Size = FamousFramework.FamousEngine.components.Size;

var FlexibleLayout = (function (_Node) {
    _inherits(FlexibleLayout, _Node);

    function FlexibleLayout() {
        var _this = this;

        _classCallCheck(this, FlexibleLayout);

        _get(Object.getPrototypeOf(FlexibleLayout.prototype), 'constructor', this).call(this);

        this._sizeSet = false;
        this._direction = FlexibleLayout.Direction.X;
        this._proportions = [];
        this._ratios = [];
        this._transition = null;

        this.addComponent({
            onSizeChange: function () {
                _this._sizeSet = true;
                _this.updateLayout();
            }
        });
    }

    _createClass(FlexibleLayout, [{
        key: '_getDirectionIndex',
        value: function _getDirectionIndex() {
            if (this._direction === FlexibleLayout.Direction.X) {
                return 0;
            } else if (this._direction === FlexibleLayout.Direction.Y) {
                return 1;
            } else if (this._direction === FlexibleLayout.Direction.Z) {
                return 2;
            }
            throw new Error('Unknown direction - ' + this._direction);
        }
    }, {
        key: '_createArrayWithValueAtDirectionIndex',
        value: function _createArrayWithValueAtDirectionIndex(array, value) {
            var result = Array.prototype.slice.call(array, 0);
            var directionIndex = this._getDirectionIndex();
            result[directionIndex] = value;
            return result;
        }
    }, {
        key: '_createSizeArrayWithTrueSizesPopulated',
        value: function _createSizeArrayWithTrueSizesPopulated(nodes, directionIndex) {
            return this._proportions.map(function (proportion, idx) {
                if (idx < nodes.length && proportion === true) {
                    var contentNode = nodes[idx].getChildren()[0];
                    return contentNode.getAbsoluteSize()[directionIndex];
                }
                return null;
            });
        }
    }, {
        key: '_calculateSumOfTrueSizes',
        value: function _calculateSumOfTrueSizes(sizes) {
            return sizes.filter(function (size) {
                return typeof size === 'number';
            }).reduce(function (sum, size) {
                return sum + size;
            }, 0);
        }
    }, {
        key: '_fillUnknownSizes',
        value: function _fillUnknownSizes(sizes, parentSize, sumTrueSizes) {
            var _this2 = this;

            sizes.forEach(function (size, idx) {
                if (typeof size === 'number') {
                    return;
                }
                var proportion = _this2._proportions[idx];
                if (typeof proportion === 'number') {
                    sizes[idx] = proportion * (parentSize - sumTrueSizes);
                } else {
                    sizes[idx] = 0;
                }
            });
        }
    }, {
        key: '_getNodeSizes',
        value: function _getNodeSizes(nodes, parentSize) {
            var directionIndex = this._getDirectionIndex();
            var sizes = this._createSizeArrayWithTrueSizesPopulated(nodes, directionIndex);
            var sumTrueSizes = this._calculateSumOfTrueSizes(sizes);
            this._fillUnknownSizes(sizes, parentSize[directionIndex], sumTrueSizes);
            return sizes;
        }
    }, {
        key: '_getNodePosition',
        value: function _getNodePosition(node) {
            if (!node._layoutPosition) {
                node._nodePosition = new Position(node);
            }
            return node._nodePosition;
        }
    }, {
        key: '_getNodeSize',
        value: function _getNodeSize(node) {
            if (!node._layoutSize) {
                node._nodeSize = new Size(node);
            }
            return node._nodeSize;
        }
    }, {
        key: 'updateLayout',
        value: function updateLayout() {
            var _this3 = this;

            if (!this._sizeSet) {
                return;
            }

            var createArray = this._createArrayWithValueAtDirectionIndex.bind(this);
            var childNodes = this.getChildren()[0].getChildren();
            var parentSize = this.getSize();
            var sizes = this._getNodeSizes(childNodes, parentSize);
            var position = 0;

            childNodes.forEach(function (childNode, idx) {
                var size = sizes[idx];
                var transition = _this3._transition;

                var nodePosition = _this3._getNodePosition(childNode);
                nodePosition.halt();
                nodePosition.set.apply(nodePosition, createArray([0, 0, 0], position).concat(transition));

                var nodeSize = _this3._getNodeSize(childNode);
                nodeSize.halt();
                nodeSize.setMode.apply(nodeSize, [1, 1, 1]);
                nodeSize.setAbsolute.apply(nodeSize, createArray(parentSize, size).concat(transition));

                position += size;
            });
        }
    }, {
        key: 'direction',
        set: function (direction) {
            for (var key in FlexibleLayout.Direction) {
                if (FlexibleLayout.Direction[key] === direction) {
                    this._direction = direction;
                    this.updateLayout();
                    return;
                }
            }
            throw new Error('Invalid direction - ' + direction);
        }
    }, {
        key: 'ratios',
        set: function (ratios) {
            if (ratios === null) {
                return;
            }

            if (!(ratios instanceof Array)) {
                throw new Error('ratios must be an array - ' + ratios);
            }

            var sumRatios = ratios.reduce(function (sum, ratio) {
                return sum + (typeof ratio === 'number' ? ratio : 0);
            }, 0);

            this._ratios = ratios;
            this._proportions = ratios.map(function (ratio) {
                return typeof ratio === 'number' ? ratio / sumRatios : ratio;
            });

            this.updateLayout();
        }
    }, {
        key: 'transition',
        set: function (transition) {
            this._transition = transition;
        }
    }]);

    return FlexibleLayout;
})(Node);

FlexibleLayout.Direction = {
    X: Symbol('FlexibleLayout.Direction.X'),
    Y: Symbol('FlexibleLayout.Direction.Y'),
    Z: Symbol('FlexibleLayout.Direction.Z')
};

FamousFramework.registerCustomFamousNodeConstructors({ FlexibleLayout: FlexibleLayout });