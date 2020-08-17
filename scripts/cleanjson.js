const fs = require('fs');
const storyFile = '../assets/data-text-1500.json'
const soundFileDir = '../assets/sounds/'

const model_name_array = [
      'story',
      'model/model_words_199',
      'model/model_words_159',
      'model/model_words_99',
      'model/model_words_30',
      'model/model_words_5'
];

const wordSplitRegex = /[\s|-|-|—|–|,|…|‘]+|\<.*\>/g;
const wordCleanRegex = /\ |\?|\.|\!|\/|\;|\:|\,|\"|”|\[|\]|\(|\)|\'|\’|\“/g;

// 
//const potential_word = potential_word.replace(/\ |\?|\.|\!|\/|\;|\:|\,|\"|\[|\    ]|\(|\)|\'|\’|\“/g, '');

// const missing_words = ['href="http://whenyoureready.org/wp-content/uploads/unnamed.png"><img.wav', '**', 'uploads', '', 'transgender/nonbinary', '"http://whenyoureready.org/wp-content/uploads/img_5743.jpg"><img.wav', '"', ':', 'wp-image-1973"', '1973', 'org', 'whenyoureready', 'http', 'wp', 'size-medium', 'wp-image-1260"', ".", ",", "'", "’", "", "$", "£250", "🙁", "-", "!", "_", "__", "___", "?", "...", "………", "]", "[", "@", "%", "+", "=", '</em>', '<a', '<em>all', 'story</a>', 'details):</em>', '/', '>', 'href="http://whenyoureready.org/myrape1/">my', 'class="alignright', 'alt=""', 'src="http://whenyoureready.org/wp-content/uploads/28782867_2211851415508248_4292455536774270930_n-300x300.jpg"/></a>', 'href="http://whenyoureready.org/wp-content/uploads/28782867_2211851415508248_4292455536774270930_n.jpg"><img', 'wp-image-2598"'];

const stories = JSON.parse(fs.readFileSync(storyFile));

const outObject = {}

const missingWords = {};

Object.keys(stories).forEach(function (storyKey) {
      outObject[storyKey] = {}
      const storyModel = stories[storyKey];
      model_name_array.forEach(function (level) {
            outObject[storyKey][level] = [];
            const story = storyModel[level];
            story.forEach(function (w, index) {
                  const storyArray = [];
                  w.split(wordSplitRegex).forEach(function (word) {
                        let cleanWord = word.replace(wordCleanRegex, '').toLowerCase();
                        // const cleanWord = word;
                        switch (cleanWord) {
                              case '&':
                                    cleanWord = 'and';
                                    break;
                              case 'womens':
                                    cleanWord = 'womans';
                                    break;
                              case 'theyre':
                                    cleanWord = 'their';
                                    break;
                              case 'humour':
                                    cleanWord = 'humor';
                                    break;
                              case 'youve':
                                    checkAndAddWord('you', storyArray);
                                    checkAndAddWord('have', storyArray);
                                    return;
                              case 'youd':
                                    checkAndAddWord('you', storyArray);
                                    checkAndAddWord('would', storyArray);
                                    return;
                              case 'youll':
                                    checkAndAddWord('you', storyArray);
                                    checkAndAddWord('will', storyArray);
                                    return;
                              case 'theyll':
                                    checkAndAddWord('they', storyArray);
                                    checkAndAddWord('will', storyArray);
                                    return;
                              case 'theyre':
                                    checkAndAddWord('they', storyArray);
                                    checkAndAddWord('are', storyArray);
                                    return;
                              case 'theyd':
                                    checkAndAddWord('they', storyArray);
                                    checkAndAddWord('would', storyArray);
                                    return;
                              case 'werent':
                                    checkAndAddWord('were', storyArray);
                                    checkAndAddWord('not', storyArray);
                                    return;
                              case 'heres':
                                    checkAndAddWord('here', storyArray);
                                    checkAndAddWord('is', storyArray);
                                    return;
                              case 'hed':
                                    checkAndAddWord('he', storyArray);
                                    checkAndAddWord('would', storyArray);
                                    return;
                              case 'shouldve':
                                    checkAndAddWord('should', storyArray);
                                    checkAndAddWord('have', storyArray);
                                    return;
                              case 'wouldve':
                                    checkAndAddWord('would', storyArray);
                                    checkAndAddWord('have', storyArray);
                                    return;
                              case 'omg':
                                    checkAndAddWord('o', storyArray);
                                    checkAndAddWord('m', storyArray);
                                    checkAndAddWord('g', storyArray);
                                    return;





                        }
                        checkAndAddWord(cleanWord, storyArray)

                  })
                  outObject[storyKey][level].push(storyArray.join(' '));
            });
      });
});

fs.writeFileSync('../newjson.json', JSON.stringify(outObject));


function checkAndAddWord(word, cleanWordArray) {
      const wordAudioFile = soundFileDir + word + '.mp3';
      if (word.length > 0 && !fs.existsSync(wordAudioFile)) {
            // console.log('file does not exist:', wordAudioFile);
            missingWords[word] = missingWords[word] || 0;
            missingWords[word]++;
      } else {
            cleanWordArray.push(word);
            // console.log('found word:', cleanWord);
      }
}

const sorted = Object.keys(missingWords).map(k => {
      return {k:k, v:missingWords[k]}
}).sort((a,b) => { return b.v - a.v});

console.log(sorted);

