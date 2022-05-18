import { Router } from 'express';

import authenticate from '../helperfunctions/authenticate.js';
import getDetails from '../helperfunctions/userdetails.js';
import pool from '../helperfunctions/pool.js';

import ProjectController from '../controllers/allprojects.controller.js';

const router = Router();
const prefix = '/projects';

const projectController = new ProjectController(pool);

router.get(`${prefix}`, authenticate, getDetails, projectController.getUserProjects);
router.get(`${prefix}/add`, authenticate, getDetails, projectController.addProjectForm);
router.post(`${prefix}/add`, authenticate, getDetails, projectController.addProject);
router.get(`${prefix}/:id`, authenticate, getDetails, projectController.getOneUserProject);
router.get(`${prefix}/:id/edit`, authenticate, getDetails, projectController.editProjectForm);
router.put(`${prefix}/:id/edit`, authenticate, getDetails, projectController.editProject);
router.delete(`${prefix}/:id`, authenticate, getDetails, projectController.deleteProject);

export default router;
