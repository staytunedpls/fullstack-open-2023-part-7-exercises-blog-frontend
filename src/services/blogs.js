import axios from 'axios';

const baseUrl = '/api/blogs';

let token = null;

const setToken = newToken => {
  token = `bearer ${newToken}`;
};

const getAll = async () => {
  const response = await axios.get(baseUrl);
  return response.data.sort((b1, b2) => b2.likes - b1.likes);
};

const add = async newBlog => {
  const response = await axios.post(baseUrl, newBlog, {
    headers: { Authorization: token },
  });
  return response.data;
};

const update = async (id, updatedBlog) => {
  const response = await axios.put(`${baseUrl}/${id}`, updatedBlog);
  return response.data;
};

const deleteEntry = async id => {
  const response = await axios.delete(`${baseUrl}/${id}`, {
    headers: { Authorization: token },
  });
  return response.data;
};

export default { getAll, add, update, deleteEntry, setToken };
