'use strict';

var data = {
    usernames: ['@LouieBlooRaspberry', '@PonchoPunch', '@SirIsaacLime', '@StrawberryShortKook', '@AlexandertheGrape', '@LittleOrphanOrange'],
    begin: ['Walk towards ', 'Jump on ', 'Sing to ', 'Dance with ', 'Stare down ', 'Pick up ', 'Hold hands with ', 'Walk around ', 'Shake hands with ', 'Talk to ', 'Point at ', 'Read to ', 'High five ', 'Wave to '],
    middle: ['a duck ', 'some fish ', 'a zebra ', 'nine honey badgers ', 'an old gorilla ', 'a ham sandwich ', 'a peanut ', 'Nicolas Cage ', 'a sock ', 'a pillow ', '12 fish ', 'a potato ', 'your neighbor ', 'a snail '],
    end: ['quickly', 'and don\'t look back', 'without shoes', 'and clap your hands', 'and pat your belly', 'and do a jig', 'tomorrow', 'while eating ice cream', 'in the dark', 'at the park', 'with a friend', 'down by the bay', 'in the car', 'and yell'],
    hashtags: ['#harrystyles', '#live', '#boredom', '#mylife', '#hiphop', '#texas', '#november', '#scary', '#best', ' #snowman', '#shuffle', '#squats', '#selfie']
};

// Pick a random element from an array
function random(array) {
    return array[Math.random() * array.length | 0];
}

// create Random message
function getRandomMessage() {
    return '<b>' + random(data.usernames) + ':</b>' + random(data.begin) + random(data.middle) + random(data.end) + ' ' + random(data.hashtags) + ' ' + random(data.hashtags);
}

// Create a random hex color
function getRandomColor() {
    // trick to create a range.
    return '#' + Array.apply(null, Array(6)).map(function (_, i) {
        return random('0123456789ABCDEF');
    }).join('');
}

FamousFramework.scene('sayawan:twitter:tweets', {
    behaviors: {
        'scroll-view': {
            'item-height': 100,
            'scroll-view-size': function (scrollViewSize) {
                return scrollViewSize;
            },
            'style': {
                'border': '0px'
            }
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
                    result.push({
                        content: getRandomMessage()
                    });
                }
                return result;
            }
        }
    },
    events: {
        '$self': {
            'parent-size-change': function ($event, $state) {
                $state.set('scrollViewSize', $event.value);
            }
        }
    },
    states: {
        scrollViewSize: [],
        count: 20
    },
    tree: '\n        <scroll-view>\n            <node class="scroll-view-item"></node>\n        </scroll-view>\n    '
}).config({
    imports: {
        'famous:layouts': ['scroll-view']
    }
});