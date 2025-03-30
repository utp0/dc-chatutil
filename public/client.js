fetch('/api/ping')
    .then(response => response.json())
    .then(data => console.log(data));

const messagesDiv = document.getElementById('messages');

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function addMessage(author_, content_, timestamp) {
    let dateStr = undefined;
    let author = undefined;
    let content = undefined;
    try {
        author = escapeHtml(author_);
        content = escapeHtml(content_);
        dateStr = new Date(timestamp).toLocaleString();
    } catch (error) {
        console.error("bruh moment encountered",
            btoa(JSON.stringify(
                {
                    author_: author_,
                    content_: content_,
                    timestamp: timestamp
                }
            ))
        );
        return;
    }

    const messageElement = document.createElement('p');
    messageElement.innerHTML =
        `<strong>${author}</strong>
        <span style="color: #72767d;">${dateStr}</span>
        <br>${content}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

addMessage('User1', 'Hello, world!', Date.now() - 300000 - (86400 * 1000 * 7));
addMessage('User2', 'How are you?', Date.now() - 240000);
addMessage('Bot', 'I am doing well.', Date.now() - 180000);
addMessage('User1', 'This is a longer message to show how wrapping works. It should span multiple lines.', Date.now() - 120000);
addMessage('User3', 'Nice to see you all here.', Date.now() - 60000);
addMessage('User2', 'This is a test message to show how the UI looks with more data.', Date.now());
