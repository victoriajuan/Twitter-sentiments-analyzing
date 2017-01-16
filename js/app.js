'use strict';
//global variable of emotion words
var _EMOTIONS = ["positive", "negative", "anger", "anticipation", 
                "disgust", "fear", "joy", "sadness", "surprise", "trust"];

/* Your script goes here */

/* The function to return a array of text from input string */
function extractWords(textString){
    //to array first
    var text = textString.toLowerCase().split(/\W+/); 
    var textArray = text.filter(function(removeOne) { 
        //then remove all the words that have one letter or fewer
        return removeOne.length > 1; 
    });
    return textArray;
}

/* The function return a new object of the the words have sentiments from input array */
function findSentimentWords(textArray){
    var finalObject = {};
    _EMOTIONS.forEach(function(emotions){
        finalObject[emotions] = [];
    });
    //nested loop to go through both input array and _EMOTIONS
    textArray.forEach(function(words){
        _EMOTIONS.forEach(function(emotions){ 
            //if the certain word appear in the _SENTIMENTS  object
            if(words in _SENTIMENTS 
            //and it has emotion object
            && _SENTIMENTS[words][emotions] !== undefined){ 
                finalObject[emotions].push(words);
            }
        });
    });
    return finalObject;
}

/* The function to  return a new object contains 
the percentage of words have sentiments, 
three most appreaded words and hushtages */
function analyzeTweets(tweetArray){ 
  //count the total words of the tweets and find the words from tweet that are sentiments words
  var totalWords = 0; 
  var sentimentsTweets = [];
  tweetArray.forEach(function (tweets){
    totalWords += extractWords(tweets.text).length;
    sentimentsTweets.push(findSentimentWords(extractWords(tweets.text)));
  });
  //to count the sentiments words
  var temp = {};
  //count the length of each sentiments words
  var counter = {};
  _EMOTIONS.forEach(function (emotion){
      temp[emotion] = [];
      counter[emotion] = [];
    });
  //get each object inside of sentimentsTweets
  sentimentsTweets.forEach(function (tweetSentiment){ 
    //get the emotions from each objects values
  	Object.keys(tweetSentiment).forEach(function (tweetsEmotions){ 
      //words stored in array from tweetArray appeared in wach emotion
      tweetSentiment[tweetsEmotions].forEach(function (tweetWords){ 
        //put all the words into a array point to their object emotion
        temp[tweetsEmotions].push(tweetWords); 
      });
      //count how many words in each object emotion
      counter[tweetsEmotions] = temp[tweetsEmotions].length;
    });
  });
  //have a new result object put the emotions in first, load others array later
    var result = {};
  _EMOTIONS.forEach(function(emotion){
  	result[emotion] = [];
  });
  //put the results into and return a final result object
   Object.keys(counter).forEach(function (EMO) {
       //percentage
       result[EMO].push(counter[EMO] / totalWords);
       //cut the words for only three of them
       result[EMO].push(unique(temp[EMO]).slice(0,3));
       //hashtags
       result[EMO].push(helper(sentimentsTweets, EMO, tweetArray));
   });
   //final
  return result;
}

/* Had this code from online, function to remove duplicate words, returns a new array */
function unique(array) {
	var countDup = array.reduce(function (previous, current){
  	previous[current] = (previous[current] || 0) + 1;
  	return previous;
	}, {});
	var wordsSorted = Object.keys(countDup).sort(function (a, b){
    return countDup[b] - countDup[a];
  });
	return wordsSorted;
}

/* The function to find most three appreaded hushtags from tweets */
function helper(sentimentsTweets, EMO, tweetArray){
    var hushtages = [];
    //go through all the sentiment words
	for (var i = 0; i < sentimentsTweets.length; i++){
        //if there is hashtags
		if (sentimentsTweets[i][EMO].length > 0 
            && tweetArray[i].entities.hashtags.length > 0){
			tweetArray[i].entities.hashtags.forEach(function(tages){
				hushtages.push(tages.text);
			});
		}
	}
    //remore the duplicated hashtags
	hushtages = unique(hushtages).map(function(hashtag){
	    return "#" + hashtag;
	});
    //leave only 3
	return hushtages.slice(0,3);
}

/* The function to display the data on the screen int the table */
function showStatistics(tweetArray){
    //remoe before display another, got inspired from online code, put inthe first so it update everytime run the function
    var remove = document.querySelector('tbody');
    while(remove.firstChild){
        remove.removeChild(remove.firstChild);
    }

    //first row of semtiments words
    var firstElement = [];
    _EMOTIONS.forEach(function(emotionRow){
            firstElement.push(emotionRow);
    });

    //load all the data to three array as the row will display in the table from analyzed Tweets
    var secondElement  = [];
    var thirdElement  = [];
    var forthElement  = [];
    Object.keys(tweetArray).forEach(function(analyzedEmotion){
         tweetArray[analyzedEmotion].forEach(function(arrayIndex){
            if(tweetArray[analyzedEmotion].indexOf(arrayIndex)===0){
                //percentage
                secondElement.push((tweetArray[analyzedEmotion][0]*100).toFixed(2) + "%");
            }else {
                if(tweetArray[analyzedEmotion].indexOf(arrayIndex)===1){
                    //example three words
                    thirdElement.push(tweetArray[analyzedEmotion][1]);
                }else if(tweetArray[analyzedEmotion].indexOf(arrayIndex)===2){
                    //hastages
                    forthElement.push(tweetArray[analyzedEmotion][2]);
                }
            } 
        });
    });
    
    //the variable identify the row
    var runTime = 0;
    //put all the data stored in the array before
    Object.keys(tweetArray).forEach(function (analyzedSentiments){
        var row = document.createElement("TR");
        var col = document.createElement("TH");
        //sentiments row
        var cellText = document.createTextNode(analyzedSentiments);
        //add sentiments row
        col.appendChild(cellText);
        row.appendChild(col);
        for(var f=1; f<4; f++){
            var col = document.createElement("TH");
            //all data to load in the percentage row
            if(f===1){
                var cellText = document.createTextNode(secondElement[runTime]);
                //example words row
            }else if(f===2){
                var cellText = document.createTextNode(thirdElement[runTime]);
            }else {
                //hashtags rows
                var cellText = document.createTextNode(forthElement[runTime]);
                runTime++;
                //finish one column move tot he next row by adding the runtime varibale
            }
            //put all the completed rows and columns
            col.appendChild(cellText);
            row.appendChild(col);
        }
        //add to table
        document.querySelector("tbody").appendChild(row);
    });
 }

/* The function to enable users to load tweets  by the input url*/
function loadTweets(url) {
  fetch(url)
    .then(
    function (response) {
      response.json().then(function (data) {
        showStatistics(analyzeTweets(data));
      });
    })
}

/* The function to search by the tweeter user name */
function searching(tweetsAccount) {
    var link = "https://faculty.washington.edu/joelross/proxy/twitter/timeline/?screen_name=" + tweetsAccount + "&count=100";
    loadTweets(link);
}

/* make a button */
var button = document.getElementById("searchButton");
button.addEventListener("click", function () { 
    searching(document.getElementById("searchBox").value) 
});
