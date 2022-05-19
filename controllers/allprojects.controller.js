import moment from 'moment';

import dynamicSort from '../helperfunctions/sorting.js';
import { sliceIntoChunks, sliceForEdit } from '../helperfunctions/subtaskhandler.js';
import { createEmpty } from '../helperfunctions/formvalidation.js';

class ProjectController {
  constructor(pool) {
    this.pool = pool;
  }

  addProjectForm = async (request, response) => {
    try {
      const { navbar, userId } = request;
      const friends = await this.pool.query(`SELECT * FROM users INNER JOIN friends ON users.id = friends.friend_id WHERE friends.user_id=${userId}`);
      response.render('createproject', { navbar, friends: friends.rows });
    } catch (err) {
      console.error(err);
    }
  }

  addProject = async (request, response) => {
    try {
      const { navbar, userId } = request;
      const user = request.body;
      const [name, description, duedate, ...tasks] = Object.values(user);
      const slicedArray = sliceIntoChunks(tasks);
      const validationArray = createEmpty(slicedArray);
      const fomattedDueDate = moment(duedate).format('DD MMM YYYY hh:mm');

      const insertProj = await this.pool.query('INSERT INTO proj (name, description, due_date, status, progress, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id', [name, description, fomattedDueDate, 'pending', 0, userId]);
      const projId = insertProj.rows[0].id;

      // do validation for emails first
      slicedArray.forEach(async (chunk, index) => {
        const [taskName, taskduedate, email] = chunk;
        const formattedTDueDate = moment(taskduedate).format('DD MMM YYYY hh:mm');
        const users = await this.pool.query(`SELECT * FROM users WHERE email='${email}'`);
        // if the email is invalid
        if (users.rows.length === 0) {
          await this.pool.query(`DELETE FROM proj WHERE id=${projId}`);
          validationArray[index] = 'is-invalid';
          const object = { ...user, validation: validationArray };
          response.render('createprojectvalidate', { ...object, navbar });
          throw new Error('email is invalid');
        }
        const receiptId = users.rows[0].id;
        const insertTasks = await this.pool.query('INSERT INTO tasks (name, due_date, accepted, status, created_by) VALUES ( $1, $2, $3, $4, $5) RETURNING id', [taskName, formattedTDueDate, 'no', 'pending', userId]);
        const taskId = insertTasks.rows[0].id;
        console.log('projId', projId);
        await this.pool.query('INSERT INTO user_tasks (user_id, task_id) VALUES ($1, $2)', [receiptId, taskId]);
        await this.pool.query('INSERT INTO proj_tasks (proj_id, task_id) VALUES ($1, $2)', [projId, taskId]);
        await this.pool.query('INSERT INTO messages (send_to, task_id, accept) VALUES ($1, $2, $3)', [receiptId, taskId, 'pending']);
      });
      response.redirect('/projects');
    } catch (err) {
      console.error(err);
    }
  }

  getUserProjects = async (request, response) => {
    try {
      const { navbar, userId } = request;
      const { completedSortBy } = request.query;
      const { pendingSortBy } = request.query;
      const unsortedcompletedProj = await this.pool.query(`SELECT * FROM proj WHERE created_by = ${userId} AND status='pending'`);
      const unsortedpendingProj = await this.pool.query(`SELECT * FROM proj WHERE created_by = ${userId} AND status ='completed'`);
      const pendingProj = dynamicSort(pendingSortBy, unsortedcompletedProj.rows);
      const completedProj = dynamicSort(completedSortBy, unsortedpendingProj.rows);
      response.render('projects', { pendingProj, completedProj, navbar });
    } catch (err) {
      console.error(err);
    }
  }

  editProjectForm = async (request, response) => {
    try {
      const projId = Number(request.params.id);
      const { navbar } = request;
      const getTasks = await this.pool.query(`SELECT tasks.id AS taskid, tasks.name, tasks.due_date, tasks.accepted, tasks.status, tasks.created_by, proj_tasks.proj_id, proj_tasks.task_id, user_tasks.user_id, user_tasks.task_id FROM tasks INNER JOIN proj_tasks ON proj_tasks.task_id = tasks.id INNER JOIN user_tasks ON user_tasks.task_id = tasks.id WHERE proj_tasks. proj_id = ${projId}`);
      const tasks = getTasks.rows;
      const updatedTasks = [];
      tasks.forEach(async (task) => {
        const receiptId = task.user_id;
        const users = await this.pool.query(`SELECT * FROM users WHERE id=${receiptId}`);
        const userEmail = users.rows[0].email;
        task.user_email = userEmail;
        task.formatdate = moment(task.due_date).format('YYYY-MM-DDTHH:MM');
        updatedTasks.push(task);
      });
      const getProj = await this.pool.query(`SELECT * FROM proj WHERE id= ${projId}`);
      const proj = getProj.rows[0];
      proj.formatdate = moment(proj.due_date).format('YYYY-MM-DDTHH:MM');
      response.render('editproject', { proj, tasks: updatedTasks, navbar });
    } catch (err) {
      console.error(err);
    }
  }

