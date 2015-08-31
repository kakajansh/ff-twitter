'use strict';

FamousFramework.component('famous:layouts:flexible', {
    behaviors: {
        '$self': {
            'direction': '[[identity]]',
            'ratios': '[[identity]]',
            'transition': '[[identity]]'
        },
        '.flexible-layout': {
            // HACK: force creating a layout wrapper container
            'style': {}
        },
        '.flexible-layout-item': {
            '$yield': true
        }
    },
    events: {
        '$public': {
            'direction': '[[setter]]',
            'ratios': '[[setter]]',
            'transition': '[[setter]]',
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
    tree: '\n        <node class="flexible-layout">\n            <node class="flexible-layout-item"></node>\n        </node>\n    '
}).config({
    famousNodeConstructorName: 'FlexibleLayout',
    includes: ['_constructor.js']
});