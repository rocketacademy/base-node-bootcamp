import moment from 'moment';
import pool from '../helperfunctions/pool.js';
import getHash from '../helperfunctions/hashsession.js';
import { validateForm } from '../helperfunctions/formvalidation.js';

class UserController {
  constructor(db) {
    this.db = db;
    this.pool = pool;
  }

  async checkUserLogin(request, response) {
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

  async createUser(request, response) {
    try {
      const user = { ...request.body };
      const checkEmail = await this.pool.query(`SELECT * FROM users WHERE email='${user.email}'`);

      if (checkEmail.rows.length > 0) {
        throw new Error('registered email');
      }

      const hashedPassword = getHash(user.password);
      const values = [user.name, user.email, hashedPassword];
      const insertUser = await this.pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id', values);
      response.redirect('/');
    } catch (error) {
      if (error.message === 'registered email') {
        const validate = validateForm('is-invalid', '', 'Enter valid password', 'Email has already been registered');
        response.render('signup', validate);
      }
    }
  }

  async getUserDetails(request, response) {
    try {
      const { navbar, userId } = request;
      const user = await this.pool.query(`SELECT * FROM users WHERE id=${userId}`);
      response.render('profile', { navbar, user: user.rows[0] });
    } catch (error) {
      console.log(error);
    }
  }

  async uploadUserPhoto(request, response) {
    try {
      const userId = Number(request.params.id);
      const update = await this.pool.query(`UPDATE users SET photo='${request.file.location}' WHERE id=${userId}`);
      response.redirect('/profile');
    } catch (error) {
      console.log(error);
    }
  }

  async editProfile(request, response) {
    try {
      const userId = Number(request.params.id);
      const user = request.body;
      const updateProfile = await this.pool.query(`UPDATE users SET name='${user.name}', email='${user.email}', contact='${user.contact}', role='${user.role}', workplace='${user.workplace}' WHERE id=${userId}`);
      response.redirect('/profile');
    } catch (error) {
      console.log(error);
    }
  }
}

export default UserController;
