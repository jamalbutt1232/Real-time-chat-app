import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import DOMPurify from "dompurify";
import "./App.css";
import Message from "./Message";

const ENDPOINT = "http://127.0.0.1:4000";
const options = {
  "reconnection attempts": 5,
  "reconnection delay": 3000,
};

const socket = socketIOClient(ENDPOINT, options);

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [name, setName] = useState("");
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isAttemptingReconnect, setIsAttemptingReconnect] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
      setIsAttemptingReconnect(false);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    socket.on("message", (message) => {
      setMessages((msgs) => [...msgs, message]);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection Error:", error);
      setIsConnected(false);
      setIsAttemptingReconnect(true);
    });

    socket.on("reconnect_failed", () => {
      console.error("Reconnect failed");
      setIsAttemptingReconnect(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
      socket.off("connect_error");
      socket.off("reconnect_failed");
    };
  }, []);

  const sendMessage = () => {
    if (name.trim() && input.trim()) {
      const sanitizedInput = DOMPurify.sanitize(input);
      const messageToSend = { user: name, text: sanitizedInput };
      socket.emit("message", messageToSend);
      setInput("");
    }
  };

  return (
    <div className="chat-app">
      <div className="chat-container">
        {!isConnected && isAttemptingReconnect && (
          <div className="status">
            Disconnected. Attempting to reconnect again...
          </div>
        )}
        {!isConnected && !isAttemptingReconnect && (
          <div className="status">Disconnected. Please refresh.</div>
        )}
        <div className="name-input">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            className="input-field"
          />
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <Message key={index} msg={msg} />
          ))}
        </div>
        <div className="message-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="input-field"
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            className={`send-button ${!isConnected ? "disconnected" : ""}`}
            disabled={!isConnected}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
