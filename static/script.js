async function askQuestion() {
    const question = document.getElementById('questionInput').value;
    const conversationContainer = document.getElementById('conversationContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const ratingContainer = document.getElementById('ratingContainer');
    const questions = document.getElementsByClassName('question');

    if(question.length === 0) {
        return;
    }

    for (let index = 0; index < questions.length; index++) {
        if (questions[index].tagName.toLowerCase() === 'textarea' || 
            questions[index].tagName.toLowerCase() === 'button') {
            questions[index].disabled = true;
        }     
    }

    loadingSpinner.classList.remove('hidden');

    const userMessage = createUserMessageElement(question);
    conversationContainer.appendChild(userMessage);

    document.getElementById('questionInput').value = '';

    window.scrollTo(0, document.body.scrollHeight);

    // Create and append bot message element with typing animation
    const botMessage = createBotTypingElement();
    conversationContainer.appendChild(botMessage);
    window.scrollTo(0, document.body.scrollHeight);

    // Fetch bot response
    const response = await fetch('/ask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: question })
    });

    const data = await response.json();

    loadingSpinner.classList.add('hidden');

    // Replace typing animation with actual bot message
    const actualBotMessage = createBotMessageElement(data.content);
    conversationContainer.replaceChild(actualBotMessage, botMessage);

    // Scroll to the bottom of conversation container
    window.scrollTo(0, document.body.scrollHeight);

    // Show rating container
    ratingContainer.classList.remove('hidden');
    ratingContainer.style.display = 'flex';

    // Hide question elements and enable input elements
    for (let index = 0; index < questions.length; index++) {
        questions[index].disabled = false;
        questions[index].classList.add('hidden');
    }
}

let inputExpanded = false;

document.getElementById('questionInput').addEventListener('click', function() {
    if (!inputExpanded) {
        expandInput();
        inputExpanded = true;
    }
});

document.getElementById('questionInput').addEventListener('blur', function() {
    if (inputExpanded) {
        resetInputHeight();
        inputExpanded = false;
    }
});

function expandInput() {
    const input = document.getElementById('questionInput');
    input.style.height = '80px';
}

function resetInputHeight() {
    const input = document.getElementById('questionInput');
    input.style.height = '20px'; // Initial height
}



function createBotTypingElement() {
    const botMessage = document.createElement('div');
    botMessage.classList.add('chat-message', 'bot-message');

    const typingAnimation = document.createElement('div');
    typingAnimation.classList.add('dot-flashing');

    botMessage.appendChild(typingAnimation);

    return botMessage;
}



async function submitRating() {
    const rating = document.querySelector('input[name="rating"]:checked').value;
    const comment = document.getElementById('commentInput').value;
    const questions = document.getElementsByClassName('question');

    // Send rating and comment to server
    const response = await fetch('/rate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating: rating, comment: comment })
    });

    // Empty the comment input
    document.getElementById('commentInput').value = '';

    // Reset the rating
    const ratingInputs = document.querySelectorAll('input[name="rating"]');
    ratingInputs.forEach(input => {
        input.checked = false;
    });

    // Hide rating container after submitting
    for (let index = 0; index < questions.length; index++) {
        if (questions[index].tagName.toLowerCase() === 'textarea' || 
            questions[index].tagName.toLowerCase() === 'button') {
            questions[index].disabled = false;
            questions[index].classList.remove('hidden');
        } 
    }
    document.getElementById('ratingContainer').classList.add('hidden');
    ratingContainer.style.display = 'none';
}


document.getElementById('questionInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        askQuestion();
    }
});

document.getElementById('ratingContainer').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        submitRating();
    }
});

function createUserMessageElement(message) {
    var userMessageElement = document.createElement("div");
    userMessageElement.classList.add("chat-message", "user-message");

    var messageContent = document.createElement("div");
    messageContent.classList.add("message-content");

    var messageName = document.createElement("span");
    messageName.classList.add("message-name");
    messageName.textContent = "You:";

    var messageText = document.createElement("span");
    messageText.classList.add("message-text");
    messageText.textContent = message;

    messageContent.appendChild(messageName);
    messageContent.appendChild(messageText);

    userMessageElement.appendChild(messageContent);

    return userMessageElement;
}

