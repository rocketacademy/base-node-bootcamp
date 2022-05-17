import { Router } from 'express';
import authenticate from '../helperfunctions/authenticate.js';
import getDetails from '../helperfunctions/userdetails.js';
import pool from '../helperfunctions/pool.js';

import TaskController from '../controllers/task.controller.js';

const router = Router();
const prefix = '/task';

const itemController = new TaskController(pool);

router.get(`${prefix}s/completed`, authenticate, itemController.changeTaskStatus);
router.get(`${prefix}s/all`, authenticate, getDetails, itemController.getAllTasks);
router.get(`${prefix}s/all/completed`, authenticate, itemController.changeTaskStatus);
router.get(`${prefix}/:id/accept`, authenticate, getDetails, itemController.getAcceptTaskForm);
router.post(`${prefix}/:id/accept`, authenticate, itemController.acceptTask);
router.get(`${prefix}/:id/resend`, authenticate, getDetails, itemController.resendTaskForm);
router.put(`${prefix}/:id/resend`, authenticate, getDetails, itemController.resendTask);

export default router;
