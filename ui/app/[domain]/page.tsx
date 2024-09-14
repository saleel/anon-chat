"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Message } from "../types";
import { fetchMessages, submitMessage } from "../utils";
import usePromise from "../hooks/use-promise";


export default function ChatPage() {
  const params = useParams();
  const domain = params.domain as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, { isFetching, error, reFetch, fetchedAt }] = usePromise<Message[]>(() => fetchMessages(domain), {
    defaultValue: [],
  });
  const [newMessage, setNewMessage] = useState("");


  useEffect(() => {
    fetchMessages(domain);
  }, [domain]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  async function handleMessageSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newMessage.trim()) {
      const message: Message = {
        timestamp: new Date().toISOString(),
        text: newMessage,
        sender: 123456,
        domain: domain
      };

      try {
        await submitMessage(message);
        reFetch();
        setNewMessage("");
      } catch (error) {
        alert(`Failed to send message: ${error}`);
      }
    }
  }

  function renderMessage(message: Message) {
    return (
      <div key={message.timestamp} className={`message-box ${message.sender}`}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="message-box-sender">{message.sender}</span>
          <span className="message-box-timestamp">
            {new Date(message.timestamp).toLocaleDateString()}{" "}
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        {message.text}
      </div>
    );
  }

  return (
    <div className="messages-container">
      <h1 className="messages-container-title">
        Anonymous messages from members of{" "}
        <span className="messages-container-title-domain">{domain}</span>
      </h1>

      <div className="message-list">
        {isFetching && !fetchedAt && <div className="text-center">Loading...</div>}
        {error && <div>Error: {error.message}</div>}

        {messages.map((message) => renderMessage(message))}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-container" onSubmit={handleMessageSubmit} >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your anonymous message..."
          className="message-input-field"
        />
        <button type="submit" className="message-input-button">
          Submit
        </button>
      </form>
    </div>
  );
}
