const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

// Rate limiting setup (5 requests per minute per IP)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5;

// Helper function to validate form data
const validateFormData = (data) => {
  const requiredFields = ['name', 'email', 'level', 'native_language', 'test_date'];
  const errors = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || String(data[field]).trim() === '') {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate email format
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  return errors;
};

// Helper function to check rate limit
const checkRateLimit = (ip) => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Clean up old entries
  for (const [ipAddr, { timestamp }] of rateLimit.entries()) {
    if (timestamp < windowStart) {
      rateLimit.delete(ipAddr);
    }
  }
  
  const userRate = rateLimit.get(ip) || { count: 0, timestamp: now };
  
  if (userRate.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  rateLimit.set(ip, {
    count: userRate.count + 1,
    timestamp: now
  });
  
  return true;
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Credentials': 'true'
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Length': '0',
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false,
        error: 'Method Not Allowed' 
      })
    };
  }

  try {
    // Get client IP for rate limiting
    const clientIP = event.headers['client-ip'] || 
                    event.headers['x-nf-client-connection-ip'] || 
                    'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false,
          error: 'Too many requests. Please try again later.' 
        })
      };
    }

    // Parse request body
    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false,
          error: 'Invalid request format' 
        })
      };
    }

    // Validate form data
    const validationErrors = validateFormData(payload);
    if (validationErrors.length > 0) {
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false,
          error: 'Validation failed', 
          details: validationErrors 
        })
      };
    }

    // Prepare data for Supabase
    const submissionData = {
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      german_level: payload.level,
      native_language: payload.native_language,
      test_date: payload.test_date,
      created_at: new Date().toISOString(),
      ip_address: clientIP,
      user_agent: event.headers['user-agent'] || ''
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('submissions')
      .insert([submissionData])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to save submission to database');
    }

    // Success response with CORS headers
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: true,
        message: 'Form submitted successfully',
        submission_id: data[0]?.id,
        redirect: '/start'  // Add redirect URL that frontend expects
      })
    };

  } catch (error) {
    console.error('Error processing submission:', error);
    
    return {
      statusCode: 200, // Return 200 to prevent CORS issues
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false,
        error: 'Failed to process submission',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Please try again later'
      })
    };
  }}
