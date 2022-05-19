import addSentProperty from '../helperfunctions/addSent.js';
import dynamicSort from '../helperfunctions/sorting.js';

class InboxController {
  constructor(pool) {
    this.pool = pool;
  }

  getInbox = async (request, response) => {
    try {
      const { navbar, userId } = request;
      const { sortBy } = request.query;

      const prereceivedTasks = await this.pool.query(`SELECT tasks.name, tasks.id, tasks.due_date, tasks.accepted, tasks.status, tasks.created_by, messages.accept, messages.task_id, messages.id AS messagesId, messages.send_to, users.name AS username, users.id, users.email FROM tasks INNER JOIN users ON tasks.created_by = users.id INNER JOIN messages ON messages.task_id = tasks.id WHERE messages.send_to='${userId}'`);
      const receivedTasks = addSentProperty(prereceivedTasks.rows, 'received');
      const presentTasks = await this.pool.query(`SELECT tasks.name, tasks.id, tasks.due_date, tasks.accepted, tasks.status, tasks.created_by, messages.accept, messages.task_id, users.name AS username, users.id, users.email, messages.send_to, messages.id AS messagesId FROM messages INNER JOIN tasks ON messages.task_id = tasks.id INNER JOIN users ON messages.send_to = users.id WHERE tasks.created_by='${userId}'`);
      const sentTasks = addSentProperty(presentTasks.rows, 'sent');
      const pretotalTasks = [...receivedTasks, ...sentTasks];
      const totalTasks = dynamicSort(sortBy, pretotalTasks);

      response.render('inbox', {
        totalTasks, navbar, inboxId: userId,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export default InboxController;
