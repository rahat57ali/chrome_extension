// Parse token from query params
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

if (!token || token.length < 20) {
  document.body.textContent = 'Invalid token received.';
  throw new Error('Missing or invalid token.');
}

if (token) {
// Store the token in Chrome storage
chrome.storage.local.set({ token }, () => {
    console.log('Token stored successfully');

    // Optionally, close the popup window after a delay
    window.close();
});
} else {
document.write('Token not found in URL.');
}