document.addEventListener("DOMContentLoaded", () => {
  const blogPosts = document.getElementById("blog-posts");
  const writeForm = document.getElementById("write-blog");

  if (blogPosts) {
    // Home page
    displayBlogPosts();
  } else if (writeForm) {
    // Write page
    const postButton = document.getElementById("post-button");
    postButton.addEventListener("click", postBlog);
  }
});

function displayBlogPosts() {
  const posts = JSON.parse(localStorage.getItem("blogPosts")) || [];
  const blogPosts = document.getElementById("blog-posts");

  blogPosts.innerHTML = "";

  posts.forEach((post) => {
    const postElement = document.createElement("article");
    postElement.classList.add("blog-post");
    postElement.innerHTML = `
            <h2>${post.title}</h2>
            <div class="post-date">${new Date(
              post.timestamp
            ).toLocaleString()}</div>
            <p>${post.content}</p>
            ${post.media ? renderMedia(post.media) : ""}
        `;
    console.log("Post HTML:", postElement.innerHTML);
    blogPosts.appendChild(postElement);
  });
}

function renderMedia(media) {
  console.log("Media data:", media); // Log the media data
  try {
    const fileType = media.split(";")[0].split("/")[0];
    if (fileType === "data:image") {
      return `<img src="${media}" alt="Blog post image" style="max-width: 100%; height: auto;">`;
    } else if (fileType === "data:video") {
      return `<video controls style="max-width: 100%; height: auto;"><source src="${media}" type="video/mp4"></video>`;
    }
  } catch (error) {
    console.error("Error rendering media:", error);
  }
  return "";
}

function postBlog() {
  const title = document.getElementById("blog-title").value;
  const content = document.getElementById("blog-content").value;
  const mediaFile = document.getElementById("media-upload").files[0];

  if (!title || !content) {
    alert("Please fill in both title and content fields.");
    return;
  }

  const post = {
    title: title,
    content: content,
    timestamp: new Date().toISOString(),
  };

  if (mediaFile) {
    const reader = new FileReader();
    reader.onload = function (event) {
      post.media = event.target.result;
      console.log("Media saved:", post.media.substring(0, 50) + "..."); // Log the first 50 characters of the media data
      savePost(post);
    };
    reader.readAsDataURL(mediaFile);
  } else {
    savePost(post);
  }
}

function savePost(post) {
  const posts = JSON.parse(localStorage.getItem("blogPosts")) || [];
  posts.unshift(post);
  localStorage.setItem("blogPosts", JSON.stringify(posts));

  alert("Blog post published successfully!");
  window.location.href = "index.html";
}
const API_URL = "http://localhost:5000/api";

async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (response.ok) {
    localStorage.setItem("token", data.token);
    return true;
  }
  throw new Error(data.error);
}

async function getPosts() {
  const response = await fetch(`${API_URL}/posts`);
  return response.json();
}

async function createPost(title, content, mediaFile) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);
  if (mediaFile) {
    formData.append("media", mediaFile);
  }

  const response = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to create post");
  }

  return response.json();
}
