import req from 'express/lib/request';
import pool from '../helperfunctions/pool.js';
import dynamicSort from '../helperfunctions/sorting.js';
import checkDueDate from '../helperfunctions/checkOverdue.js';

class TaskController {
  constructor(db) {
    this.db = db;
    this.pool = pool;
  }

  async getPendingCompletedTasks(request, response) {
    try {
      const { navbar, userId } = request;
      const { pendingSortBy } = request.query;
      const { completedSortBy } = request.query;

      const completed = await this.pool.query(`SELECT tasks.id, tasks.name, tasks.due_date, tasks.accepted, tasks.status, tasks.created_by, proj_tasks.proj_id, proj_tasks.task_id, user_tasks.user_id, user_tasks.task_id, users.name AS username  FROM tasks INNER JOIN proj_tasks ON proj_tasks.task_id = tasks.id INNER JOIN user_tasks on user_tasks.task_id = tasks.id INNER JOIN users ON tasks.created_by = users.id WHERE user_tasks.user_id = ${userId} AND tasks.status='completed' AND tasks.accepted='accepted'`);

      const pending = await this.pool.query(`SELECT tasks.id, tasks.name, tasks.due_date, tasks.accepted, tasks.status, tasks.created_by, proj_tasks.proj_id, proj_tasks.task_id, user_tasks.user_id, user_tasks.task_id, users.name AS username  FROM tasks INNER JOIN proj_tasks ON proj_tasks.task_id = tasks.id INNER JOIN user_tasks on user_tasks.task_id = tasks.id INNER JOIN users ON tasks.created_by = users.id WHERE user_tasks.user_id = ${userId} AND tasks.status='pending' AND tasks.accepted='accepted'`);

      const unsortedcompletedTasks = completed.rows;
      const unsortedpendingTasks = pending.rows;
      const checkpendingTasks = dynamicSort(pendingSortBy, unsortedpendingTasks);
      const pendingTasks = checkDueDate(checkpendingTasks);
      const completedTasks = dynamicSort(completedSortBy, unsortedcompletedTasks);
      response.render('tasks', { completedTasks, pendingTasks, navbar });
    } catch (err) {
      console.error(err);
    }
  }

  async changeTaskStatus(request, response) {
    try {
      const { projId, taskId, taskStatus } = request.query;

      const updateTasks = await this.pool.query(`UPDATE tasks SET status='${taskStatus}' WHERE id=${taskId}`);
      const tasks = await this.pool.query(`SELECT * FROM proj_tasks WHERE proj_id=${projId}`);
      const completed = await this.pool.query(`SELECT * FROM tasks INNER JOIN proj_tasks ON proj_tasks.task_id = tasks.id WHERE proj_tasks.proj_id = ${projId} AND tasks.status = 'completed'`);
      const totalTasks = tasks.rows.length;
      const completedTasks = completed.rows.length;

      let progress = 0;
      if (completedTasks === 0) {
        progress = 0;
      } else {
        progress = Math.floor((completedTasks / totalTasks) * 100);
      }

      let progressStatus = '';
      if (progress === 100) {
        progressStatus = 'completed';
      } else {
        progressStatus = 'pending';
      }

      const updateProj = await this.pool.query(`UPDATE proj SET progress = ${progress}, status='${progressStatus}'  WHERE id=${projId}`);
      if (request.path === '/tasks/all/completed') {
        response.redirect('/tasks/all');
      } else {
        response.redirect(`/projects/${projId}`);
      }
    } catch (err) {
      console.error(err);
    }
  }
}

export default TaskController;
