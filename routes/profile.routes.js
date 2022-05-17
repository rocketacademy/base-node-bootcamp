import { Router } from 'express';
import authenticate from '../helperfunctions/authenticate.js';
import getDetails from '../helperfunctions/userdetails.js';
import pool from '../helperfunctions/pool.js';

import ProfileController from '../controllers/profile.controller.js';

const router = Router();
const prefix = '/profile';

const profileController = new ProfileController(pool);

router.get(`${prefix}`, authenticate, getDetails, profileController.getProfile);
router.post(`${prefix}/:id/photo`, authenticate, getDetails, profileController.uploadUserPhoto);
router.put(`${prefix}/:id`, authenticate, getDetails, profileController.editProfile);

export default router;
