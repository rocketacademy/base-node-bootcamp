import pool from './pool.js';

const getDetails = (request, response, next) => {
  const { userId } = request;
  pool.query(`SELECT * FROM users WHERE id=${userId}`).then((results) => {
    const { name } = results.rows[0];
    const { photo } = results.rows[0];
    const navbar = {
      photo,
      name,
    };
    request.navbar = navbar;
    next();
  });
};

export default getDetails;
