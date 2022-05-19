import getHash from '../helperfunctions/hashsession.js';
import { validateForm } from '../helperfunctions/formvalidation.js';

class SignupController {
  constructor(pool) {
    this.pool = pool;
  }

  getSignupForm = async (request, response) => {
    try {
      await this.pool.query('SELECT * FROM users');
      const validate = validateForm('', '', 'Enter valid password', 'Enter valid email');
      response.render('signup', validate);
    } catch (error) {
      console.log(error);
    }
  }

  signupUser = async (request, response) => {
    try {
      const user = { ...request.body };
      const checkEmail = await this.pool.query(`SELECT * FROM users WHERE email='${user.email}'`);

      if (checkEmail.rows.length > 0) {
        throw new Error('registered email');
      }

      const hashedPassword = getHash(user.password);
      const values = [user.name, user.email, hashedPassword];
      await this.pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id', values);
      response.redirect('/');
    } catch (error) {
      if (error.message === 'registered email') {
        const validate = validateForm('is-invalid', '', 'Enter valid password', 'Email has already been registered');
        response.render('signup', validate);
      }
    }
  }
}

export default SignupController;
