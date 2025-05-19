const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const payload = JSON.parse(event.body || '{}')
  console.log('Received form data:', payload)

const { data, error } = await supabase
  .from('sessions')
  .insert({
    name:       payload.name,
    level:      payload.level,
    native:     payload.native_language,
    test_date:  payload.test_date
  })
  .single()


  console.log('Supabase response:', { data, error })
  if (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ redirectUrl: `/chat?sessionId=${data.id}` })
  }
}
