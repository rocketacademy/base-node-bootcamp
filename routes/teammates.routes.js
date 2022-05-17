import { Router } from 'express';
import pool from '../helperfunctions/pool.js';

import FriendController from '../controllers/teammates.controller.js';

const router = Router();
const prefix = '/teammates';

const teammatesController = new FriendController(pool);

// router.get(`${prefix}`, authenticate, getDetails, authenticateController.getUserProjects);
router.get(`${prefix}`, teammatesController.getAllTeammates);
router.post(`${prefix}/add`, teammatesController.addTeammate);
router.post(`${prefix}/:id`, teammatesController.deleteTeammates);

export default router;