function markdownToHtml(markdownText) {
    // Replace newline characters with <br> tags
    markdownText = markdownText.replace(/\n/g, '<br>');

    // Regular expression patterns for markdown syntax
    const patterns = [
        { type: 'strong', regex: /(\*\*|__)(.*?)\1/g }, // Bold
        { type: 'em', regex: /(\*|_)(.*?)\1/g }, // Italic
        { type: 'h', regex: /(\#+)\s(.+)/g }, // Headings
        { type: 'a', regex: /\[([^\]]+)\]\(([^\)]+)\)/g }, // Links
        { type: 'br', regex: /<br>/g }
    ];

    // Create array to hold parts of the text
    const parts = [];
    
    // Iterate over the entire text once
    let lastIndex = 0;
    while (lastIndex < markdownText.length) {
        let found = false;
        patterns.forEach(pattern => {
            pattern.regex.lastIndex = lastIndex; // Set the starting index for the regex
            const match = pattern.regex.exec(markdownText);
            if (match && match.index === lastIndex) {
                // Match found at the current index
                const content = match[0];
                parts.push({ type: pattern.type, content });
                lastIndex += content.length; // Update the index
                found = true;
            }
        });
        // If no match is found, it's plain text
        if (!found) {
            const text = markdownText.charAt(lastIndex);
            parts.push({ type: 'text', content: text });
            lastIndex++;
        }
    }

    // Create document fragment to hold the nodes
    const fragment = document.createDocumentFragment();

    // Process each part and create nodes accordingly
    parts.forEach(part => {
        const node = document.createElement(part.type === 'text' ? 'span' : part.type);
        if (part.type === 'a') {
            const linkText = part.content.match(/\[([^\]]+)\]/)[1];
            const linkUrl = part.content.match(/\(([^\)]+)\)/)[1];
            node.textContent = linkText;
            node.href = linkUrl;
            node.target = '_blank';
        } else if (part.type === 'h') {
            const headingLevel = part.content.match(/#+/)[0].length;
            const headingText = part.content.replace(/#+\s/, '');
            const headingTag = `h${headingLevel}`;
            node.textContent = headingText;
            node.tagName = headingTag.toUpperCase();
        } else {
            node.textContent = part.content.replace(/(\*\*|__|\*|_|\[|\])/g, ''); // Remove markdown characters
        }
        fragment.appendChild(node);
    });

    return fragment;
}



function createBotMessageElement(message) {
    console.log(message)
    var botMessageElement = document.createElement("div");
    botMessageElement.classList.add("chat-message", "bot-message");

    var messageContent = document.createElement("div");
    messageContent.classList.add("message-content");

    var botProfilePicture = document.createElement("img");
    botProfilePicture.src = "static/chatbot_profile_picture.jpg";
    botProfilePicture.alt = "Chatbot Profile Picture";
    botProfilePicture.classList.add("profile-picture");

    var botMessageName = document.createElement("span");
    botMessageName.classList.add("message-name");
    botMessageName.textContent = "H4nn4h:";

    // Convert markdown to HTML and replace '\n' with '<br>'
    var htmlText = markdownToHtml(message);

    // Add line breaks for '\n'
    htmlText.appendChild(document.createElement('br'));

    // Append the HTML content to the message text container
    var botMessageTextContainer = document.createElement("span");
    botMessageTextContainer.classList.add("message-text");
    botMessageTextContainer.appendChild(htmlText);

    messageContent.appendChild(botProfilePicture);
    messageContent.appendChild(botMessageName);
    messageContent.appendChild(botMessageTextContainer);

    botMessageElement.appendChild(messageContent);

    return botMessageElement;
}
