const Twitter = require('twitter');
const Markov = require('markov-strings');
const client = new Twitter(require('./config.js'));

function tweet(event, context) {
  client.get(
    'statuses/user_timeline',
    {
      screen_name: 'realDonaldTrump',
      count: 200
    },
    (error, tweets, response) => {
      if (!error) {
        const markov = new Markov(
          tweets.map(tweet => tweet.text),
          {
            stateSize: 1,
            maxLength: 123,
            minScore: 10
          }
        );
        markov.buildCorpus()
          .then(() => markov.generateSentence())
          .then(result => {
            client.post(
              'statuses/update',
              {
                status: `@realDonaldTrump ${result.string}`
              },
              (error, tweet, response) => {
                if (error) {
                  console.log(error);
                }
              }
            );
          })
          .catch(err => console.log(err));
      }
    }
  );
}

exports.handler = tweet;
