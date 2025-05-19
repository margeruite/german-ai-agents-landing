const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const formData = JSON.parse(event.body);
    
    // Log the received data for debugging
    console.log('Received form data:', formData);
    
    // Forward the data to n8n
    const response = await fetch('https://evaluaime.app.n8n.cloud/webhook/72e8d0cf-63f8-41ef-bc47-f5bb1f5e1b75', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    // Get the response from n8n
    const responseData = await response.text();
    console.log('n8n response:', responseData);

    return {
      statusCode: 303, // Use 303 for redirect after POST
      headers: {
        'Location': '/?form_submitted=true',
        'Cache-Control': 'no-cache'
      },
      body: 'Redirecting...'
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to submit form', details: error.message }),
    };
  }
};
