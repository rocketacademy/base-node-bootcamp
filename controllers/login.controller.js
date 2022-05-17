import pool from '../helperfunctions/pool.js';
import getHash from '../helperfunctions/hashsession.js';
import { validateForm } from '../helperfunctions/formvalidation.js';

class LoginController {
  constructor(db) {
    this.db = db;
    this.pool = pool;
  }

  async getLogin(request, response) {
    try {
      await this.pool.query('SELECT * FROM users');
      const validate = validateForm('', '', 'Enter valid password', 'Enter valid email');
      response.render('login', validate);
    } catch (error) {
      console.log(error);
    }
  }

  async loginUser(request, response) {
    try {
      const user = { ...request.body };
      const checkEmail = await this.pool.query(`SELECT * FROM users WHERE email='${user.email}'`);

      if (checkEmail.rows.length === 0) {
        throw new Error('email does not exist');
      }

      const storedUser = checkEmail.rows[0];
      // check if password is correct
      const hashedUserPassword = getHash(user.password);

      if (storedUser.password !== hashedUserPassword) {
        throw new Error('incorrect password');
      } else {
        response.cookie('username', storedUser.name);
        response.cookie('userId', storedUser.id);
        response.cookie('hashedSession', getHash(storedUser.id));
        response.redirect('/projects');
      }
    } catch (error) {
      let validate;
      if (error.message === 'email does not exist') {
        validate = validateForm('is-invalid', '', 'Enter valid password', 'Email does not exists! Please sign up');
      } else if (error.message === 'incorrect password') {
        validate = validateForm('is-valid', 'is-invalid', 'Wrong Password', '');
      }
      response.render('login', validate);
    }
  }

  async logoutUser(request, response) {
    try {
      const user = await this.pool.query('SELECT * FROM users');
      response.clearCookie('username');
      response.clearCookie('userId');
      response.clearCookie('hashedSession');
      response.redirect('/');
    } catch (error) {
      console.log(error);
    }
  }
}

export default LoginController;
