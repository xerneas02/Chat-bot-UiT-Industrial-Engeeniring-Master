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
        if (questions[index].tagName.toLowerCase() === 'input' || 
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
        if (questions[index].tagName.toLowerCase() === 'input' || 
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

function createBotMessageElement(message) {
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

    // Create a span to contain the message text
    var botMessageTextContainer = document.createElement("span");
    botMessageTextContainer.classList.add("message-text");

    // Regular expressions to match links from different domains
    const linkRegexes = [
        /(https?:\/\/\S*\.?uit\.no\S*)/g, // Links from uit.no
        /(https?:\/\/\S*\.?samskipnaden\.no\S*)/g, // Links from samskipnaden.no
        /(https?:\/\/www\.facebook\.com\/\S*)/g, // Facebook links
        /(https?:\/\/www.universal-robots.com\/S*)/g
    ];

    // Split the message into parts based on the regular expressions
    const parts = splitMessageByRegexes(message, linkRegexes);

    // Iterate through the parts
    parts.forEach((part, index) => {
        // Replace newline characters with <br> tags
        if (part.includes('\n')) {
            const lines = part.split('\n');
            lines.forEach((line, lineIndex) => {
                botMessageTextContainer.appendChild(document.createTextNode(line));
                if (lineIndex < lines.length - 1) {
                    botMessageTextContainer.appendChild(document.createElement('br'));
                }
            });
        } else {
            part = part.replace(/[\)\,:]$/, '');

            if (isLink(part)) {
                // If the part is a link, create a link element
                var linkElement = document.createElement('a');
                linkElement.href = part;
                linkElement.target = '_blank';
                linkElement.textContent = part;
                botMessageTextContainer.appendChild(linkElement);
            } else {
                // If the part is not a link, create a text node
                botMessageTextContainer.appendChild(document.createTextNode(part));
            }
        }

        // Add a line break between parts
        if (index < parts.length - 1) {
            botMessageTextContainer.appendChild(document.createElement('br'));
        }
    });

    messageContent.appendChild(botProfilePicture);
    messageContent.appendChild(botMessageName);
    messageContent.appendChild(botMessageTextContainer);

    botMessageElement.appendChild(messageContent);

    return botMessageElement;
}


// Function to split the message into parts based on multiple regular expressions
function splitMessageByRegexes(message, regexes) {
    let parts = [message];
    regexes.forEach(regex => {
        parts = parts.flatMap(part => part.split(regex));
    });
    return parts.filter(part => part !== '');
}

// Function to check if a string is a link
function isLink(str) {
    return /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(str);
}