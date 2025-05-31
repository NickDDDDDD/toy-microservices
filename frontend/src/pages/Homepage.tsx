import { connectStomp, subscribeToTopic, sendMessage } from "../stompClient";
import React, { useEffect, useState } from "react";

const Homepage = () => {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    connectStomp();
  }, []);

  const handleSubscribe = () => {
    if (topic) {
      subscribeToTopic(topic, (msg) => {
        console.log("Received message:", msg.body);
        setMessages((prevMessages) => [...prevMessages, msg.body]);
      });
    } else {
      console.warn("⚠️ Topic cannot be empty");
    }
  };

  const handleSendMessage = () => {
    if (topic && message) {
      sendMessage(topic, message);
      setMessages((prevMessages) => [...prevMessages, message]);
      console.log("Message sent:", message);
    } else {
      console.warn("⚠️ Topic and message cannot be empty");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "topic") {
      setTopic(value);
    } else if (name === "message") {
      setMessage(value);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-4 bg-neutral-900 text-2xl text-neutral-100">
      <div>
        <h2> current topic</h2>
        <p>{topic}</p>
      </div>
      <div>
        <label>
          subscribe to topic:
          <input
            type="text"
            name="topic"
            className="bg-neutral-100 text-black"
            onChange={handleInputChange}
          />
        </label>
        <button className="bg" onClick={handleSubscribe}>
          subscribe
        </button>
      </div>

      <div>
        <label>
          message:
          <input
            type="text"
            name="message"
            className="bg-neutral-100 text-black"
            onChange={handleInputChange}
          />
        </label>
        <button onClick={handleSendMessage}>send</button>
      </div>
      <div>
        <h2>messages</h2>
        <p>{messages}</p>
      </div>
    </div>
  );
};

export default Homepage;
