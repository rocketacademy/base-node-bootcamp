import dynamicSort from '../helperfunctions/sorting.js';
import checkDueDate from '../helperfunctions/checkOverdue.js';

class TaskController {
  constructor(pool) {
    this.pool = pool;
  }

  getAllTasks = async (request, response) => {
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

  changeTaskStatus = async (request, response) => {
    try {
      const { projId, taskId, taskStatus } = request.query;

      await this.pool.query(`UPDATE tasks SET status='${taskStatus}' WHERE id=${taskId}`);
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

      await this.pool.query(`UPDATE proj SET progress = ${progress}, status='${progressStatus}'  WHERE id=${projId}`);
      if (request.path === '/tasks/all/completed') {
        response.redirect('/tasks/all');
      } else {
        response.redirect(`/projects/${projId}`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  getAcceptTaskForm = async (request, response) => {
    try {
      const { id } = request.params;
      const { navbar } = request;
      const accepttasks = await this.pool.query(`SELECT tasks.name, tasks.id AS taskid, tasks.due_date, tasks.accepted, tasks.status, tasks.created_by, users.name AS username, users.id, users.email, messages.id AS messagesId, messages.accept, messages.task_id, messages.send_to FROM tasks INNER JOIN messages ON messages.task_id = tasks.id INNER JOIN users ON tasks.created_by= users.id WHERE messages.id= ${id}`);
      response.render('accepttasks', { task: accepttasks.rows[0], navbar });
    } catch (err) {
      console.error(err);
    }
  }

  acceptTask = async (request, response) => {
    try {
      const messageId = Number(request.params.id);
      const { accept } = request.body;
      const messages = await this.pool.query(`SELECT * FROM messages WHERE id=${messageId}`);
      const taskId = Number(messages.rows[0].task_id);
      await this.pool.query(`UPDATE tasks SET accepted ='${accept}' WHERE id=${taskId}`);
      await this.pool.query(`UPDATE messages SET accept='${accept}' WHERE id=${messageId}`);
      response.redirect('/inbox');
    } catch (err) {
      console.error(err);
    }
  }

  resendTaskForm = async (request, response) => {
    try {
      const { id } = request.params;
      const { navbar } = request;
      const resendTasks = await this.pool.query(`SELECT tasks.name, tasks.id AS taskid, tasks.due_date, tasks.accepted, tasks.status, tasks.created_by, users.name AS username, users.id, users.email, messages.id AS messagesId, messages.accept, messages.task_id, messages.send_to FROM messages INNER JOIN tasks ON messages.task_id = tasks.id INNER JOIN users ON users.id= messages.send_to WHERE messages.id= ${id}`);
      response.render('resendtasks', { task: resendTasks.rows[0], navbar, mailvalid: '' });
    } catch (err) {
      console.error(err);
    }
  }

  resendTask = async (request, response) => {
    const { navbar } = request;
    const id = Number(request.params.id);
    try {
      const { sendeeemail } = request.body;
      const users = await this.pool.query(`SELECT * FROM users WHERE email='${sendeeemail}'`);
      if (users.rows.length === 0) {
        throw new Error('user does not exist');
      } else {
        const receiptID = Number(users.rows[0].id);
        await this.pool.query(`UPDATE user_tasks SET user_id= ${receiptID} WHERE task_id=${id}`);
        await this.pool.query(`INSERT INTO messages (send_to, task_id, accept) VALUES ('${receiptID}', '${id}', 'pending')`);
        await this.pool.query(`UPDATE tasks SET accepted='no' WHERE id=${id}`);
        response.redirect('/inbox');
      }
    } catch (error) {
      const tasks = await this.pool.query(`SELECT name, id AS taskid, due_date, accepted, status, created_by FROM tasks WHERE id=${id}`);
      if (error.message === 'user does not exist') {
        const task = tasks.rows[0];
        // sends back to the form modal that the email input is invalid
        response.render('resendtasks', { navbar, task, mailvalid: 'is-invalid' });
      }
    }
  }
}

export default TaskController;
