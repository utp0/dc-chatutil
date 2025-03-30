const messagesDiv = document.getElementById('messages');
const messageIdInput = document.getElementById('messageIdInput');
const loadButton = document.getElementById('loadButton');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');

let currentMessageId = null;

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function displayMessages(messages) {
    messagesDiv.innerHTML = '';
    messages.forEach(message => {
        const messageElement = document.createElement('p');
        messageElement.innerHTML = `<strong>${escapeHtml(message.author_nick)}</strong> <span style="color: #72767d;">${new Date(message.timestamp).toLocaleTimeString()}</span><br>${escapeHtml(message.content)}`;
        messageElement.innerHTML =
            `<strong>${escapeHtml(message.author_nick)}</strong>
        <span style="color: #72767d;">${new Date(message.timestamp).toLocaleString()} id: ${message.id}</span>
        <br>${escapeHtml(message.content)}`;
        messagesDiv.appendChild(messageElement);
    });
}

function displayMessages(messages) {
    messagesDiv.innerHTML = '';
    if (messages.length === 0) {
        messagesDiv.innerHTML = '<p>No messages found.</p>';
        return;
    }
    messages.forEach(message => {
        const messageElement = document.createElement('p');
        messageElement.innerHTML = `<strong>${escapeHtml(message.author_nick)}</strong> <span style="color: #72767d;">${new Date(message.timestamp).toLocaleTimeString()}</span><br>${escapeHtml(message.content)}`;
        messagesDiv.appendChild(messageElement);
    });
}

loadButton.addEventListener('click', () => {
    const timestamp = parseInt(timestampInput.value); // Changed to timestampInput
    if (!isNaN(timestamp)) {
        backwardCursor = timestamp;
        forwardCursor = timestamp;
        fetch(`/api/messages/before?timestamp=${timestamp}&limit=50`)
            .then(response => response.json())
            .then(displayMessages);
    }
});

prevButton.addEventListener('click', () => {
    if (backwardCursor) {
        fetch(`/api/messages/before?timestamp=${backwardCursor}&limit=50`)
            .then(response => response.json())
            .then(messages => {
                if (messages.length > 0) {
                    backwardCursor = messages[messages.length - 1].timestamp;
                    forwardCursor = messages[0].timestamp;
                    let reversed = [];
                    messages.forEach(message => {
                        reversed.unshift(message);
                    });
                    displayMessages(reversed);
                }
            });
    }
});

nextButton.addEventListener('click', () => {
    if (forwardCursor) {
        fetch(`/api/messages/after?timestamp=${forwardCursor}&limit=50`)
            .then(response => response.json())
            .then(messages => {
                if (messages.length > 0) {
                    forwardCursor = messages[messages.length - 1].timestamp;
                    backwardCursor = messages[0].timestamp;
                    displayMessages(messages);
                }
            });
    }
});