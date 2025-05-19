// Get user data from sessionStorage
const chatEmbed = document.getElementById('chat-embed');
let userData = {};
try {
  userData = JSON.parse(sessionStorage.getItem('german_ai_eval')) || {};
} catch (e) {}

// Build personalized params if needed
let embedSrc = "https://app.relevanceai.com/agents/d7b62b/4c7da8b5-e6d4-4de0-ac41-a53328a702f4/46fee42a-ba80-4e08-8cf3-82234bbf57c6/embed-chat?hide_tool_steps=true&hide_file_uploads=false&hide_conversation_list=false&bubble_style=agent&primary_color=%23685FFF&bubble_icon=pd%2Fchat&input_placeholder_text=Type+your+message...&hide_logo=false&hide_description=false";

// Optionally add user data to the URL if needed
if (Object.keys(userData).length > 0) {
  const url = new URL(embedSrc);
  if (userData.name) url.searchParams.append('name', userData.name);
  if (userData.level) url.searchParams.append('level', userData.level);
  if (userData.testdate) url.searchParams.append('exam', userData.testdate);
  if (userData.native) url.searchParams.append('lang', userData.native);
  embedSrc = url.toString();
}

if (chatEmbed) {
  chatEmbed.innerHTML = `<iframe src="${embedSrc}" width="100%" height="700" style="border:none;border-radius:1rem;" allow="clipboard-write"></iframe>`;
}
