// Import the Less topics module to access pub/sub topics
const { topics } = require('@chuva.io/less');

// Main handler for the GET request to this API endpoint
exports.process = async (request, response) => {
  // Publish an empty message to the 'generate_tweets' topic to trigger the tweet generation job
  await topics.generate_tweets.publish('');
  // Set the HTTP response status code to 200 (OK)
  response.statusCode = 200;
  // Return the response object to complete the request
  return response;
};
