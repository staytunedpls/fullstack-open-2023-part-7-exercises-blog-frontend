import { useQuery } from '@tanstack/react-query';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import userService from '../services/users';

function UserList() {
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
  return (
    <div>
      <h2>Users</h2>
      <Table size="sm">
        <thead>
          <tr>
            <th>Author</th>
            <th>Blogs created</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>
                <Link to={`/users/${user.id}`}>{user.name}</Link>
              </td>
              <td>{user.blogs.length}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default UserList;
