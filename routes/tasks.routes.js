import { Router } from 'express';

import authenticate from '../helperfunctions/authenticate.js';
import getDetails from '../helperfunctions/userdetails.js';
import pool from '../helperfunctions/pool.js';

import TaskController from '../controllers/task.controller.js';

const router = Router();
const prefix = '/task';

const taskController = new TaskController(pool);

router.get(`${prefix}s/completed`, authenticate, taskController.changeTaskStatus);
router.get(`${prefix}s/all`, authenticate, getDetails, taskController.getAllTasks);
router.get(`${prefix}s/all/completed`, authenticate, taskController.changeTaskStatus);
router.get(`${prefix}/:id/accept`, authenticate, getDetails, taskController.getAcceptTaskForm);
router.post(`${prefix}/:id/accept`, authenticate, taskController.acceptTask);
router.get(`${prefix}/:id/resend`, authenticate, getDetails, taskController.resendTaskForm);
router.put(`${prefix}/:id/resend`, authenticate, getDetails, taskController.resendTask);

export default router;
