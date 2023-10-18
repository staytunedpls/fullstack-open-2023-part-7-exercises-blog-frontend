import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BlogForm from './BlogForm';

test('blog form manages user input well', async () => {
  const blog = {
    title: 'test blog title',
    author: 'test blog author',
    url: 'test blog url',
  };
  const user = userEvent.setup();
  const mockHandler = jest.fn();
  render(<BlogForm createBlog={mockHandler} />);

  const inputFields = screen.getAllByRole('textbox');
  const titleInput = inputFields.find(field => field.name === 'title');
  const authorInput = inputFields.find(field => field.name === 'author');
  const urlInput = inputFields.find(field => field.name === 'url');
  const submitButton = screen.getByText('create');

  await user.type(titleInput, blog.title);
  await user.type(authorInput, blog.author);
  await user.type(urlInput, blog.url);

  await user.click(submitButton);
  const createBlogArgument = mockHandler.mock.calls[0][0];

  expect(createBlogArgument.title).toBe(blog.title);
  expect(createBlogArgument.author).toBe(blog.author);
  expect(createBlogArgument.url).toBe(blog.url);
});
