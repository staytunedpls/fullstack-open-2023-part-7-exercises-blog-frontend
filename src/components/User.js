import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import userService from '../services/users';

function User() {
  const queryResult = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
  });
  if (queryResult.isLoading) {
    return <div>Loading...</div>;
  }
  if (queryResult.isError) {
    return <div>ERROR!</div>;
  }
  const users = queryResult.data;
  const { id } = useParams();
  const user = users.find(u => u.id === id);
  return (
    <div>
      <h2>{user.name}</h2>
      <p>Added blogs</p>
      <ul>
        {user.blogs.map(blog => (
          <li key={blog.id}>{blog.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default User;
