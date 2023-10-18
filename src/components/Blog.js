import { useState } from 'react';
import PropTypes from 'prop-types';

function Blog({ blog, removeBlog, likeBlog, loggedUser }) {
  const [detailsVisible, setDetailsVisibility] = useState(false);

  const toggleDetailsVisibility = () => {
    setDetailsVisibility(!detailsVisible);
  };
  const blogStyle = { border: '1px solid', margin: '10px', padding: '5px' };
  const detailsStyle = { display: detailsVisible ? '' : 'none' };
  const removeButtonStyle = {
    backgroundColor: '#ff9999',
    display: blog.user.id === loggedUser.id ? '' : 'none',
  };

  return (
    <div className="blog" style={blogStyle}>
      <span className="blog-header">
        &quot;{blog.title}&quot; {blog.author}&nbsp;
      </span>
      <button type="button" onClick={toggleDetailsVisibility}>
        {detailsVisible ? 'hide' : 'view'}
      </button>
      <div className="blog-details" style={detailsStyle}>
        url: {blog.url}
        <br />
        likes: {blog.likes}{' '}
        <button type="button" onClick={() => likeBlog(blog.id)}>
          like
        </button>
        <br />
        creator: {blog.user.username}
        <br />
        <button
          type="button"
          style={removeButtonStyle}
          onClick={() => removeBlog(blog)}
        >
          remove
        </button>
      </div>
    </div>
  );
}

Blog.propTypes = {
  blog: PropTypes.shape({
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
    }),
    title: PropTypes.string,
    author: PropTypes.string,
    url: PropTypes.string,
    likes: PropTypes.number,
    id: PropTypes.string.isRequired,
  }).isRequired,
  removeBlog: PropTypes.func.isRequired,
  likeBlog: PropTypes.func.isRequired,
  loggedUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
};

export default Blog;
