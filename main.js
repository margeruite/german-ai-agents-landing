// Smooth scroll for CTA button
const ctaBtn = document.querySelector('.cta-btn');
if (ctaBtn) {
  ctaBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const form = document.getElementById('writing-form');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// Simple demo login logic
const loginForm = document.querySelector('.login-form');
if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === 'demo' && password === 'test123') {
      window.location.href = 'dashboard.html';
    } else {
      alert('Login failed: Invalid credentials. (Demo: demo/test123)');
    }
  });
}

// Google Identity Services
window.onload = function() {
  const googleBtn = document.querySelector('.login-google');
  if (googleBtn) {
    googleBtn.addEventListener('click', function(e) {
      e.preventDefault();
      // Google Identity Services OAuth2
      window.open('https://accounts.google.com/o/oauth2/v2/auth?client_id=458447469029-6duq13ir3gj0p8cps4vc288eclbo6f1f.apps.googleusercontent.com&redirect_uri='+encodeURIComponent(window.location.origin + '/dashboard.html')+'&response_type=token&scope=openid%20email%20profile', '_self');
    });
  }
};

const evaluationForm = document.getElementById('evaluation-form');
if (evaluationForm) {
  evaluationForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const data = {
      name: evaluationForm.name.value.trim(),
      email: evaluationForm.email.value.trim(),
      level: evaluationForm.level.value,
      testdate: evaluationForm.testdate.value,
      native: evaluationForm.native.value.trim()
    };
    // Send data to the webhook
    fetch('https://api-d7b62b.stack.tryrelevance.com/latest/agents/hooks/custom-trigger/4c7da8b5-e6d4-4de0-ac41-a53328a702f4/74412d1e-571f-45d8-9882-0123464a1ba6', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (response.ok) {
        window.location.href = 'dashboard.html';
      } else {
        alert('Error: Could not submit the form.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error: Could not submit the form.');
    });
  });
}
