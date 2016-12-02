/**
 * @file index.js
 * Exports a method that generates and tweets out a string to @realDonaldTrump.
 */

const Twitter = require('twitter');
const Markov = require('markov-strings');
const client = new Twitter(require('./config.js'));

/**
 * Fetches tweets for the specified screen name.
 * @param {string} screenName
 *  Name of user for which tweets will be fetched.
 * @returns {object}
 *  Promise object that resolves an array of tweets.
 */
const fetchTweets = (screenName, count) => (
  new Promise((resolve, reject) => {
    client.get('statuses/user_timeline', {
      screen_name: screenName,
      count,
    }, (error, tweets) => {
      if (error) {
        return reject(error);
      }
      return resolve(tweets);
    });
  })
);

/**
 * Fetches past 200 tweets from specified username and uses Markov to generate a new sentance.
 * @param {string} screenName
 *  Name of user for which a tweet will be generated.
 * @return {object}
 *  Promise object that resolves a markov-generated sentance.
 */
const generateTweet = (screenName) => (
  new Promise((resolve, reject) => {
    // Fetch last 200 tweets from screenName.
    fetchTweets(screenName, 200).then((tweets) => {
      // Create a markov chain generator.
      const markov = new Markov(tweets.map(tweet => tweet.text), {
        stateSize: 1,
        maxLength: 123,
        minScore: 10,
      });

      // Build corpus, generate sentance.
      markov.buildCorpus()
      .then(() => markov.generateSentence())
      .then(result => {
        resolve(result.string);
      }).catch(reject);
    }).catch(reject);
  })
);

/**
 * Generates a tweet and sends it to realDonaldTrump.
 * @returns {undefined} nothing.
 */
const tweetToTrump = () => {
  const screenName = 'realDonaldTrump';
  generateTweet(screenName).then((sentance) => {
    client.post('statuses/update', { status: `@${screenName} ${sentance}` },
      (error) => {
        if (error) {
          console.log(error);
        }
      }
    );
  }).catch(console.log);
};

exports.handler = tweetToTrump;
