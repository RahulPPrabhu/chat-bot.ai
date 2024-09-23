"use client";

import React, { useState, useRef, useEffect } from 'react';

const ChatBot = () => {
  const [messages, setMessages] = useState<{ sender: string; content: string }[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (inputMessage.trim() === '') return;

    setMessages([...messages, { sender: 'user', content: inputMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/chat-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userMessage: inputMessage }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prevMessages) => [...prevMessages, { sender: 'bot', content: data.botResponse }]);
      } else {
        setMessages((prevMessages) => [...prevMessages, { sender: 'bot', content: 'Error: Failed to get response.' }]);
      }
    } catch (error) {
      setMessages((prevMessages) => [...prevMessages, { sender: 'bot', content: 'Error: Unable to connect to the API.' }]);
    } finally {
      setInputMessage('');
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="card shadow-lg" style={{ width: '100%', maxWidth: '700px' }}>
        <div className="card-header bg-primary text-white py-3">
          <h5 className="mb-0">
            <i className="bi bi-robot me-2"></i>AI ChatBot
          </h5>
        </div>
        <div className="card-body d-flex flex-column" style={{ height: '70vh' }}>
          <div className="chat-box flex-grow-1 overflow-auto mb-3">
            {messages.map((msg, index) => (
              <div key={index} className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'} mb-3`}>
                <div
                  className={`d-inline-block p-3 rounded-3 ${
                    msg.sender === 'user' ? 'bg-primary text-white' : 'bg-light text-dark'
                  }`}
                  style={{ maxWidth: '75%', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="d-flex justify-content-start mb-3">
                <div className="bg-light p-3 rounded-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="mt-auto">
            <div className="input-group">
              <input
                type="text"
                className="form-control border-0 bg-light"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button className="btn btn-primary" type="button" onClick={sendMessage} disabled={isLoading}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;