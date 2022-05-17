import moment from 'moment';
import pool from '../helperfunctions/pool.js';
import dynamicSort from '../helperfunctions/sorting.js';
import { sliceIntoChunks } from '../helperfunctions/subtaskhandler.js';
import { createEmpty } from '../helperfunctions/formvalidation.js';

class ProjectController {
  constructor(db) {
    this.db = db;
    this.pool = pool;
  }

  async addProjectForm(request, response) {
    try {
      const { navbar, userId } = request;
      const friends = await this.pool.query(`SELECT * FROM users INNER JOIN friends ON users.id = friends.friend_id WHERE friends.user_id=${userId}`);
      response.render('createproject', { navbar, friends: friends.rows });
    } catch (err) {
      console.error(err);
    }
  }

  async addProject(request, response) {
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

  async getUserProjects(request, response) {
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
}

export default ProjectController;
