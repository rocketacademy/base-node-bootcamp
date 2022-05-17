import { Router } from 'express';
import authenticate from '../helperfunctions/authenticate.js';
import getDetails from '../helperfunctions/userdetails.js';
import pool from '../helperfunctions/pool.js';

import InboxController from '../controllers/inbox.controller.js';

const router = Router();

const inboxController = new InboxController(pool);

router.get('/inbox', authenticate, getDetails, inboxController.getInbox);

export default router;
