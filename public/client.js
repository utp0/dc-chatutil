fetch('/api/ping')
    .then(response => response.json())
    .then(data => console.log(data));

const messagesDiv = document.getElementById('messages');

function escapeHtml(unsafe) { // Added escapeHtml function
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function addMessage(author, content, timestamp) {
    author = escapeHtml(author);
    content = escapeHtml(content);
    const messageElement = document.createElement('p');
    messageElement.innerHTML =
        `<strong>${author}</strong> <span style="color: #72767d;">${new Date(timestamp).toLocaleTimeString()}</span><br>${content}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

addMessage('User1', 'Hello, world!', Date.now() - 300000);
addMessage('User2', 'How are you?', Date.now() - 240000);
addMessage('Bot', 'I am doing well.', Date.now() - 180000);
addMessage('User1', 'This is a longer message to show how wrapping works. It should span multiple lines.', Date.now() - 120000);
addMessage('User3', 'Nice to see you all here.', Date.now() - 60000);
addMessage('User2', 'This is a test message to show how the UI looks with more data.', Date.now());
