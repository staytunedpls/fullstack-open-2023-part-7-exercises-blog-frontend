import './index.css';
import PropTypes from 'prop-types';

import { useState, useEffect, useRef } from 'react';
import Blog from './components/Blog';
import BlogForm from './components/BlogForm';
import Togglable from './components/Togglable';
import blogService from './services/blogs';
import loginService from './services/login';

function Notification({ message, type }) {
  const notificationClass = `notification ${type}`;
  if (message === null) {
    return null;
  }
  return <div className={notificationClass}>{message}</div>;
}

Notification.defaultProps = {
  message: null,
};

Notification.propTypes = {
  message: PropTypes.string,
  type: PropTypes.string.isRequired,
};

function App() {
  const [blogs, setBlogs] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  const [notificationMessage, setNotificationMessage] = useState(null);
  const [notificationType, setNotificationType] = useState('');

  const newBlogRef = useRef();

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedUser');
    if (loggedUserJSON) {
      const loggedUser = JSON.parse(loggedUserJSON);
      setUser(loggedUser);
      blogService.setToken(loggedUser.token);
    }
    blogService.getAll().then(returnedBlogs => setBlogs(returnedBlogs));
  }, []);

  const handleLogin = async event => {
    event.preventDefault();
    try {
      const loggingUser = await loginService.login({
        username,
        password,
      });
      window.localStorage.setItem('loggedUser', JSON.stringify(loggingUser));
      setUser(loggingUser);
      blogService.setToken(loggingUser.token);
      setUsername('');
      setPassword('');

      setNotificationMessage(`Successful log in by ${loggingUser.username}`);
      setNotificationType('success');
      setTimeout(() => setNotificationMessage(null), 5000);
    } catch (exception) {
      setNotificationMessage('Invalid credentials');
      setNotificationType('error');
      setTimeout(() => setNotificationMessage(null), 5000);
    }
  };

  const addBlog = async newBlog => {
    newBlogRef.current.toggleVisibility();

    try {
      const returnedBlog = await blogService.add(newBlog);
      setBlogs(blogs.concat(returnedBlog));

      setNotificationMessage(
        `a new blog ${returnedBlog.title} by ${newBlog.author} added`
      );
      setNotificationType('success');
      setTimeout(() => setNotificationMessage(null), 5000);
    } catch (error) {
      setNotificationMessage(
        `Could not add new blog, got error: ${error.message}`
      );
      setNotificationType('error');
      setTimeout(() => setNotificationMessage(null), 5000);
    }
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem('loggedUser');
  };

  const loginForm = () => (
    <div>
      <h2>Log in to application</h2>
      <form onSubmit={handleLogin}>
        <div>
          username
          <input
            id="username"
            type="text"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            id="password"
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button id="login-btn" type="submit">
          login
        </button>
      </form>
    </div>
  );

  const removeBlog = async blog => {
    // eslint-disable-next-line no-alert
    if (window.confirm(`Remove blog "${blog.title}" by ${blog.author}?`)) {
      await blogService.deleteEntry(blog.id);
      setBlogs(blogs.filter(blogElement => blogElement.id !== blog.id));
    }
  };

  const likeBlog = async id => {
    const blog = blogs.find(b => b.id === id);
    const newBlog = { ...blog, likes: blog.likes + 1 };
    const returnedBlog = await blogService.update(blog.id, newBlog);
    setBlogs(
      blogs.map(blogElement =>
        blogElement.id !== id ? blogElement : returnedBlog
      )
    );
  };

  const blogList = () => (
    <div>
      <h2>Blogs</h2>
      <p>
        {user.username} logged in
        <button type="button" onClick={logout}>
          logout
        </button>
      </p>
      {blogs.map(blog => (
        <Blog
          key={blog.id}
          blog={blog}
          removeBlog={removeBlog}
          likeBlog={likeBlog}
          loggedUser={user}
        />
      ))}
    </div>
  );

  if (user === null) {
    return (
      <div>
        <Notification message={notificationMessage} type={notificationType} />
        {loginForm()}
      </div>
    );
  }
  return (
    <div>
      <Notification message={notificationMessage} type={notificationType} />
      {blogList()}
      <Togglable buttonLabel="new blog" ref={newBlogRef}>
        <BlogForm createBlog={addBlog} />
      </Togglable>
    </div>
  );
}

export default App;
