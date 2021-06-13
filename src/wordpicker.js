// const DATA_JSON_URL = './assets/data-text-1500.json';
const DATA_JSON_URL = './assets/data-text-1500-cleaned.json';

const model_name_array = [
    'story',
    'model/model_words_199',
    'model/model_words_159',
    'model/model_words_99',
    'model/model_words_30',
    'model/model_words_5'
];

var maxDistance = 6;
var speakers = [];
var numSpeakers = 9;
let stories;

function initialize() {
    return fetch(DATA_JSON_URL)
        .then(response => {
            return response.json();
        })
        .then(json => {
            stories = json;
            dbloaded();
        });
}

function dbloaded() {
    // create speakers
    for (var i = 0; i < numSpeakers; i++) {
        speakers.push(speaker_init());
    }
}


function speaker_init() {
    const keys = Object.keys(stories);
    const speaker = {};
    speaker.current_story = stories[keys[Math.floor(keys.length * Math.random())]];
    speaker.story_text = [];
    speaker.story_word_id = 0;
    for (var j = 0; j < model_name_array.length; j++) {
        var text = speaker.current_story[model_name_array[j]].join(" ").toLowerCase().split(/\W+/);
        speaker.story_text.push(text);
    }
    return speaker;
}


function random_word(wordlist){
    return wordlist[Math.floor(wordlist.length * Math.random())]
}

function current_story_word(distance, speaker) {
    return speaker.story_text[distance][speaker.story_word_id];
}

function iterate_story_word(id){
    // IF WE WANT EACH AGENT TO CHOOSE A NEW STORY IF AT END
    if (speakers[id].story_word_id + 1 < speakers[id].story_text[0].length) {
        speakers[id].story_word_id++;
    } else {
        speakers[id] = speaker_init();
    }
    // IF WE WANT EACH AGENT TO CONTINUALLY TELL THE SAME STORY INSTEAD
    //speakers[id].story_word_id = (speakers[id].story_word_id + 1) % speakers[id].story_text[0].length;
}

/**
 * @param {number} id - id of the speaker 
 * @param {number} distance - Integer from 0 to 7
 */
function nextWord(id, distance){
    let potential_word = '';
    if (distance >= maxDistance) {
        return random_word(speakers[id].story_text[0]);
    } else {
            const potential_word = current_story_word(distance, speakers[id]);
            iterate_story_word(id);
            return potential_word;
    }
}

export {
    nextWord,
    initialize
};
