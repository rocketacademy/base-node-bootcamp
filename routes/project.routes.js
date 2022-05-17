import { Router } from 'express';
import authenticate from '../helperfunctions/authenticate.js';
import pool from '../helperfunctions/pool.js';

import ProjectController from '../controllers/allprojects.controller.js';

const router = Router();
const prefix = '/projects';

const itemController = new ProjectController(pool);

router.get(`${prefix}`, authenticate, itemController.changeTaskStatus);

export default router;
