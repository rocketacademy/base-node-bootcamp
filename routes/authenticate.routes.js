import { Router } from 'express';
import pool from '../helperfunctions/pool.js';

import LoginController from '../controllers/login.controller.js';
import SignupController from '../controllers/signup.controller.js';

const router = Router();
const prefix = '/signup';

const loginController = new LoginController(pool);
const signupController = new SignupController(pool);

// router.get(`${prefix}`, authenticate, getDetails, authenticateController.getUserProjects);
router.get('/', loginController.getLogin);
router.post('/', loginController.loginUser);
router.post('/logout', loginController.logoutUser);
router.get(`${prefix}`, signupController.getSignupForm);
router.post(`${prefix}`, signupController.signupUser);

export default router;
