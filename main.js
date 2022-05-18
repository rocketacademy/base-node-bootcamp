/* eslint-disable import/extensions */
import express from 'express';
import methodOverride from 'method-override';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';

import AuthRouter from './routes/authenticate.routes.js';
import ProjectRouter from './routes/project.routes.js';
import ProfileRouter from './routes/profile.routes.js';
import InboxRouter from './routes/inbox.route.js';
import TaskRouter from './routes/tasks.routes.js';
import TeammRouter from './routes/teammates.routes.js';

// CREATING THE APP
const app = express();
const PORT = process.env.PORT || 3004;

// configure env variables
const envFilePath = '.env';
dotenv.config({ path: path.normalize(envFilePath) });

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const routers = [AuthRouter, ProjectRouter, ProfileRouter, InboxRouter, TaskRouter, TeammRouter];
routers.forEach((router) => { app.use('/', router); });

app.listen(PORT);
console.log('app listening to the port');