  editProject = async (request, response) => {
    try {
      const { userId } = request;
      const user = request.body;
      const projId = request.params.id;
      const [name, description, duedate, ...tasks] = Object.values(user);
      const fomattedDueDate = moment(duedate).format('DD MMM YYYY hh:mm');

      await this.pool.query(`UPDATE proj SET name ='${name}', description='${description}', due_date='${fomattedDueDate}' WHERE id=${projId}`);

      const slicedArray = sliceForEdit(tasks);
      slicedArray.forEach(async (chunk) => {
        const [taskId, taskName, taskduedate, email] = chunk;
        const formattedTDueDate = moment(taskduedate).format('DD MMM YYYY hh:mm');
        const getUsers = await this.pool.query(`SELECT * FROM users WHERE email='${email}'`);
        const receiptId = Number(getUsers.rows[0].id);
        if (taskId === '') {
          const insertTask = await this.pool.query(`INSERT INTO tasks (name, due_date, accepted, status, created_by) VALUES ('${taskName}', '${formattedTDueDate}', 'no', 'pending', ${userId}) RETURNING id`);
          const newTaskId = Number(insertTask.rows[0].id);
          await this.pool.query(`INSERT INTO user_tasks (user_id, task_id) VALUES ('${receiptId}', '${newTaskId}') RETURNING id`);
          await this.pool.query(`INSERT INTO proj_tasks (proj_id, task_id) VALUES (${projId}, ${newTaskId}) RETURNING id`);
          await this.pool.query(`INSERT INTO messages (send_to, task_id, accept) VALUES ('${receiptId}', '${newTaskId}', 'pending') RETURNING id`);
        } else {
          await this.pool.query(`UPDATE tasks SET name ='${taskName}', due_date='${formattedTDueDate}' WHERE id=${taskId}`);
          await this.pool.query(`UPDATE user_tasks SET user_id ='${receiptId}' WHERE id='${taskId}'`);
          await this.pool.query(`UPDATE proj_tasks SET proj_id ='${projId}' WHERE id=${taskId}`);
        }
      });
      response.redirect(`/projects/${projId}`);
    } catch (err) {
      console.error(err);
    }
  }

  deleteProject= async (request, response) => {
    try {
      const projId = Number(request.params.id);
      const projTasks = await this.pool.query(`SELECT * FROM proj_tasks WHERE proj_id = ${projId}`);
      const tasks = projTasks.rows;
      tasks.forEach(async (task) => {
        const taskId = task.id;
        await this.pool.query(`DELETE FROM tasks WHERE id=${taskId}`);
        await this.pool.query(`DELETE FROM user_tasks WHERE task_id=${taskId}`);
        await this.pool.query(`DELETE FROM messages WHERE task_id=${taskId}`);
      });
      await this.pool.query(`DELETE FROM proj WHERE id=${projId}`);
      await this.pool.query(`DELETE FROM proj_tasks WHERE proj_id=${projId}`);
      response.redirect('/projects/');
    } catch (err) {
      console.error(err);
    }
  }

  getOneUserProject = async (request, response) => {
    try {
      const projId = Number(request.params.id);
      const { navbar } = request;
      const proj = await this.pool.query(`SELECT * FROM proj WHERE id= ${projId}`);
      const tasks = await this.pool.query(`SELECT user_tasks.user_id, user_tasks.task_id, proj_tasks.proj_id, proj_tasks.task_id, tasks.id, tasks.name, tasks.due_date, tasks.accepted, tasks.status, tasks.created_by, users.name AS username FROM user_tasks INNER JOIN proj_tasks ON proj_tasks.task_id = user_tasks.task_id INNER JOIN tasks ON user_tasks.task_id = tasks.id INNER JOIN users ON user_tasks.user_id = users.id WHERE proj_id=${projId}`);
      response.render('individualproj', { proj: proj.rows[0], tasks: tasks.rows, navbar });
    } catch (err) {
      console.error(err);
    }
  }
}

export default ProjectController;
