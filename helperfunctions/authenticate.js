import getHash from './hashsession.js';

const authenticate = (request, response, next) => {
  const { userId } = request.cookies;

  const { hashedSession } = request.cookies;

  if (userId && hashedSession) {
    const hashedID = getHash(userId);

    if (hashedID === hashedSession) {
      request.userId = Number(userId);
      next();
    } else {
      console.log('authentication failed');
      response.redirect('/');
    }
  } else {
    response.redirect('/');
  }
};

export default authenticate;
