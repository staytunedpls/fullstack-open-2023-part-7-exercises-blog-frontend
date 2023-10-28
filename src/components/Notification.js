import PropTypes from 'prop-types';

function Notification({ message, type }) {
  const notificationClass = `notification ${type}`;
  if (message === null) {
    return null;
  }
  return <div className={notificationClass}>{message}</div>;
}

Notification.defaultProps = {
  message: null,
};

Notification.propTypes = {
  message: PropTypes.string,
  type: PropTypes.string.isRequired,
};

export default Notification;
