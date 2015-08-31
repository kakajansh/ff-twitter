'use strict';

var data = {
    sections: [{
        title: 'Home',
        tweetNumber: 50
    }, {
        title: 'Discover',
        tweetNumber: 50
    }, {
        title: 'Connect',
        tweetNumber: 50
    }, {
        title: 'Me',
        tweetNumber: 25
    }]
};

FamousFramework.scene('sayawan:twitter', {
    behaviors: {
        '$self': {
            'size': [420, 600],
            'origin': [0.5, 0.5],
            'align': [0.5, 0.5],
            'mount-point': [0.5, 0.5]
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
        '#body': {
            'style': {
                'background-color': '#E5F4FF'
            }
        },
        '#footer': {
            'sections': data.sections
        },
        '.view': {
            // 'content': function($index) {
            // return data.sections[$index].title;
            // },
            'style': {
                'font-size': '30px'
            }
        },
        '#discover-title': {
            'content': 'Discover Page',
            'size': [200, 200],
            'origin': [0.5, 0.5],
            'align': [0.5, 0.5],
            'mount-point': [0.5, 0.5]
        },
        '#connect-title': {
            'content': 'Connect Page',
            'size': [200, 200],
            'origin': [0.5, 0.5],
            'align': [0.5, 0.5],
            'mount-point': [0.5, 0.5]
        },
        '#profile-image': {
            'size': [80, 80],
            'origin': [0.5, 0.5],
            'align': [0.5, 0.5],
            'mount-point': [0.5, 0.5]
        },
        '#profile-name': {
            'size': [300, 50],
            'origin': [0.5, 0.5],
            'align': [0.5, 0.5],
            'mount-point': [0.5, 0.5],
            'position': [0, 60],
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
                if ($state.get('currentSection') !== $payload) $dispatcher.trigger('main-change-section', $payload);
                $state.set('currentSection', $payload);
            }
        }
    },
    states: {
        currentSection: 'Home'
    },
    tree: 'twitter.html'
}).config({
    imports: {
        'sayawan:twitter': ['swapper', 'view', 'tabbar', 'tweets'],
        'famous:layouts': ['header-footer']
    },
    includes: ['assets/ionic.min.css']
});