const loginReducer = (state, action) => {
  switch (action.type) {
    case 'login':
      return action.payload.user;
    case 'logout':
      return null;
    default:
      return null;
  }
};

export default loginReducer;
