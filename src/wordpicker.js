const DATA_JSON_URL = './assets/data-text-1500.json';

const model_name_array = [
    'story',
    'model/model_words_199',
    'model/model_words_159',
    'model/model_words_99',
    'model/model_words_30',
    'model/model_words_5'
];

// TODO: Clean up data so we don't need this array
const missing_words = ['href="http://whenyoureready.org/wp-content/uploads/unnamed.png"><img.wav','**','uploads','','transgender/nonbinary','"http://whenyoureready.org/wp-content/uploads/img_5743.jpg"><img.wav','"',':','wp-image-1973"','1973','org','whenyoureready','http','wp','size-medium','wp-image-1260"',".",",", "'", "’","","$", "£250", "🙁", "-", "!", "_", "__", "___", "?", "...", "………", "]", "[", "@", "%", "+", "=", '</em>', '<a', '<em>all', 'story</a>', 'details):</em>', '/', '>', 'href="http://whenyoureready.org/myrape1/">my', 'class="alignright','alt=""', 'src="http://whenyoureready.org/wp-content/uploads/28782867_2211851415508248_4292455536774270930_n-300x300.jpg"/></a>','href="http://whenyoureready.org/wp-content/uploads/28782867_2211851415508248_4292455536774270930_n.jpg"><img', 'wp-image-2598"'];

var numSpeakers = 9;
var maxDistance = 6;
var speakers = [];
var numSpeakers = 9;
let stories;

function initialize() {
    // dbloaded();
    fetch(DATA_JSON_URL)
    .then(response => {
        return response.json();
    })
    .then(json => {
        stories = JSON.parse(json);
        dbloaded();
    });
}

function dbloaded() {
    // create speakers
    for (var i = 0; i < numSpeakers; i++) {
        speakers.push(speaker_init(i));
    }
}


function speaker_init(id) {
    var keys = Object.keys(stories);
    var speaker = new Object();
    speaker.current_story = stories[keys[ keys.length * Math.random() << 0]];
    speaker.story_text = [];
    speaker.story_word_id = 0;
    for (var j = 0; j < model_name_array.length; j++) {
        var text = speaker.current_story[model_name_array[j]].join(" ").toLowerCase().split(" ");
        speaker.story_text.push(text);
    }
    return speaker;
}


function random_word(wordlist){
    return wordlist[wordlist.length * Math.random() << 0]
}

function current_story_word(distance, speaker) {
    return speaker.story_text[distance][speaker.story_word_id];
}

function iterate_story_word(id){
    // IF WE WANT EACH AGENT TO CHOOSE A NEW STORY IF AT END
    if (speakers[id].story_word_id + 1 < speakers[id].story_text[0].length) {
        speakers[id].story_word_id++;
    } else {
        speakers[id] = speaker_init(i);
    }
    // IF WE WANT EACH AGENT TO CONTINUALLY TELL THE SAME STORY INSTEAD
    //speakers[id].story_word_id = (speakers[id].story_word_id + 1) % speakers[id].story_text[0].length;
}

/**
 * @param {number} id - id of the speaker 
 * @param {number} distance - Integer from 0 to 7
 */
function nextWord(id, distance){
    // var distance = sensors[id];
    //console.log( "distance value " + sensors[id]);
    let potential_word = '';
    if (distance >= maxDistance) {
        while (missing_words.includes(potential_word)) {
            potential_word = random_word(speakers[id].story_text[0]);
        }
    } else {
        while (missing_words.includes(potential_word)) {
            potential_word = current_story_word(distance,speakers[id]);
            iterate_story_word(id);
        }
    }
    // TODO clean up data so we don't have to do this
    potential_word = potential_word.replace(/\ |\?|\.|\!|\/|\;|\:|\,|\"|\[|\]|\(|\)|\'|\’|\“/g, '');
    return potential_word
}

initialize();

export {
    nextWord
};