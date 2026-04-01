import React, { useState } from "react";
import axios from "axios";
import "./CreatePost.css";

function CreatePost() {

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8080/api/blogs",
        {
          title: title,
          content: content
        }
      );

      if (response.status === 200) {
        setMessage("Blog Created Successfully ✅");
        setTitle("");
        setContent("");
      }

    } catch (error) {
      console.log(error);
      setMessage("Error creating blog ❌");
    }
  };

  return (
    <div className="create-container">

      <h2>Create Blog</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Write your content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>

        <button type="submit">Publish</button>

      </form>

      <p>{message}</p>

    </div>
  );
}

export default CreatePost;