const { sendMessageToLLM } = require('helpers');

// Prompt to make existing Tweets fun by adding emojis.
const AI_PROMPT = `You are a fun, helpful assistant. Your task is to make the Tweets proposed by the junior marketer more fun
by adding relevant emojis. Update the Tweets below.

Requirements:
1. Format the Tweets as an array of strings.
  - Example: ["Tweet 1", "Tweet 2", "Tweet 3"]
2. Do not include any text in the response other than the array of Tweets.
`;

exports.process = async (message) => {
  console.log(`Making Tweets fun: ${message}`);

  // Append the existing Tweets to the AI prompt for context
  const AI_PROMPT_WITH_CONTEXT = `${AI_PROMPT}\n---\n${message}`;

  // Send the prompt (with context) to the LLM and await its response
  const result = await sendMessageToLLM(AI_PROMPT_WITH_CONTEXT);
  const parsedResult = JSON.parse(result);

  // Check if the result is properly formatted as an array
  if (!Array.isArray(parsedResult)) {
    console.error('LLM response is not an array:', result);
    throw new Error('LLM response is not an array');
  }

  console.log('the format is valid', result);
  // Do something with the fun Tweets. The easiest thing to do is 
  // just publish them to a topic which is as simple as calling a function.
  // This give you the opportunity to do 1 or n things with the result
  // in a decoupled and fault-tollerant way.
};
