// Copyright 2015 (c) Famous Industries, Inc.
"use strict";
FamousFramework.includes("sayawan:twitter", "HEAD", ["sayawan/twitter/assets/ionic.min.css","famous/layouts/flexible/constructor.js"], function() {
    (function(){
        'use strict';
        function addGesture($famousNode, $GestureHandler, $payload, eventName) {
            new $GestureHandler($famousNode, [{
                    event: eventName,
                    callback: function (event) {
                        $payload.listener(event);
                    }
                }]);
        }
        var lastNaturalDOMEvent = {
            timeStamp: null,
            eventName: null
        };
        var naturalDOMListenersFor = {};
        var EVENTS_WHICH_REALLY_NEED_DOM_INFO = {
            'input': true,
            'change': true,
            'click': true,
            'focus': true,
            'blur': true,
            'select': true,
            'keydown': true,
            'keyup': true
        };
        FamousFramework.module('famous:events', 'HEAD', {
            'dependencies': {},
            'famousNodeConstructorName': '',
            'extensions': [],
            'expose': {
                'type': 'ObjectExpression',
                'properties': []
            }
        }, {
            events: {
                '$public': {
                    'size-change': function ($famousNode, $payload) {
                        $famousNode.addComponent({
                            onSizeChange: function (sizeX, sizeY, sizeZ) {
                                $payload.listener({
                                    eventName: 'onSizeChange',
                                    value: [
                                        sizeX,
                                        sizeY,
                                        sizeZ
                                    ]
                                });
                            }
                        });
                    },
                    'parent-size-change': function ($famousNode, $payload) {
                        var parentFamousNode = $famousNode.getParent();
                        if (parentFamousNode) {
                            parentFamousNode.addComponent({
                                onSizeChange: function (sizeX, sizeY, sizeZ) {
                                    $payload.listener({
                                        eventName: 'onParentSizeChange',
                                        value: [
                                            sizeX,
                                            sizeY,
                                            sizeZ
                                        ]
                                    });
                                }
                            });
                        }
                    },
                    'drag': function ($famousNode, $GestureHandler, $payload) {
                        addGesture($famousNode, $GestureHandler, $payload, 'drag');
                    },
                    'tap': function ($famousNode, $GestureHandler, $payload) {
                        addGesture($famousNode, $GestureHandler, $payload, 'tap');
                    },
                    'rotate': function ($famousNode, $GestureHandler, $payload) {
                        addGesture($famousNode, $GestureHandler, $payload, 'rotate');
                    },
                    'pinch': function ($famousNode, $GestureHandler, $payload) {
                        addGesture($famousNode, $GestureHandler, $payload, 'pinch');
                    },
                    '$miss': function ($DOMElement, $famousNode, $payload) {
                        var eventName = $payload.eventName;
                        var listener = $payload.listener;
                        if (eventName in EVENTS_WHICH_REALLY_NEED_DOM_INFO) {
                            if (!naturalDOMListenersFor[eventName]) {
                                naturalDOMListenersFor[eventName] = true;
                                document.addEventListener(eventName, function (event) {
                                    lastNaturalDOMEvent.timeStamp = event.timeStamp;
                                    lastNaturalDOMEvent.eventName = eventName;
                                    lastNaturalDOMEvent.eventObject = event;
                                });
                            }
                        }
                        $famousNode.addUIEvent(eventName);
                        $DOMElement.on(eventName, function (event) {
                            if (naturalDOMListenersFor[eventName]) {
                                if (lastNaturalDOMEvent.eventName === eventName && lastNaturalDOMEvent.timeStamp === event.timeStamp) {
                                    var naturalEvent = lastNaturalDOMEvent.eventObject;
                                    var target = naturalEvent.target || naturalEvent.srcElement;
                                    if (target) {
                                        var nodeLocation = $famousNode.getLocation();
                                        var currentElement = target;
                                        while (currentElement) {
                                            if (currentElement.getAttribute('data-fa-path') === nodeLocation) {
                                                event.target = naturalEvent.target;
                                                event.relatedTarget = naturalEvent.relatedTarget;
                                                break;
                                            }
                                            currentElement = currentElement.parentNode;
                                        }
                                    }
                                }
                            }
                            listener(event);
                        });
                    }
                }
            }
        }).config({
            imports: { 'famous:events': [] },
            'extends': []
        });
    }());
    (function(){
        'use strict';
        FamousFramework.module('famous:core:node', 'HEAD', {
            'dependencies': {},
            'famousNodeConstructorName': '',
            'extensions': [],
            'expose': {
                'type': 'ObjectExpression',
                'properties': []
            }
        }, {
            behaviors: { '$self': { '$yield': true } },
            events: {
                '$public': {
                    'add-class': function ($DOMElement, $payload) {
                        $DOMElement.addClass($payload);
                    },
                    'align': function ($famousNode, $payload) {
                        $famousNode.setAlign($payload[0], $payload[1], $payload[2]);
                    },
                    'align-x': function ($famousNode, $payload) {
                        $famousNode.setAlign($payload, null, null);
                    },
                    'align-y': function ($famousNode, $payload) {
                        $famousNode.setAlign(null, $payload, null);
                    },
                    'align-z': function ($famousNode, $payload) {
                        $famousNode.setAlign(null, null, $payload);
                    },
                    'attach': function ($payload, $famousNode) {
                        $payload($famousNode);
                    },
                    'attributes': function ($DOMElement, $payload) {
                        for (var attributeName in $payload) {
                            $DOMElement.setAttribute(attributeName, $payload[attributeName]);
                        }
                    },
                    'backface-visible': function ($state, $payload, $dispatcher) {
                        var style = $state.get('style') || {};
                        style['-webkit-backface-visibility'] = $payload ? 'visible' : 'hidden';
                        style['backface-visibility'] = $payload ? 'visible' : 'hidden';
                        $dispatcher.trigger('style', style);
                    },
                    'base-color': function ($mesh, $payload, $state) {
                        if (Object.prototype.toString.call($payload) === '[object Object]') {
                            var Material = FamousFramework.FamousEngine.webglMaterials.Material;
                            Material.registerExpression($payload.name, {
                                glsl: $payload.glsl,
                                output: $payload.output
                            });
                            $mesh.setBaseColor(new Material[$payload.name]());
                        } else {
                            $mesh.setBaseColor(new FamousFramework.FamousEngine.utilities.Color($payload));
                        }
                        if (!$state.get('hasGeometry')) {
                            $mesh.setGeometry(new FamousFramework.FamousEngine.webglGeometries.Plane());
                            $state.set('hasGeometry', true);
                        }
                    },
                    'box-shadow': function ($state, $payload, $dispatcher) {
                        var style = $state.get('style') || {};
                        style['-webkit-box-shadow'] = $payload;
                        style['-moz-box-shadow'] = $payload;
                        style['box-shadow'] = $payload;
                        $dispatcher.trigger('style', style);
                    },
                    'camera': function ($camera, $payload) {
                        $camera.set($payload[0], $payload[1]);
                    },
                    'content': function ($DOMElement, $payload) {
                        $DOMElement.setContent($payload);
                    },
                    'flat-shading': function ($mesh, $payload) {
                        $mesh.setFlatShading($payload);
                    },
                    'geometry': function ($mesh, $payload, $state) {
                        var webglGeometries = FamousFramework.FamousEngine.webglGeometries;
                        var geometry;
                        if ($payload.dynamic) {
                            var geometry = new webglGeometries.DynamicGeometry().fromGeometry(new webglGeometries[$payload.shape]($payload.options));
                        } else {
                            var geometry = new webglGeometries[$payload.shape]($payload.options);
                        }
                        $mesh.setGeometry(geometry);
                        $state.set('hasGeometry', true);
                    },
                    'glossiness': function ($mesh, $payload) {
                        $mesh.setGlossiness($payload.glossiness, $payload.strength);
                    },
                    'id': function ($DOMElement, $payload) {
                        $DOMElement.setId($payload);
                    },
                    'light': function ($famousNode, $payload) {
                        var webglRenderables = FamousFramework.FamousEngine.webglRenderables;
                        var Color = FamousFramework.FamousEngine.utilities.Color;
                        if ($payload.type === 'point') {
                            new webglRenderables.PointLight($famousNode).setColor(new Color($payload.color));
                        } else {
                            new webglRenderables.AmbientLight($famousNode).setColor(new Color($payload.color));
                        }
                    },
                    'mount-point': function ($famousNode, $payload) {
                        $famousNode.setMountPoint($payload[0], $payload[1], $payload[2]);
                    },
                    'mount-point-x': function ($famousNode, $payload) {
                        $famousNode.setMountPoint($payload, null, null);
                    },
                    'mount-point-y': function ($famousNode, $payload) {
                        $famousNode.setMountPoint(null, $payload, null);
                    },
                    'mount-point-z': function ($famousNode, $payload) {
                        $famousNode.setMountPoint(null, null, $payload);
                    },
                    'normals': function ($mesh, $payload) {
                        $mesh.setNormals($payload);
                    },
                    'offset-position': function ($famousNode, $payload) {
                        var currentPos = $famousNode.getPosition();
                        $famousNode.setPosition(currentPos[0] + $payload[0] || 0, currentPos[1] + $payload[1] || 0, currentPos[2] + $payload[2] || 0);
                    },
                    'opacity': function ($famousNode, $payload) {
                        $famousNode.setOpacity($payload);
                    },
                    'origin': function ($famousNode, $payload) {
                        $famousNode.setOrigin($payload[0], $payload[1], $payload[2]);
                    },
                    'origin-x': function ($famousNode, $payload) {
                        $famousNode.setOrigin($payload, null, null);
                    },
                    'origin-y': function ($famousNode, $payload) {
                        $famousNode.setOrigin(null, $payload, null);
                    },
                    'origin-z': function ($famousNode, $payload) {
                        $famousNode.setOrigin(null, null, $payload);
                    },
                    'position': function ($famousNode, $payload) {
                        $famousNode.setPosition($payload[0], $payload[1], $payload[2]);
                    },
                    'position-offset': function ($mesh, $payload, $state) {
                        var Material = FamousFramework.FamousEngine.webglMaterials.Material;
                        Material.registerExpression($payload.name, {
                            glsl: $payload.glsl,
                            output: $payload.output
                        });
                        var vertexShader = Material[$payload.name](null, $payload.defaults);
                        $state.set($payload.name, vertexShader);
                        $mesh.setPositionOffset(vertexShader);
                    },
                    'position-x': function ($famousNode, $payload) {
                        $famousNode.setPosition($payload, null, null);
                    },
                    'position-y': function ($famousNode, $payload) {
                        $famousNode.setPosition(null, $payload, null);
                    },
                    'position-z': function ($famousNode, $payload) {
                        $famousNode.setPosition(null, null, $payload);
                    },
                    'remove-class': function ($DOMElement, $payload) {
                        $DOMElement.removeClass($payload);
                    },
                    'rotation': function ($famousNode, $payload) {
                        $famousNode.setRotation($payload[0], $payload[1], $payload[2], $payload[3]);
                    },
                    'rotation-x': function ($famousNode, $payload) {
                        $famousNode.setRotation($payload, null, null);
                    },
                    'rotation-y': function ($famousNode, $payload) {
                        $famousNode.setRotation(null, $payload, null);
                    },
                    'rotation-z': function ($famousNode, $payload) {
                        $famousNode.setRotation(null, null, $payload);
                    },
                    'scale': function ($famousNode, $payload) {
                        $famousNode.setScale($payload[0], $payload[1], $payload[2]);
                    },
                    'scale-x': function ($famousNode, $payload) {
                        $famousNode.setScale($payload, null, null);
                    },
                    'scale-y': function ($famousNode, $payload) {
                        $famousNode.setScale(null, $payload, null);
                    },
                    'scale-z': function ($famousNode, $payload) {
                        $famousNode.setScale(null, null, $payload);
                    },
                    'size': function ($payload, $dispatcher) {
                        var xSize = $payload[0];
                        var ySize = $payload[1];
                        var zSize = $payload[2];
                        if (xSize === true)
                            $dispatcher.trigger('size-true-x');
                        else if (xSize !== undefined)
                            $dispatcher.trigger('size-absolute-x', xSize);
                        if (ySize === true)
                            $dispatcher.trigger('size-true-y');
                        else if (ySize !== undefined)
                            $dispatcher.trigger('size-absolute-y', ySize);
                        if (zSize === true)
                            $dispatcher.trigger('size-true-z');
                        else if (zSize !== undefined)
                            $dispatcher.trigger('size-absolute-z', zSize);
                    },
                    'size-mode': function ($famousNode, $payload) {
                        $famousNode.setSizeMode($payload[0], $payload[1], $payload[2]);
                    },
                    'size-mode-x': function ($famousNode, $payload) {
                        $famousNode.setSizeMode($payload, null, null);
                    },
                    'size-mode-y': function ($famousNode, $payload) {
                        $famousNode.setSizeMode(null, $payload, null);
                    },
                    'size-mode-z': function ($famousNode, $payload) {
                        $famousNode.setSizeMode(null, null, $payload);
                    },
                    'size-true': function ($famousNode) {
                        $famousNode.setSizeMode(2, 2, 2);
                    },
                    'size-true-x': function ($famousNode) {
                        $famousNode.setSizeMode(2, null, null);
                    },
                    'size-true-y': function ($famousNode) {
                        $famousNode.setSizeMode(null, 2, null);
                    },
                    'size-true-z': function ($famousNode) {
                        $famousNode.setSizeMode(null, null, 2);
                    },
                    'size-absolute': function ($famousNode, $payload) {
                        $famousNode.setSizeMode($payload[0] === null ? null : 1, $payload[1] === null ? null : 1, $payload[2] === null ? null : 1);
                        $famousNode.setAbsoluteSize($payload[0], $payload[1], $payload[2]);
                    },
                    'size-absolute-x': function ($famousNode, $payload) {
                        $famousNode.setSizeMode($payload === null ? null : 1, null, null);
                        $famousNode.setAbsoluteSize($payload, null, null);
                    },
                    'size-absolute-y': function ($famousNode, $payload) {
                        $famousNode.setSizeMode(null, $payload === null ? null : 1, null);
                        $famousNode.setAbsoluteSize(null, $payload, null);
                    },
                    'size-absolute-z': function ($famousNode, $payload) {
                        $famousNode.setSizeMode(null, null, $payload === null ? null : 1);
                        $famousNode.setAbsoluteSize(null, null, $payload);
                    },
                    'size-differential': function ($famousNode, $payload) {
                        $famousNode.setSizeMode($payload[0] === null ? null : 0, $payload[1] === null ? null : 0, $payload[2] === null ? null : 0);
                        $famousNode.setDifferentialSize($payload[0], $payload[1], $payload[2]);
                    },
                    'size-differential-x': function ($famousNode, $payload) {
                        $famousNode.setSizeMode($payload === null ? null : 0, null, null);
                        $famousNode.setDifferentialSize($payload, null, null);
                    },
                    'size-differential-y': function ($famousNode, $payload) {
                        $famousNode.setSizeMode(null, $payload === null ? null : 0, null);
                        $famousNode.setDifferentialSize(null, $payload, null);
                    },
                    'size-differential-z': function ($famousNode, $payload) {
                        $famousNode.setSizeMode(null, null, $payload === null ? null : 0);
                        $famousNode.setDifferentialSize(null, null, $payload);
                    },
                    'size-proportional': function ($famousNode, $payload) {
                        $famousNode.setSizeMode($payload[0] === null ? null : 0, $payload[1] === null ? null : 0, $payload[2] === null ? null : 0);
                        $famousNode.setProportionalSize($payload[0], $payload[1], $payload[2]);
                    },
                    'size-proportional-x': function ($famousNode, $payload) {
                        $famousNode.setSizeMode($payload === null ? null : 0, null, null);
                        $famousNode.setProportionalSize($payload, null, null);
                    },
                    'size-proportional-y': function ($famousNode, $payload) {
                        $famousNode.setSizeMode(null, $payload === null ? null : 0, null);
                        $famousNode.setProportionalSize(null, $payload, null);
                    },
                    'size-proportional-z': function ($famousNode, $payload) {
                        $famousNode.setSizeMode(null, null, $payload === null ? null : 0);
                        $famousNode.setProportionalSize(null, null, $payload);
                    },
                    'style': function ($DOMElement, $payload) {
                        for (var styleName in $payload) {
                            $DOMElement.setProperty(styleName, $payload[styleName]);
                        }
                    },
                    'uniform': function ($state, $payload) {
                        $state.get($payload.vertexName).setUniform($payload.variableName, $payload.value);
                    },
                    'unselectable': function ($state, $payload, $dispatcher) {
                        if ($payload) {
                            var style = $state.get('style') || {};
                            style['-moz-user-select'] = '-moz-none';
                            style['-khtml-user-select'] = 'none';
                            style['-webkit-user-select'] = 'none';
                            style['-o-user-select'] = 'none';
                            style['user-select'] = 'none';
                            $dispatcher.trigger('style', style);
                        }
                    }
                }
            },
            states: {
                'didTemplate': false,
                'initialContent': '',
                'hasGeometry': false
            }
        }).config({
            'extends': [],
            imports: {}
        });
    }());
    (function(){
        'use strict';
        FamousFramework.module('famous:layouts:header-footer', 'HEAD', {
            'dependencies': { 'famous:core:node': 'HEAD' },
            'famousNodeConstructorName': '',
            'extensions': [{
                    'name': 'famous:core:node',
                    'version': 'HEAD'
                }],
            'expose': {
                'type': 'ObjectExpression',
                'properties': []
            }
        }, {
            tree: '<famous:core:node id="header"></famous:core:node>\n<famous:core:node id="body"></famous:core:node>\n<famous:core:node id="footer"></famous:core:node>\n\n',
            behaviors: {
                '#header': {
                    '$yield': '#header',
                    'size-absolute-y': function (headerHeight) {
                        return headerHeight;
                    }
                },
                '#body': {
                    '$yield': '#body',
                    'position': function (headerHeight) {
                        return [
                            0,
                            headerHeight
                        ];
                    },
                    'size-differential-y': function (headerHeight, footerHeight) {
                        return -headerHeight - footerHeight;
                    }
                },
                '#footer': {
                    '$yield': '#footer',
                    'size-absolute-y': function (footerHeight) {
                        return footerHeight;
                    },
                    'position-y': function (footerHeight) {
                        return -footerHeight;
                    },
                    align: [
                        0,
                        1
                    ]
                }
            },
            events: {
                '$public': {
                    'header-height': function ($state, $payload) {
                        $state.set('headerHeight', $payload);
                    },
                    'footer-height': function ($state, $payload) {
                        $state.set('footerHeight', $payload);
                    }
                }
            },
            states: {
                'headerHeight': 100,
                'footerHeight': 100
            }
        });
    }());
    (function(){
        'use strict';
        var Align = FamousFramework.FamousEngine.components.Align;
        FamousFramework.scene('sayawan:twitter:swapper', 'HEAD', {
            'dependencies': {
                'famous:events': 'HEAD',
                'famous:core:node': 'HEAD'
            },
            'famousNodeConstructorName': '',
            'extensions': [{
                    'name': 'famous:core:node',
                    'version': 'HEAD'
                }],
            'expose': {
                'type': 'ObjectExpression',
                'properties': []
            }
        }, {
            behaviors: {
                '#swapper': { 'style': {} },
                '#swapper-item': {
                    'align': [
                        1,
                        0,
                        0
                    ],
                    '$yield': '.view',
                    'style': {}
                }
            },
            events: {
                '$lifecycle': {
                    'post-load': function ($dispatcher, $state, $famousNode) {
                        setTimeout(function () {
                            $dispatcher.trigger('change-section', $state.get('currentSection'));
                        }, 0);
                    }
                },
                '$public': {
                    'currentSection': function ($state, $payload) {
                        $state.set('currentSection', $payload);
                    },
                    'transition': function ($state, $payload) {
                        $state.set('transition', $payload);
                    }
                },
                '#swapper': {
                    'famous:events:click': function ($dispatcher, $state) {
                        console.log('clicked');
                        $dispatcher.trigger('change-section', 'Connect');
                    },
                    'change-section': function ($famousNode, $state, $payload, $DOMElement) {
                        var transition = $state.get('transition') || {
                            duration: 500,
                            curve: 'easeOutBounce'
                        };
                        var nodes = $famousNode.getChildren()[0].getChildren();
                        nodes.forEach(function (node, i) {
                            node.id = node.getChildren()[0].getValue().components[0].id;
                            if (!node.align)
                                node.align = new Align(node);
                            if ($payload === node.id) {
                                node.align.set(0, 0, 0, transition);
                            } else {
                                node.align.set(1, 0, 0, transition);
                            }
                        });
                    }
                }
            },
            states: {
                transition: null,
                align: [
                    1,
                    0,
                    0
                ]
            },
            tree: '<famous:core:node id="swapper">\n            <famous:core:node id="swapper-item"></famous:core:node>\n        </famous:core:node>\n    '
        });
    }());
    (function(){
        'use strict';
        FamousFramework.scene('famous:layouts:scroll-view', 'HEAD', {
            'dependencies': { 'famous:core:node': 'HEAD' },
            'famousNodeConstructorName': '',
            'extensions': [{
                    'name': 'famous:core:node',
                    'version': 'HEAD'
                }],
            'expose': {
                'type': 'ObjectExpression',
                'properties': []
            }
        }, {
            behaviors: {
                '$self': {
                    position: function (scrollViewPosition) {
                        return scrollViewPosition;
                    },
                    size: function (scrollViewSize) {
                        return scrollViewSize;
                    },
                    style: function (border) {
                        var style = {};
                        style.overflow = 'scroll';
                        if (border)
                            style.border = border;
                        return style;
                    }
                },
                '.item': {
                    '$yield': '.scroll-view-item',
                    'size': function (itemHeight) {
                        return [
                            undefined,
                            itemHeight
                        ];
                    },
                    'position': function ($index, itemHeight) {
                        return [
                            0,
                            $index * itemHeight
                        ];
                    }
                }
            },
            events: {
                $public: {
                    'item-height': function ($state, $payload) {
                        $state.set('itemHeight', $payload);
                    },
                    'scroll-view-position': function ($state, $payload) {
                        $state.set('scrollViewPosition', $payload);
                    },
                    'scroll-view-size': function ($state, $payload) {
                        $state.set('scrollViewSize', $payload);
                    }
                }
            },
            states: {
                itemHeight: 100,
                scrollViewSize: [
                    400,
                    800
                ],
                scrollViewPosition: [
                    0,
                    0
                ],
                border: '3px solid #40b2e8'
            },
            tree: '<famous:core:node class="item"></famous:core:node>\n    '
        });
    }());
    (function(){
        'use strict';
        var data = {
            usernames: [
                '@LouieBlooRaspberry',
                '@PonchoPunch',
                '@SirIsaacLime',
                '@StrawberryShortKook',
                '@AlexandertheGrape',
                '@LittleOrphanOrange'
            ],
            begin: [
                'Walk towards ',
                'Jump on ',
                'Sing to ',
                'Dance with ',
                'Stare down ',
                'Pick up ',
                'Hold hands with ',
                'Walk around ',
                'Shake hands with ',
                'Talk to ',
                'Point at ',
                'Read to ',
                'High five ',
                'Wave to '
            ],
            middle: [
                'a duck ',
                'some fish ',
                'a zebra ',
                'nine honey badgers ',
                'an old gorilla ',
                'a ham sandwich ',
                'a peanut ',
                'Nicolas Cage ',
                'a sock ',
                'a pillow ',
                '12 fish ',
                'a potato ',
                'your neighbor ',
                'a snail '
            ],
            end: [
                'quickly',
                'and don\'t look back',
                'without shoes',
                'and clap your hands',
                'and pat your belly',
                'and do a jig',
                'tomorrow',
                'while eating ice cream',
                'in the dark',
                'at the park',
                'with a friend',
                'down by the bay',
                'in the car',
                'and yell'
            ],
            hashtags: [
                '#harrystyles',
                '#live',
                '#boredom',
                '#mylife',
                '#hiphop',
                '#texas',
                '#november',
                '#scary',
                '#best',
                ' #snowman',
                '#shuffle',
                '#squats',
                '#selfie'
            ]
        };
        function random(array) {
            return array[Math.random() * array.length | 0];
        }
        function getRandomMessage() {
            return '<b>' + random(data.usernames) + ':</b>' + random(data.begin) + random(data.middle) + random(data.end) + ' ' + random(data.hashtags) + ' ' + random(data.hashtags);
        }
        function getRandomColor() {
            return '#' + Array.apply(null, Array(6)).map(function (_, i) {
                return random('0123456789ABCDEF');
            }).join('');
        }
        FamousFramework.scene('sayawan:twitter:tweets', 'HEAD', {
            'dependencies': {
                'famous:events': 'HEAD',
                'famous:layouts:scroll-view': 'HEAD',
                'famous:core:node': 'HEAD'
            },
            'famousNodeConstructorName': '',
            'extensions': [{
                    'name': 'famous:core:node',
                    'version': 'HEAD'
                }],
            'expose': {
                'type': 'ObjectExpression',
                'properties': []
            }
        }, {
            behaviors: {
                'famous:layouts:scroll-view': {
                    'item-height': 100,
                    'scroll-view-size': function (scrollViewSize) {
                        return scrollViewSize;
                    },
                    'style': { 'border': '0px' }
                },
                '.scroll-view-item': {
                    style: function ($index) {
                        return {
                            'background-color': getRandomColor(),
                            'border': '1px solid #D5D5D5',
                            'color': '#46454E',
                            'font-family': 'Lato',
                            'font-size': '20px',
                            'padding': '10px'
                        };
                    },
                    '$repeat': function (count) {
                        var result = [];
                        for (var i = 0; i < count; i++) {
                            result.push({ content: getRandomMessage() });
                        }
                        return result;
                    }
                }
            },
            events: {
                '$self': {
                    'famous:events:parent-size-change': function ($event, $state) {
                        $state.set('scrollViewSize', $event.value);
                    }
                }
            },
            states: {
                scrollViewSize: [],
                count: 20
            },
            tree: '<famous:layouts:scroll-view>\n            <famous:core:node class="scroll-view-item"></famous:core:node>\n        </famous:layouts:scroll-view>\n    '
        }).config({ imports: { 'famous:layouts': ['scroll-view'] } });
    }());
    (function(){
        var _createClass = function () {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || false;
                    descriptor.configurable = true;
                    if ('value' in descriptor)
                        descriptor.writable = true;
                    Object.defineProperty(target, descriptor.key, descriptor);
                }
            }
            return function (Constructor, protoProps, staticProps) {
                if (protoProps)
                    defineProperties(Constructor.prototype, protoProps);
                if (staticProps)
                    defineProperties(Constructor, staticProps);
                return Constructor;
            };
        }();
        var _get = function get(_x, _x2, _x3) {
            var _again = true;
            _function:
                while (_again) {
                    var object = _x, property = _x2, receiver = _x3;
                    desc = parent = getter = undefined;
                    _again = false;
                    if (object === null)
                        object = Function.prototype;
                    var desc = Object.getOwnPropertyDescriptor(object, property);
                    if (desc === undefined) {
                        var parent = Object.getPrototypeOf(object);
                        if (parent === null) {
                            return undefined;
                        } else {
                            _x = parent;
                            _x2 = property;
                            _x3 = receiver;
                            _again = true;
                            continue _function;
                        }
                    } else if ('value' in desc) {
                        return desc.value;
                    } else {
                        var getter = desc.get;
                        if (getter === undefined) {
                            return undefined;
                        }
                        return getter.call(receiver);
                    }
                }
        };
        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError('Cannot call a class as a function');
            }
        }
        function _inherits(subClass, superClass) {
            if (typeof superClass !== 'function' && superClass !== null) {
                throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
            }
            subClass.prototype = Object.create(superClass && superClass.prototype, {
                constructor: {
                    value: subClass,
                    enumerable: false,
                    writable: true,
                    configurable: true
                }
            });
            if (superClass)
                Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
        }
        var Node = FamousFramework.FamousEngine.core.Node;
        var Position = FamousFramework.FamousEngine.components.Position;
        var Size = FamousFramework.FamousEngine.components.Size;
        var FlexibleLayout = function (_Node) {
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
            _createClass(FlexibleLayout, [
                {
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
                },
                {
                    key: '_createArrayWithValueAtDirectionIndex',
                    value: function _createArrayWithValueAtDirectionIndex(array, value) {
                        var result = Array.prototype.slice.call(array, 0);
                        var directionIndex = this._getDirectionIndex();
                        result[directionIndex] = value;
                        return result;
                    }
                },
                {
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
                },
                {
                    key: '_calculateSumOfTrueSizes',
                    value: function _calculateSumOfTrueSizes(sizes) {
                        return sizes.filter(function (size) {
                            return typeof size === 'number';
                        }).reduce(function (sum, size) {
                            return sum + size;
                        }, 0);
                    }
                },
                {
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
                },
                {
                    key: '_getNodeSizes',
                    value: function _getNodeSizes(nodes, parentSize) {
                        var directionIndex = this._getDirectionIndex();
                        var sizes = this._createSizeArrayWithTrueSizesPopulated(nodes, directionIndex);
                        var sumTrueSizes = this._calculateSumOfTrueSizes(sizes);
                        this._fillUnknownSizes(sizes, parentSize[directionIndex], sumTrueSizes);
                        return sizes;
                    }
                },
                {
                    key: '_getNodePosition',
                    value: function _getNodePosition(node) {
                        if (!node._layoutPosition) {
                            node._nodePosition = new Position(node);
                        }
                        return node._nodePosition;
                    }
                },
                {
                    key: '_getNodeSize',
                    value: function _getNodeSize(node) {
                        if (!node._layoutSize) {
                            node._nodeSize = new Size(node);
                        }
                        return node._nodeSize;
                    }
                },
                {
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
                            nodePosition.set.apply(nodePosition, createArray([
                                0,
                                0,
                                0
                            ], position).concat(transition));
                            var nodeSize = _this3._getNodeSize(childNode);
                            nodeSize.halt();
                            nodeSize.setMode.apply(nodeSize, [
                                1,
                                1,
                                1
                            ]);
                            nodeSize.setAbsolute.apply(nodeSize, createArray(parentSize, size).concat(transition));
                            position += size;
                        });
                    }
                },
                {
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
                },
                {
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
                },
                {
                    key: 'transition',
                    set: function (transition) {
                        this._transition = transition;
                    }
                }
            ]);
            return FlexibleLayout;
        }(Node);
        FlexibleLayout.Direction = {
            X: Symbol('FlexibleLayout.Direction.X'),
            Y: Symbol('FlexibleLayout.Direction.Y'),
            Z: Symbol('FlexibleLayout.Direction.Z')
        };
        FamousFramework.registerCustomFamousNodeConstructors({ FlexibleLayout: FlexibleLayout });
        'use strict';
        FamousFramework.component('famous:layouts:flexible', 'HEAD', {
            'dependencies': { 'famous:core:node': 'HEAD' },
            'famousNodeConstructorName': 'FlexibleLayout',
            'extensions': [{
                    'name': 'famous:core:node',
                    'version': 'HEAD'
                }],
            'expose': {
                'type': 'ObjectExpression',
                'properties': []
            }
        }, {
            behaviors: {
                '$self': {
                    'direction': function (direction) {
                        return direction;
                    },
                    'ratios': function (ratios) {
                        return ratios;
                    },
                    'transition': function (transition) {
                        return transition;
                    }
                },
                '.flexible-layout': { 'style': {} },
                '.flexible-layout-item': { '$yield': true }
            },
            events: {
                '$public': {
                    'direction': function ($state, $payload) {
                        $state.set('direction', $payload);
                    },
                    'ratios': function ($state, $payload) {
                        $state.set('ratios', $payload);
                    },
                    'transition': function ($state, $payload) {
                        $state.set('transition', $payload);
                    },
                    'update-layout': function ($famousNode) {
                        $famousNode.updateLayout();
                    }
                },
                '$private': {
                    'direction': function ($famousNode, $payload) {
                        if ($payload === 0) {
                            $famousNode.direction = FlexibleLayout.Direction.X;
                        } else if ($payload === 1) {
                            $famousNode.direction = FlexibleLayout.Direction.Y;
                        } else if ($payload === 2) {
                            $famousNode.direction = FlexibleLayout.Direction.Z;
                        }
                    },
                    'ratios': function ($famousNode, $payload) {
                        $famousNode.ratios = $payload;
                    },
                    'transition': function ($famousNode, $payload) {
                        $famousNode.transition = $payload;
                    }
                }
            },
            states: {
                direction: 0,
                ratios: [],
                transition: null
            },
            tree: '<famous:core:node class="flexible-layout">\n            <famous:core:node class="flexible-layout-item"></famous:core:node>\n        </famous:core:node>\n    '
        }).config({
            famousNodeConstructorName: 'FlexibleLayout',
            includes: ['constructor.js']
        });
    }());
    (function(){
        'use strict';
        FamousFramework.scene('sayawan:twitter:tabbar', 'HEAD', {
            'dependencies': {
                'famous:events': 'HEAD',
                'famous:layouts:flexible': 'HEAD',
                'famous:core:node': 'HEAD'
            },
            'famousNodeConstructorName': '',
            'extensions': [{
                    'name': 'famous:core:node',
                    'version': 'HEAD'
                }],
            'expose': {
                'type': 'ObjectExpression',
                'properties': []
            }
        }, {
            behaviors: {
                '#tabs': {
                    'direction': 0,
                    'ratios': [
                        1,
                        1,
                        1,
                        1
                    ],
                    'style': { 'background-color': 'white' }
                },
                '#tab-item': {
                    'style': {
                        'text-align': 'center',
                        'line-height': '44px',
                        'cursor': 'pointer'
                    },
                    '$repeat': function (sections) {
                        return [
                            1,
                            2,
                            3,
                            4
                        ];
                    },
                    'content': function (sections, $index) {
                        if (sections[$index])
                            return sections[$index].title;
                    }
                }
            },
            events: {
                '$public': {
                    'sections': function ($state, $payload) {
                        $state.set('sections', $payload);
                    }
                },
                '#tab-item': {
                    'famous:events:click': function ($dispatcher, $state, $index) {
                        var sections = $state.get('sections');
                        var section = sections[$index].title;
                        $dispatcher.emit('footer-change-section', section);
                    }
                }
            },
            states: { sections: [] },
            tree: '<famous:layouts:flexible id="tabs">\n            <famous:core:node id="tab-item"></famous:core:node>\n        </famous:layouts:flexible>\n    '
        }).config({ imports: { 'famous:layouts': ['flexible'] } });
    }());
    (function(){
        'use strict';
        var data = {
            sections: [
                {
                    title: 'Home',
                    tweetNumber: 50
                },
                {
                    title: 'Discover',
                    tweetNumber: 50
                },
                {
                    title: 'Connect',
                    tweetNumber: 50
                },
                {
                    title: 'Me',
                    tweetNumber: 25
                }
            ]
        };
        FamousFramework.scene('sayawan:twitter', 'HEAD', {
            'dependencies': {
                'famous:layouts:header-footer': 'HEAD',
                'famous:core:node': 'HEAD',
                'sayawan:twitter:swapper': 'HEAD',
                'sayawan:twitter:tweets': 'HEAD',
                'sayawan:twitter:tabbar': 'HEAD'
            },
            'famousNodeConstructorName': '',
            'extensions': [{
                    'name': 'famous:core:node',
                    'version': 'HEAD'
                }],
            'expose': {
                'type': 'ObjectExpression',
                'properties': []
            }
        }, {
            behaviors: {
                '$self': {
                    'size': [
                        420,
                        600
                    ],
                    'origin': [
                        0.5,
                        0.5
                    ],
                    'align': [
                        0.5,
                        0.5
                    ],
                    'mount-point': [
                        0.5,
                        0.5
                    ]
                },
                '#hf': {
                    'header-height': 44,
                    'footer-height': 44
                },
                '#header': {
                    'content': function (currentSection) {
                        return '<h1 class="title">' + currentSection + '</h1>';
                    }
                },
                '#body': { 'style': { 'background-color': '#E5F4FF' } },
                '#footer': { 'sections': data.sections },
                '.view': { 'style': { 'font-size': '30px' } },
                '#discover-title': {
                    'content': 'Discover Page',
                    'size': [
                        200,
                        200
                    ],
                    'origin': [
                        0.5,
                        0.5
                    ],
                    'align': [
                        0.5,
                        0.5
                    ],
                    'mount-point': [
                        0.5,
                        0.5
                    ]
                },
                '#connect-title': {
                    'content': 'Connect Page',
                    'size': [
                        200,
                        200
                    ],
                    'origin': [
                        0.5,
                        0.5
                    ],
                    'align': [
                        0.5,
                        0.5
                    ],
                    'mount-point': [
                        0.5,
                        0.5
                    ]
                },
                '#profile-image': {
                    'size': [
                        80,
                        80
                    ],
                    'origin': [
                        0.5,
                        0.5
                    ],
                    'align': [
                        0.5,
                        0.5
                    ],
                    'mount-point': [
                        0.5,
                        0.5
                    ]
                },
                '#profile-name': {
                    'size': [
                        300,
                        50
                    ],
                    'origin': [
                        0.5,
                        0.5
                    ],
                    'align': [
                        0.5,
                        0.5
                    ],
                    'mount-point': [
                        0.5,
                        0.5
                    ],
                    'position': [
                        0,
                        60
                    ],
                    'content': 'Twitter User',
                    'style': {
                        'font-size': '20px',
                        'text-align': 'center',
                        'line-height': '50px'
                    }
                }
            },
            events: {
                '$lifecycle': {
                    'post-load': function ($dispatcher, $state) {
                        setTimeout(function () {
                            $dispatcher.broadcast('change-section', $state.get('currentSection'));
                        }, 0);
                    }
                },
                '$public': {
                    'main-change-section': function ($dispatcher, $payload) {
                        $dispatcher.broadcast('change-section', $payload);
                    }
                },
                '#footer': {
                    'footer-change-section': function ($payload, $state, $dispatcher) {
                        if ($state.get('currentSection') !== $payload)
                            $dispatcher.trigger('main-change-section', $payload);
                        $state.set('currentSection', $payload);
                    }
                }
            },
            states: { currentSection: 'Home' },
            tree: '<famous:layouts:header-footer id="hf">\n    <famous:core:node id="header" class="bar bar-positive"></famous:core:node>\n\n    <sayawan:twitter:swapper id="body">\n\n        <famous:core:node id="Home" class="view">\n            <sayawan:twitter:tweets id="tweets"></sayawan:twitter:tweets>\n        </famous:core:node>\n\n        <famous:core:node id="Discover" class="view">\n            <famous:core:node id="discover-title"></famous:core:node>\n        </famous:core:node>\n\n        <famous:core:node id="Connect" class="view">\n            <famous:core:node id="connect-title"></famous:core:node>\n        </famous:core:node>\n\n        <famous:core:node id="Me" class="view">\n            <famous:core:node id="profile-image">\n                <img src="sayawan/twitter//assets/me.jpg" width="100%">\n            </famous:core:node>\n            <famous:core:node id="profile-name"></famous:core:node>\n        </famous:core:node>\n\n    </sayawan:twitter:swapper>\n\n    <sayawan:twitter:tabbar id="footer"></sayawan:twitter:tabbar>\n</famous:layouts:header-footer>\n'
        }).config({
            imports: {
                'sayawan:twitter': [
                    'swapper',
                    'view',
                    'tabbar',
                    'tweets'
                ],
                'famous:layouts': ['header-footer']
            },
            includes: ['assets/ionic.min.css']
        });
    }());
    FamousFramework.markComponentAsReady("sayawan:twitter", "HEAD");
});