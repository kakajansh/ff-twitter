'use strict';

FamousFramework.scene('sayawan:twitter:tabbar', {
    behaviors: {
        '#tabs': {
            'direction': 0,
            'ratios': [1, 1, 1, 1],
            'style': {
                'background-color': 'white'
            }
        },
        '#tab-item': {
            'style': {
                'text-align': 'center',
                'line-height': '44px',
                'cursor': 'pointer'
            },
            '$repeat': function (sections) {
                return [1, 2, 3, 4];
            },
            'content': function (sections, $index) {
                if (sections[$index]) return sections[$index].title;
            }
        }
    },
    events: {
        '$public': {
            'sections': '[[setter|sections]]'
        },
        '#tab-item': {
            'click': function ($dispatcher, $state, $index) {
                var sections = $state.get('sections');
                var section = sections[$index].title;
                // console.log(section);

                $dispatcher.emit('footer-change-section', section);
            }
        }
    },
    states: {
        sections: []
    },
    tree: '\n        <flexible id="tabs">\n            <node id="tab-item"></node>\n        </flexible>\n    '
}).config({
    imports: {
        'famous:layouts': ['flexible']
    }
});