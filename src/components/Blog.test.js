import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Blog from './Blog';

test('blog renders title and author, but not url or number of likes by default', () => {
  const blog = {
    title: 'test blog title',
    author: 'test blog author',
    url: 'test blog url',
    likes: 1000,
    user: { id: 'userid', username: 'user' },
    id: 'blogid',
  };
  const loggedUser = { id: 'userid' };
  const { container } = render(
    <Blog
      blog={blog}
      removeBlog={() => {}}
      likeBlog={() => {}}
      loggedUser={loggedUser}
    />
  );
  const header = container.querySelector('.blog-header');
  expect(header).toBeVisible();

  const details = container.querySelector('.blog-details');
  expect(details).not.toBeVisible();

  const detailsThroughUrl = screen.getByText('test blog url', { exact: false });
  expect(detailsThroughUrl).not.toBeVisible();

  const detailsThroughLikes = screen.getByText('1000', { exact: false });
  expect(detailsThroughLikes).not.toBeVisible();
});

test('url and likes shown when the "show" button is clicked', async () => {
  const blog = {
    title: 'test blog title',
    author: 'test blog author',
    url: 'test blog url',
    likes: 1000,
    user: { id: 'userid', username: 'user' },
    id: 'blogid',
  };
  const loggedUser = { id: 'userid' };

  const { container } = render(
    <Blog
      blog={blog}
      removeBlog={() => {}}
      likeBlog={() => {}}
      loggedUser={loggedUser}
    />
  );

  const showButton = screen.getByText('view');
  expect(showButton).not.toBeNull();
  await userEvent.click(showButton);
  const details = container.querySelector('.blog-details');
  expect(details).toBeVisible();

  const detailsThroughUrl = screen.getByText('test blog url', { exact: false });
  expect(detailsThroughUrl).toBeVisible();

  const detailsThroughLikes = screen.getByText('1000', { exact: false });
  expect(detailsThroughLikes).toBeVisible();
});

test('two likes - two events', async () => {
  const blog = {
    title: 'test blog title',
    author: 'test blog author',
    url: 'test blog url',
    likes: 1000,
    user: { id: 'userid', username: 'user' },
    id: 'blogid',
  };
  const loggedUser = { id: 'userid' };

  const mockHandler = jest.fn();
  render(
    <Blog
      blog={blog}
      removeBlog={() => {}}
      likeBlog={mockHandler}
      loggedUser={loggedUser}
    />
  );

  const showButton = screen.getByText('view');
  await userEvent.click(showButton);

  const likeButton = screen.getByText('like');
  await userEvent.click(likeButton);
  await userEvent.click(likeButton);
  expect(mockHandler.mock.calls).toHaveLength(2);
});
