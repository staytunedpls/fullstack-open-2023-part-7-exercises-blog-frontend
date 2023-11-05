import './index.css';

import React, { useState, useEffect, useRef, useReducer } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Routes, Route } from 'react-router-dom';
import Blog from './components/Blog';
import BlogForm from './components/BlogForm';
import Togglable from './components/Togglable';
import blogService from './services/blogs';
import loginService from './services/login';
import notificationReducer from './reducers/notificationReducer';
import loginReducer from './reducers/loginReducer';
import Notification from './components/Notification';
import UserList from './components/UserList';
import User from './components/User';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, userDispatch] = useReducer(loginReducer, null);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedUser');
    if (loggedUserJSON) {
      const loggedUser = JSON.parse(loggedUserJSON);
      userDispatch({ type: 'login', payload: { user: loggedUser } });
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
      userDispatch({ type: 'login', payload: { user: loggingUser } });
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
    userDispatch({ type: 'logout' });
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
      <Routes>
        <Route
          path="/"
          element={
            <>
              {blogList()}
              <Togglable buttonLabel="new blog" ref={newBlogRef}>
                <BlogForm createBlog={addBlog} />
              </Togglable>
            </>
          }
        />
        <Route path="/users" element={<UserList />} />
        <Route path="/users/:id" element={<User />} />
      </Routes>
    </div>
  );
}

export default App;
