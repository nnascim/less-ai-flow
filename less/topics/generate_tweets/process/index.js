// This module processes messages for the 'generate_tweets' topic by generating creative Tweets using an LLM (Large Language Model)
const { sendMessageToLLM } = require('helpers'); // Import helper to interact with the LLM
const { topics } = require('@chuva.io/less'); // Import Less topics for pub/sub

// Prompt template for the LLM, instructing it to generate 5 creative Tweets about Less
const AI_PROMPT = `You are a helpful assistant. Your task is to help the user post Tweets to Twitter. 
Generate 5 creative Tweets about Less. The documentation is available at https://docs.less.chuva.io. 
The Tweets should be engaging, informative, and relevant to the Less framework. 
Each Tweet should be concise and within the character limit of Twitter (280 characters). The html for the page is provided in the context.

Requirements:
1. Format the Tweets as an array of strings.
  - Example: ["Tweet 1", "Tweet 2", "Tweet 3"]
2. Do not include any text in the response other than the array of Tweets.
`;

// Main process function triggered when a message is published to the 'generate_tweets' topic
exports.process = async (message) => {
  // Log the incoming message for debugging
  console.log(`Processing message: ${message}`);

  // Fetch the HTML content of the Less documentation to provide context to the LLM
  const htmlData = await fetch('https://docs.less.chuva.io');
  const htmlText = await htmlData.text();

  // Combine the AI prompt with the fetched HTML context
  const AI_PROMPT_WITH_CONTEXT = `${AI_PROMPT}\n---\nHTML:\n${htmlText}`;

  // Send the prompt (with context) to the LLM and await its response
  const result = await sendMessageToLLM(AI_PROMPT_WITH_CONTEXT);

  // Parse the LLM's response, expecting a JSON array of Tweets
  const parsedResponse = JSON.parse(result);

  // Check if the result is an array as required by the prompt
  if (!Array.isArray(parsedResponse)) {
    // If not, log an error and throw to indicate failure
    console.error('LLM response is not an array:', result);
    throw new Error('LLM response is not an array');
  }

  // Log the valid result for debugging
  console.log('the format is valid', result);

  // Publish the array of Tweets to the 'make_it_fun' topic for further processing
  await topics.make_it_fun.publish(result);
};
