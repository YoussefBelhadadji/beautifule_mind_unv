// Chatbot Toggle Functionality
$(document).ready(function() {
    const chatbotButton = $('#chatbot-button');
    const chatbotWindow = $('#chatbot-window');
    const closeButton = $('.close-chatbot');
    const chatInput = $('.chatbot-input input[type="text"]');
    const sendMessageButton = $('.chatbot-input button');
    const chatbotMessages = $('.chatbot-messages');

    // Toggle chatbot window visibility
    chatbotButton.on('click', function() {
        chatbotWindow.toggleClass('open');
        if (chatbotWindow.hasClass('open')) {
            chatbotMessages.scrollTop(chatbotMessages[0].scrollHeight); // Scroll to bottom on open
        }
    });

    closeButton.on('click', function() {
        chatbotWindow.removeClass('open');
    });

    // Function to append messages to the chat window
    function appendMessage(sender, message) {
        const messageClass = sender === 'user' ? 'user' : 'ai';
        const messageBubble = `<div class="message-bubble ${messageClass}">${message}</div>`;
        chatbotMessages.append(messageBubble);
        chatbotMessages.scrollTop(chatbotMessages[0].scrollHeight); // Scroll to the latest message
    }

    // Function to send message to backend
    async function sendMessage() {
        const message = chatInput.val().trim();
        if (message === '') return;

        appendMessage('user', message);
        chatInput.val(''); // Clear input

        try {
            const response = await fetch('http://localhost:3001/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message, sessionId: 'user-session-123' }), // Use a dynamic session ID if needed
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            appendMessage('ai', data.response);
        } catch (error) {
            console.error('Error sending message:', error);
            appendMessage('ai', 'عذرًا، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى لاحقًا.');
        }
    }

    // Send message on button click or Enter key press
    sendMessageButton.on('click', sendMessage);
    chatInput.on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            sendMessage();
        }
    });

    // Initial welcome message (optional)
    // appendMessage('ai', 'مرحبًا بك! كيف يمكنني مساعدتك اليوم؟');
});
// Connect to your chatbot backend
// Add animations and event handlers