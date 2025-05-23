// This module provides shared helper functions for use throughout the project
// Add your helper functions below and export them as needed

const sgMail = require('@sendgrid/mail')

const { SENDGRID_API_KEY, OPENROUTER_API_KEY, DISABLE_EMAIL } = process.env;

// Check if the SendGrid API key is set in the environment variables
if (!SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not set in the environment variables');
}

// Check if the OpenRouter API key is set in the environment variables
if (!OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is not set in the environment variables');
}

// Check if email sending is disabled
if (DISABLE_EMAIL) {
  console.warn('Email sending is disabled. Set DISABLE_EMAIL to false to enable.');
}

// Set the SendGrid API key for sending emails
sgMail.setApiKey(SENDGRID_API_KEY);

// Helper function to send an email using SendGrid
const sendEmail = async ({ to, from, subject, text, html, replyTo }) => {
  const msg = {
    to,
    from,
    subject,
    text,
    html,
    replyTo,
  };

  try {
    if (DISABLE_EMAIL) {
      console.log('Email sending is disabled. Email not sent:', msg);
    } else {
      await sgMail.send(msg);
    }
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }
};

// Helper function to send a message to the OpenRouter API and get a response from the LLM
const sendMessageToLLM = async (message) => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-8b-instruct:free',
      // model: 'google/gemma-3n-e4b-it:free',
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Error from OpenRouter API: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.choices || data.choices.length === 0) {
    throw new Error('No choices returned from OpenRouter API');
  }

  const { content } = data.choices[0].message;
  return content;
};

// Export the helper functions for use in other parts of the project
module.exports = {
  sendEmail,
  sendMessageToLLM
};
