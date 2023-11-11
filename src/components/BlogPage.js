import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

function BlogPage({ blogs, likeBlog }) {
  const { id } = useParams();
  const blog = blogs.find(b => b.id === id);
  if (!blog) {
    return <div>ERROR!</div>;
  }
  return (
    <div>
      <h2>{blog.title}</h2>
      {blog.url} <br />
      {blog.likes} likes
      <button type="button" onClick={() => likeBlog(blog.id)}>
        like
      </button>
      <br />
      added by {blog.user.username}
      <br />
      <br />
      <h3>Comments</h3>
      <ul>
        {blog.comments.map(comment => (
          <li>{comment}</li>
        ))}
      </ul>
    </div>
  );
}
BlogPage.defaultProps = {
  blogs: [],
};

BlogPage.propTypes = {
  blogs: PropTypes.arrayOf(
    PropTypes.shape({
      user: PropTypes.shape({
        id: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
      }),
      title: PropTypes.string,
      author: PropTypes.string,
      url: PropTypes.string,
      likes: PropTypes.number,
      id: PropTypes.string.isRequired,
    })
  ),
  likeBlog: PropTypes.func.isRequired,
};

export default BlogPage;
