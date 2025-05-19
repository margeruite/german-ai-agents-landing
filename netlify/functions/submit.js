const fetch = require('node-fetch');

// Rate limiting setup (5 requests per minute per IP)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5;

// Helper function to validate form data
const validateFormData = (data) => {
  const requiredFields = ['name', 'level', 'native', 'date'];
  const errors = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || data[field].trim() === '') {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  return errors;
};

exports.handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }


  try {
    // Parse and validate form data
    let formData;
    try {
      formData = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON format' })
      };
    }

    // Validate required fields
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Validation failed', details: validationErrors })
      };
    }

    // Log the received data for debugging
    console.log('Form submission received:', formData);
    
    // Forward the data to n8n webhook
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n-instance/webhook-url';
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        level: formData.level,
        native: formData.native,
        date: formData.date
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n API responded with status: ${response.status}`);
    }

    // Get the response from n8n
    const responseData = await response.text();
    console.log('n8n response received');

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: true,
        redirect: `/chat?name=${encodeURIComponent(formData.name)}&level=${encodeURIComponent(formData.level)}&native=${encodeURIComponent(formData.native)}&date=${encodeURIComponent(formData.date)}`
      })
    };

  } catch (error) {
    console.error('Error processing form submission:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Failed to process form submission',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
