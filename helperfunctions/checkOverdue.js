import moment from 'moment';

const checkDueDate = (array) => {
  array.forEach((task) => {
    const dueDate = task.due_date;
    const checkforOverDue = moment().isAfter(dueDate);
    const checkforDue = moment().isSame(dueDate);

    if (checkforOverDue === true) {
      task.due = 'Overdue';
    } else if (checkforDue === true) {
      task.due = 'Due today';
    } else {
      task.due = '';
    }
  });
  return array;
};

export default checkDueDate;
