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

export default notificationReducer;
