// This API endpoint handles POST requests from the SendGrid webhook
// It processes incoming webhook data and performs any required actions

// Main handler for the POST request to the SendGrid webhook endpoint

function getBoundary(headers) {
  // Extracts the boundary string from the Content-Type header
  const match = headers['Content-Type'].match(/boundary=(?:"([^"]+)"|([^;]+))/i)
  return match?.[1] || match?.[2]
}

const parseFormData = (request, response, next) => {
  // Middleware to parse multipart/form-data from the request body
  // Normalize line endings to \n for consistent parsing
  const body = request.body.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const boundary = getBoundary(request.headers);
  const parts = body.split(`--${boundary}`).filter(p => p.trim() && p.trim() !== '--')

  const result = { fields: {}, files: {} }

  for (const part of parts) {
    // Split headers and body using the first double newline (\n\n)
    const headerBodySplit = part.indexOf('\n\n');
    if (headerBodySplit === -1) continue;
    const rawHeaders = part.slice(0, headerBodySplit);
    const body = part.slice(headerBodySplit + 2).trim();
    const headers = rawHeaders.trim().split('\n').map(h => h.trim());

    const dispositionHeader = headers.find(h => h.startsWith('Content-Disposition'));
    if (!dispositionHeader) continue;

    const nameMatch = dispositionHeader.match(/name="([^"]+)"/);
    const filenameMatch = dispositionHeader.match(/filename="([^"]+)"/);

    const name = nameMatch?.[1];

    if (filenameMatch) {
      // If the part contains a file, extract its details
      const filename = filenameMatch[1];
      const contentType = headers.find(h => h.startsWith('Content-Type'))?.split(':')[1]?.trim();
      result.files[name] = { filename, contentType, content: body };
    } else {
      // If the part contains a field, extract its value
      result.fields[name] = body;
    }
  }

  // Attach parsed fields and files to the request object
  request.body = result.fields;
  request.files = result.files;

  next();
};

const { AI_EMAIL_ADDRESS } = process.env;

const extractId = (email) => {
  // Extracts the conversation ID from the email address
  const match = email.match(/^ai-tweeter\+([^\s@]+)@/);
  return match ? match[1] : null;
};

module.exports = {
  middlewares: [parseFormData],
  process: async (request, response) => {
    const {
      sender_ip,
      to,
      from,
      subject,
      text,
    } = request.body;
    
    // Check if the email is from an AI conversation
    const conversationId = extractId(to);
    if (conversationId) {
      console.log('Email is from an existing AI conversation.');
      console.log('Conversation ID:', conversationId);
    }
    else if (to === AI_EMAIL_ADDRESS) {
      console.log('Email is from a new AI conversation.');
    }
    else {
      // If the email is not relevant, return a 204 No Content response
      response.statusCode = 204;
      return response;
    }

    // Log the email details for debugging purposes
    console.log('To:', to);
    console.log('From:', from);
    console.log('Subject:', subject);
    console.log('Text:', text);
    
    // Return a 204 No Content response to indicate successful processing
    response.statusCode = 204;
    return response;
  }
};
