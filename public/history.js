const messagesDiv = document.getElementById('messages');
const messageIdInput = document.getElementById('messageIdInput');
const guildIdInput = document.getElementById('guildIdInput');
const channelIdInput = document.getElementById('channelIdInput');
const memberIdInput = document.getElementById('memberIdInput');
const loadButton = document.getElementById('loadButton');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');

let backwardCursor = null;
let forwardCursor = null;
let currentFilters = {};

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function isStringOnlyNumbers(str) {
    return /^\d+$/.test(str);
}

function displayMessages(messages) {
    messagesDiv.innerHTML = '';
    if (messages.length === 0) {
        messagesDiv.innerHTML = '<p>No messages found.</p>';
        return;
    }
    messages.forEach(message => {
        const messageElement = document.createElement('p');
        messageElement.innerHTML =
            `<strong>${escapeHtml(message.author_nick)}</strong>
            <span style="color: #72767d;">${new Date(message.timestamp).toLocaleString()} | G: ${message.guild_id || 'DM'} | C: ${message.channel_id} | A: ${message.author_id} | ID: ${message.id}</span>
            <br>${escapeHtml(message.content)}`;
        messagesDiv.appendChild(messageElement);
    });
}

function buildQueryString(baseParams) {
    const params = new URLSearchParams(baseParams);
    const guildId = guildIdInput.value.trim();
    const channelId = channelIdInput.value.trim();
    const memberId = memberIdInput.value.trim();

    if (guildId) params.append('guildId', encodeURIComponent(guildId));
    if (channelId) params.append('channelId', encodeURIComponent(channelId));
    if (memberId) params.append('memberId', encodeURIComponent(memberId));

    currentFilters = { guildId, channelId, memberId };

    return params.toString();
}

function buildQueryStringFromCurrentFilters(baseParams) {
    const params = new URLSearchParams(baseParams);
    if (currentFilters.guildId) params.append('guildId', encodeURIComponent(currentFilters.guildId));
    if (currentFilters.channelId) params.append('channelId', encodeURIComponent(currentFilters.channelId));
    if (currentFilters.memberId) params.append('memberId', encodeURIComponent(currentFilters.memberId));
    return params.toString();
}

loadButton.addEventListener('click', () => {
    const timestamp = parseInt(timestampInput.value);
    if (isStringOnlyNumbers(timestamp)) {
        backwardCursor = timestamp;
        forwardCursor = timestamp;
        const queryString = buildQueryString({ timestamp: encodeURIComponent(timestamp), limit: 50 });
        fetch(`/api/messages/before?${queryString}`)
            .then(response => response.json())
            .then(messages => {
                if (messages.length > 0) {
                    backwardCursor = messages[messages.length - 1].timestamp;
                    forwardCursor = messages[0].timestamp;
                    let reversed = messages.reverse();
                    displayMessages(reversed);
                } else {
                    messagesDiv.innerHTML = '<p>No messages found before the given timestamp.</p>';
                }
            });
    } else {
        // Handle case where timestamp input is invalid
        messagesDiv.innerHTML = '<p>Please enter a valid timestamp.</p>';
        backwardCursor = null;
        forwardCursor = null;
        currentFilters = {};
    }
});

prevButton.addEventListener('click', () => {
    if (backwardCursor !== null) {
        const queryString = buildQueryStringFromCurrentFilters({ timestamp: encodeURIComponent(backwardCursor), limit: 50 });
        fetch(`/api/messages/before?${queryString}`)
            .then(response => response.json())
            .then(messages => {
                if (messages.length > 0) {
                    backwardCursor = messages[messages.length - 1].timestamp;
                    forwardCursor = messages[0].timestamp;
                    let reversed = messages.reverse();
                    displayMessages(reversed);
                } else {
                    forwardCursor = backwardCursor - 1;
                    messagesDiv.innerHTML = '<p>No messages found before the given timestamp.</p>';
                }
            });
    }
});

nextButton.addEventListener('click', () => {
    if (forwardCursor !== null) {
        const queryString = buildQueryStringFromCurrentFilters({ timestamp: encodeURIComponent(forwardCursor), limit: 50 });
        fetch(`/api/messages/after?${queryString}`)
            .then(response => response.json())
            .then(messages => {
                if (messages.length > 0) {
                    forwardCursor = messages[messages.length - 1].timestamp;
                    backwardCursor = messages[0].timestamp;
                    displayMessages(messages);
                } else {
                    backwardCursor = forwardCursor + 1;
                    messagesDiv.innerHTML = '<p>No messages found after the given timestamp.</p>';
                }
            });
    }
});