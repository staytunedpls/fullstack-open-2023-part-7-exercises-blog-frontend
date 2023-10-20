import './index.css';
import PropTypes from 'prop-types';

import React, { useState, useEffect, useRef, useReducer } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Blog from './components/Blog';
import BlogForm from './components/BlogForm';
import Togglable from './components/Togglable';
import blogService from './services/blogs';
import loginService from './services/login';

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'clear':
      return { notificationClass: '', message: null };
    default:
      return {
        notificationClass: action.type,
        message: action.payload.message,
      };
  }
};

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedUser');
    if (loggedUserJSON) {
      const loggedUser = JSON.parse(loggedUserJSON);
      setUser(loggedUser);
      blogService.setToken(loggedUser.token);
    }
  }, []);

  const [notification, dispatchNotification] = useReducer(notificationReducer, {
    notificationClass: '',
    message: null,
  });

  const queryClient = useQueryClient();
  const newBlogMutation = useMutation({
    mutationFn: newBlog => blogService.add(newBlog),
    onSuccess: newBlog => {
      const blogs = queryClient.getQueryData(['blogs']);
      queryClient.setQueryData(['blogs'], blogs.concat(newBlog));
    },
  });
  const updateBlogMutation = useMutation({
    mutationFn: ({ id, updatedBlog }) => blogService.update(id, updatedBlog),
    onSuccess: updatedBlog => {
      const blogs = queryClient.getQueryData(['blogs']);
      queryClient.setQueryData(
        ['blogs'],
        blogs.map(blog => (blog.id === updatedBlog.id ? updatedBlog : blog))
      );
    },
  });
  const removeBlogMutation = useMutation({
    mutationFn: id => blogService.deleteEntry(id),
    onSuccess: () => queryClient.invalidateQueries('blogs'),
  });

  const newBlogRef = useRef();

  const queryResult = useQuery({
    queryKey: ['blogs'],
    queryFn: () => blogService.getAll(),
  });
  if (queryResult.isLoading) {
    return <div>Loading...</div>;
  }
  if (queryResult.isError) {
    return <div>ERROR!</div>;
  }
  const blogs = queryResult.data;

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

      dispatchNotification({
        type: 'success',
        payload: { message: `Successful log in by ${loggingUser.username}` },
      });
      setTimeout(() => dispatchNotification({ type: 'clear' }), 5000);
    } catch (exception) {
      dispatchNotification({
        type: 'error',
        payload: { message: 'Invalid credentials' },
      });
      setTimeout(() => dispatchNotification({ type: 'clear' }), 5000);
    }
  };

  const addBlog = newBlog => {
    newBlogRef.current.toggleVisibility();
    newBlogMutation.mutate(newBlog);
    dispatchNotification({
      type: 'success',
      payload: {
        message: `a new blog ${newBlog.title} by ${newBlog.author} added`,
      },
    });
    setTimeout(() => dispatchNotification({ type: 'clear' }), 5000);

    // } catch (error) {
    //   dispatchNotification({
    //     type: 'error',
    //     payload: {
    //       message: `Could not add new blog, got error: ${error.message}`,
    //     },
    //   });
    //   setTimeout(() => dispatchNotification({ type: 'clear' }), 5000);
    // }
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
      removeBlogMutation.mutate(blog.id);
    }
  };

  const likeBlog = id => {
    const blog = blogs.find(b => b.id === id);
    const updatedBlog = { ...blog, likes: blog.likes + 1 };
    updateBlogMutation.mutate({ id, updatedBlog });
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
        <Notification
          message={notification.message}
          type={notification.notificationClass}
        />
        {loginForm()}
      </div>
    );
  }
  return (
    <div>
      <Notification
        message={notification.message}
        type={notification.notificationClass}
      />
      {blogList()}
      <Togglable buttonLabel="new blog" ref={newBlogRef}>
        <BlogForm createBlog={addBlog} />
      </Togglable>
    </div>
  );
}

export default App;
