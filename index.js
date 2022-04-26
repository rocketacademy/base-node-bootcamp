// NPM PACKAGES
import express from 'express';
import moment from 'moment';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import pool from './helperfunctions/pool.js';

// HELPER FUNCTIONS
// checks if the login is authentic
import authenticate from './helperfunctions/authenticate.js';
// to create an object on the form validations
import { validateForm, createEmpty } from './helperfunctions/formvalidation.js';
// creates an hashed string
import getHash from './helperfunctions/hashsession.js';
// slices an array into respective arrays, for forms to seperate tasks
import { sliceIntoChunks, sliceForEdit } from './helperfunctions/subtaskhandler.js';
// get username and photo
import getDetails from './helperfunctions/userdetails.js';
// will sort an object by the name of the keys
import dynamicSort from './helperfunctions/sorting.js';
// will add properites to the array string
import addSentProperty from './helperfunctions/addSent.js';
// will check if the task is over due or not
import checkDueDate from './helperfunctions/checkOverdue.js';

// CREATING THE APP
const app = express();
const PORT = process.env.PORT || 3004;

app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
// Add express.static config to allow Express to serve files from public folder
app.use(express.static('public'));
// Add express.static config to allow Express to serve files from uploads folder
app.use(express.static('uploads'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// to add photos into the uploads folder
const multerUpload = multer({ dest: 'uploads/' });

// EJS PAGES
// Log in page
app.get('/', (req, res) => {
  const validate = validateForm('', '', 'Enter valid password', 'Enter valid email');
  res.render('login', validate);
});

// Submit login details
app.post('/', (req, res) => {
  const user = { ...req.body };

  pool.query(`SELECT * FROM users WHERE email='${user.email}'`).then((results) => {
    if (results.rows.length === 0) {
      const validate = validateForm('is-invalid', '', 'Enter valid password', 'Email does not exists! Please sign up');
      res.render('login', validate);
    }

    const storedUser = results.rows[0];
    console.log(storedUser);
    // check if password is correct
    const hashedUserPassword = getHash(user.password);
    if (storedUser.password !== hashedUserPassword) {
      const validate = validateForm('is-valid', 'is-invalid', 'Wrong Password', '');
      res.render('login', validate);
    } else {
      res.cookie('username', storedUser.name);
      res.cookie('userId', storedUser.id);
      res.cookie('hashedSession', getHash(storedUser.id));
      res.redirect('/projects');
    }
  }).catch((error) => {
    console.log('Error executing query', error.stack);
    res.status(503).send(res.rows);
  });
});

app.get('/logout', (req, res) => {
  res.clearCookie('username');
  res.clearCookie('userId');
  res.clearCookie('hashedSession');
  res.redirect('/');
});

// signup page
app.get('/signup', (req, res) => {
  const validate = validateForm('', '', 'Enter valid password', 'Enter valid email');
  res.render('signup', validate);
});

// create a new user, signing up
app.post('/signup', (req, res) => {
  const user = { ...req.body };

  pool.query(`SELECT * FROM users WHERE email='${user.email}'`).then((results) => {
    if (results.rows.length > 0) {
      const validate = validateForm('is-invalid', '', 'Enter valid password', 'Email has already been registered');
      res.render('signup', validate);
    }

    const hashedPassword = getHash(user.password);
    const values = [user.name, user.email, hashedPassword];
    return pool.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id', values);
  }).then((result) => {
    console.log(result);
    res.redirect('/');
  }).catch((error) => {
    console.log('Error executing query', error.stack);
    res.status(503).send(res.rows);
  });
});

// user profile
app.get('/profile', authenticate, getDetails, (req, res) => {
  const { navbar, userId } = req;

  pool.query(`SELECT * FROM users WHERE id=${userId}`).then((results) => {
    const user = results.rows[0];
    const { contact } = user;
    res.render('profile', { navbar, user });
  });
});

app.post('/user/:id/photo', authenticate, multerUpload.single('photo'), (req, res) => {
  const userId = Number(req.params.id);
  console.log(req.file.filename);
  pool.query(`UPDATE users SET photo='${req.file.filename}' WHERE id=${userId}`).then((results) => {
    res.redirect('/profile');
  }).catch((error) => {
    console.log('Error executing query', error.stack);
    res.status(503).send(res.rows);
  });
});

// Edit the profile of the user
app.put('/user/:id', authenticate, multerUpload.single('photo'), (req, res) => {
  const userId = Number(req.params.id);
  const user = req.body;

  pool.query(`UPDATE users SET name='${user.name}', email='${user.email}', contact='${user.contact}', role='${user.role}', workplace='${user.workplace}' WHERE id=${userId}`).then((results) => {
    res.redirect('/profile');
  }).catch((error) => {
    console.log('Error executing query', error.stack);
    res.status(503).send(res.rows);
  });
});

// user profile
app.get('/teammates', authenticate, getDetails, (req, res) => {
  const { navbar, userId } = req;

  pool.query(`SELECT * FROM users INNER JOIN friends ON users.id = friends.friend_id WHERE friends.user_id=${userId}`).then((results) => {
    res.render('teammates', {
      navbar, friends: results.rows, mailvalid: '', invalid: '',
    });
  });
});

// user profile
app.post('/teammates/add', authenticate, getDetails, (req, res) => {
  const { navbar, userId } = req;
  const user = req.body;
  let receiptID;

  pool.query(`SELECT * FROM users WHERE email='${user.sendeeemail}'`).then((results) => {
    const otherQueries = [];
    const allQueries = Promise.all([
      ...otherQueries,
    ]);

    if (results.rows.length === 0) {
      // if the email does not exist
      const otherQuery = new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM users INNER JOIN friends ON users.id = friends.friend_id WHERE friends.user_id=${userId}`).then((checkEmail) => {
          const invalid = 'Email does not belong to any user ';
          resolve('invalid user email');
          res.render('teammates', {
            navbar, friends: checkEmail.rows, invalid, mailvalid: 'is-invalid',
          });
        });
      });
      otherQueries.push(otherQuery);
    } else {
      receiptID = results.rows[0].id;
      const mainquery = new Promise((resolve, reject) => {
        // to check if friend already exists
        pool.query(`SELECT * FROM users INNER JOIN friends ON users.id = friends.friend_id WHERE friends.user_id=${userId} AND friends.friend_id=${receiptID} `).then((checkExists) => {
          if (checkExists.rows.length === 0) {
            return pool.query(`INSERT INTO friends (user_id, friend_id) VALUES ( ${userId}, ${receiptID} )`);
          }
          return pool.query(`SELECT * FROM users INNER JOIN friends ON users.id = friends.friend_id WHERE friends.user_id=${userId}`);
        }).then((finalResults) => {
          if (finalResults.rows.length !== 0) {
            const invalid = 'Already a friend';
            resolve('Already a friend');
            res.render('teammates', {
              navbar, friends: finalResults.rows, invalid, mailvalid: 'is-invalid',
            });
          } else {
            resolve('friend added');
            res.redirect('/teammates');
          }
        });
      });
      otherQueries.push(mainquery);
    }

    console.log(otherQueries);
    return allQueries;
  }).then((endResults) => {
    console.log('all done');
  }).catch((error) => {
    console.log('Error executing query', error.stack);
  });
});

app.delete('/teammates/:id', authenticate, (req, res) => {
  const { userId } = req;
  const friendId = Number(req.params.id);
  pool.query(`DELETE FROM friends WHERE friend_id=${friendId} AND user_id=${userId}`).then((results) => {
    res.redirect('/teammates');
  });
});

// page to show all the projects
app.get('/projects', authenticate, getDetails, (req, res) => {
  const { navbar, userId } = req;
  const { completedSortBy } = req.query;
  const { pendingSortBy } = req.query;

  const allQueries = Promise.all([
    pool.query(`SELECT * FROM proj WHERE created_by = ${userId} AND status='pending'`),
    pool.query(`SELECT * FROM proj WHERE created_by = ${userId} AND status ='completed'`),
  ]).then((results) => {
    const unsortedcompletedProj = results[0].rows;
    const unsortedpendingProj = results[1].rows;
    const pendingProj = dynamicSort(pendingSortBy, unsortedcompletedProj);
    const completedProj = dynamicSort(completedSortBy, unsortedpendingProj);
    res.render('projects', { pendingProj, completedProj, navbar });
  });
});

// form to add a project
app.get('/projects/add', authenticate, getDetails, (req, res) => {
  const { navbar, userId } = req;
  pool.query(`SELECT * FROM users INNER JOIN friends ON users.id = friends.friend_id WHERE friends.user_id=${userId}`).then((results) => {
    const friends = results.rows;
    console.log(friends);
    res.render('createproject', { navbar, friends });
  });
});

// to post new project and tasks
app.post('/projects/add', authenticate, getDetails, (req, res) => {
  const { navbar, userId } = req;
  const user = req.body;
  console.log('user', user);
  const [name, description, duedate, ...tasks] = Object.values(user);
  const slicedArray = sliceIntoChunks(tasks);
  const validationArray = createEmpty(slicedArray);
  const fomattedDueDate = moment(duedate).format('DD MMM YYYY hh:mm');
  const values = [name, description, fomattedDueDate, 'pending', 0, userId];

  // do validation for emails first
  const checkEmail = new Promise((resolve, reject) => {
    slicedArray.forEach((chunk, index) => {
      const [taskName, taskduedate, email] = chunk;
      pool.query(`SELECT * FROM users WHERE email='${email}'`).then((userIdResults) => {
        console.log(chunk, index);
        // if the email is invalid
        if (userIdResults.rows.length === 0) {
          validationArray[index] = 'is-invalid';
          const object = { ...user, validation: validationArray };
          res.render('createprojectvalidate', { ...object, navbar });
          reject(new Error('email invalid'));
        }

        if (index === slicedArray.length - 1) {
          resolve('checked');
        }
      }).catch((error) => {
        console.log(error);
      });
    });
  });

  checkEmail.then((checkResults) => pool.query('INSERT INTO proj (name, description, due_date, status, progress, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id', values)).then((results) => {
    console.log('ran');
    const projId = results.rows[0].id;
    const taskPromises = [];

    slicedArray.forEach((chunk) => {
      const [taskName, taskduedate, email] = chunk;
      const formattedTDueDate = moment(taskduedate).format('DD MMM YYYY hh:mm');
      let taskId;
      let receiptId;

      const insertTasks = new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM users WHERE email='${email}'`).then((userIdResults) => {
          receiptId = userIdResults.rows[0].id;
          return pool.query('INSERT INTO tasks (name, due_date, accepted, status, created_by) VALUES ( $1, $2, $3, $4, $5) RETURNING id', [taskName, formattedTDueDate, 'no', 'pending', userId]);
        }).then((insertTaskResults) => {
          taskId = insertTaskResults.rows[0].id;
          return pool.query('INSERT INTO user_tasks (user_id, task_id) VALUES ($1, $2)', [receiptId, taskId]);
        }).then((insertUserTaskResults) => {
          console.log('taskID', taskId);
          console.log('receiptID', receiptId);

          return pool.query('INSERT INTO proj_tasks (proj_id, task_id) VALUES ($1, $2)', [projId, taskId]);
        })
          .then((insertProjTaskResults) => pool.query('INSERT INTO messages (send_to, task_id, accept) VALUES ($1, $2, $3)', [receiptId, taskId, 'pending']))
          .then((insertMessages) => {
            resolve('alldone');
          })
          .catch((error) => {
            reject(error.stack);
          });
      });
      taskPromises.push(insertTasks);
    });

    const allQueries = Promise.all([
      ...taskPromises,
    ]);

    allQueries.then((allresults) => {
      console.log('all results', allresults);
      res.redirect('/projects');
    }).catch((error) => {
      console.log('Error executing query', error.stack);
    });
  }).catch((allerror) => {
    console.log(allerror);
  });
});

// to get the page for the individual project with id
app.get('/projects/:id', authenticate, getDetails, (req, res) => {
  const projId = Number(req.params.id);
  const { navbar } = req;
  const allQueries = Promise.all([
    pool.query(`SELECT * FROM proj WHERE id= ${projId}`), pool.query(`SELECT user_tasks.user_id, user_tasks.task_id, proj_tasks.proj_id, proj_tasks.task_id, tasks.id, tasks.name, tasks.due_date, tasks.accepted, tasks.status, tasks.created_by, users.name AS username FROM user_tasks INNER JOIN proj_tasks ON proj_tasks.task_id = user_tasks.task_id INNER JOIN tasks ON user_tasks.task_id = tasks.id INNER JOIN users ON user_tasks.user_id = users.id WHERE proj_id=${projId}`),
  ]).then((results) => {
    const proj = results[0].rows[0];
    const tasks = results[1].rows;
    res.render('individualproj', { proj, tasks, navbar });
  }).catch((error) => {
    console.log('Error executing query', error.stack);
    res.status(503).send(res.rows);
  });
});

// to get the form to edit the project
app.get('/projects/:id/edit', authenticate, getDetails, (req, res) => {
  const projId = Number(req.params.id);
  const { navbar } = req;

  const getTasks = new Promise((resolve, reject) => {
    pool.query(`SELECT tasks.id AS taskid, tasks.name, tasks.due_date, tasks.accepted, tasks.status, tasks.created_by, proj_tasks.proj_id, proj_tasks.task_id, user_tasks.user_id, user_tasks.task_id FROM tasks INNER JOIN proj_tasks ON proj_tasks.task_id = tasks.id INNER JOIN user_tasks ON user_tasks.task_id = tasks.id WHERE proj_tasks. proj_id = ${projId}`).then((results) => {
      const tasks = results.rows;
      const updatedTasks = [];
      let counter = 0;
      const limit = tasks.length;
      tasks.forEach((task) => {
        const receiptId = task.user_id;
        pool.query(`SELECT * FROM users WHERE id=${receiptId}`).then((result) => {
          counter += 1;
          const userEmail = result.rows[0].email;
          task.user_email = userEmail;
          task.formatdate = moment(task.due_date).format('YYYY-MM-DDTHH:MM');
          updatedTasks.push(task);

          console.log(counter, limit);
          if (counter === limit) {
            resolve(updatedTasks);
            return updatedTasks;
          }
        });
      });
    });
  });

  const allQueries = Promise.all([
    pool.query(`SELECT * FROM proj WHERE id= ${projId}`), getTasks]).then((results) => {
    const proj = results[0].rows[0];
    proj.formatdate = moment(proj.due_date).format('YYYY-MM-DDTHH:MM');
    const tasks = results[1];
    res.render('editproject', { proj, tasks, navbar });
  }).catch((error) => {
    console.log('Error executing query', error.stack);
    res.status(503).send(res.rows);
  });
});

// to edit the details
app.put('/projects/:id/edit', authenticate, (req, res) => {
  const { userId } = req;
  const user = req.body;
  console.log(user);
  const projId = req.params.id;
  const [name, description, duedate, ...tasks] = Object.values(user);
  const fomattedDueDate = moment(duedate).format('DD MMM YYYY hh:mm');

  // edit the project details
  pool.query(`UPDATE proj SET name ='${name}', description='${description}', due_date='${fomattedDueDate}' WHERE id=${projId}`).then((result) => {
    const slicedArray = sliceForEdit(tasks);
    const taskPromises = [];

    slicedArray.forEach((chunk) => {
      const [taskId, taskName, taskduedate, email] = chunk;
      const formattedTDueDate = moment(taskduedate).format('DD MMM YYYY hh:mm');
      let receiptId;
      let newTaskId;

      const insertTasks = new Promise((resolve, reject) => {
        // check for the user id of the person assined
        pool.query(`SELECT * FROM users WHERE email='${email}'`).then((results) => {
          receiptId = Number(results.rows[0].id);
          // check if the task already exists
          let query = '';
          if (taskId === '') {
            query = `INSERT INTO tasks (name, due_date, accepted, status, created_by) VALUES ('${taskName}', '${formattedTDueDate}', 'no', 'pending', ${userId}) RETURNING id`;
          } else {
            query = `UPDATE tasks SET name ='${taskName}', due_date='${formattedTDueDate}' WHERE id=${taskId}`;
          }
          return pool.query(query);
        }).then((booleanResults) => {
          // edit the person assigned to the task

          let query2;

          if (booleanResults.rows.length > 0) {
            newTaskId = Number(booleanResults.rows[0].id);
            console.log(newTaskId);
            query2 = `INSERT INTO user_tasks (user_id, task_id) VALUES ('${receiptId}', '${newTaskId}') RETURNING id`;
          } else {
            query2 = `UPDATE user_tasks SET user_id ='${receiptId}' WHERE id='${taskId}'`;
          }
          return pool.query(query2);
        })
          .then((editPerson) => {
            // edit the projects assignment
            let query3;
            if (editPerson.rows.length > 0) {
              query3 = `INSERT INTO proj_tasks (proj_id, task_id) VALUES (${projId}, ${newTaskId}) RETURNING id`;
            } else {
              query3 = `UPDATE proj_tasks SET proj_id ='${projId}' WHERE id=${taskId}`;
            }
            return pool.query(query3);
          })
          .then((endResults) => {
            let query4;

            if (endResults.rows.length > 0) {
              query4 = `INSERT INTO messages (send_to, task_id, accept) VALUES ('${receiptId}', '${newTaskId}', 'pending') RETURNING id`;
            } else {
              query4 = 'SELECT * FROM messages';
            }
            return pool.query(query4);
          })
          .then((finishResults) => {
            resolve('finished');
          })
          .catch((error) => {
            console.log('Error executing query', error.stack);
            res.status(503).send(res.rows);
          });
      });
      taskPromises.push(insertTasks);
    });
    const allQueries = Promise.all([
      ...taskPromises,
    ]);

    allQueries.then((allresults) => {
      res.redirect(`/projects/${projId}`);
    }).catch((error) => {
      console.log('Error executing query', error.stack);
      res.status(503).send(res.rows);
    });
  });
});

// delete the project and relevant tasks
app.delete('/projects/:id', (req, res) => {
  const projId = Number(req.params.id);
  const otherQueries = [];

  pool.query(`SELECT * FROM proj_tasks WHERE proj_id = ${projId}`).then((results) => {
    const tasks = results.rows;

    tasks.forEach((task) => {
      const taskId = task.id;
      const deleteTasks = new Promise((resolve, reject) => {
        pool.query(`DELETE FROM tasks WHERE id=${taskId}`).then((deleteResults) => pool.query(`DELETE FROM user_tasks WHERE task_id=${taskId}`)).then((secondDelete) => {
          pool.query(`DELETE FROM messages WHERE task_id=${taskId}`);
        }).then((lastDelete) => {
          resolve('finished delete from tasks and user_tasks');
        });
      });
      otherQueries.push(deleteTasks);
    });
    console.log(otherQueries);

    const allQueries = Promise.all([
      pool.query(`DELETE FROM proj WHERE id=${projId}`),
      pool.query(`DELETE FROM proj_tasks WHERE proj_id=${projId}`),
      ...otherQueries,
    ]).then((allresults) => {
      console.log('deleted from all tables');
      res.redirect('/projects/');
    }).catch((error) => {
      console.log('Error executing query', error.stack);
      res.status(503).send(res.rows);
    });
  });
});

// to update tasks to be completed and update progress of the project
app.get('/tasks/completed', authenticate, (req, res) => {
  const { projId, taskId, taskStatus } = req.query;

  pool.query(`UPDATE tasks SET status='${taskStatus}' WHERE id=${taskId}`).then((results) => {
    const allQueries = Promise.all([
      pool.query(`SELECT * FROM proj_tasks WHERE proj_id=${projId}`),
      pool.query(`SELECT * FROM tasks INNER JOIN proj_tasks ON proj_tasks.task_id = tasks.id WHERE proj_tasks.proj_id = ${projId} AND tasks.status = 'completed'`),
    ]).then((result) => {
      const totalTasks = result[0].rows.length;
      const completedTasks = result[1].rows.length;

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
      const second = Promise.all([
        pool.query(`UPDATE proj SET progress = ${progress} WHERE id=${projId}`),
        pool.query(`UPDATE proj SET status='${progressStatus}' WHERE id=${projId}`),
      ]);

      second.then((totalResults) => {
        console.log('successfully updated');
        res.redirect(`/projects/${projId}`);
      }).catch((error) => {
        console.log('Error executing query', error.stack);
        res.status(503).send(res.rows);
      });
    });
  });
});

// to get ALL tasks
app.get('/tasks/all', authenticate, getDetails, (req, res) => {
  const { navbar, userId } = req;
  const { pendingSortBy } = req.query;
  const { completedSortBy } = req.query;

  const allQueries = Promise.all([
    pool.query(`SELECT tasks.id, tasks.name, tasks.due_date, tasks.accepted, tasks.status, tasks.created_by, proj_tasks.proj_id, proj_tasks.task_id, user_tasks.user_id, user_tasks.task_id, users.name AS username  FROM tasks INNER JOIN proj_tasks ON proj_tasks.task_id = tasks.id INNER JOIN user_tasks on user_tasks.task_id = tasks.id INNER JOIN users ON tasks.created_by = users.id WHERE user_tasks.user_id = ${userId} AND tasks.status='completed' AND tasks.accepted='accepted'`),
    pool.query(`SELECT tasks.id, tasks.name, tasks.due_date, tasks.accepted, tasks.status, tasks.created_by, proj_tasks.proj_id, proj_tasks.task_id, user_tasks.user_id, user_tasks.task_id, users.name AS username  FROM tasks INNER JOIN proj_tasks ON proj_tasks.task_id = tasks.id INNER JOIN user_tasks on user_tasks.task_id = tasks.id INNER JOIN users ON tasks.created_by = users.id WHERE user_tasks.user_id = ${userId} AND tasks.status='pending' AND tasks.accepted='accepted'`),
  ]).then((results) => {
    const unsortedcompletedTasks = results[0].rows;
    const unsortedpendingTasks = results[1].rows;
    const checkpendingTasks = dynamicSort(pendingSortBy, unsortedpendingTasks);
    const pendingTasks = checkDueDate(checkpendingTasks);
    console.log(pendingTasks);
    const completedTasks = dynamicSort(completedSortBy, unsortedcompletedTasks);

    res.render('tasks', { completedTasks, pendingTasks, navbar });
  }).catch((error) => {
    console.log('Error executing query', error.stack);
    res.status(503).send(res.rows);
  });
});

// to update tasks to be completed and update progress of the project
app.get('/tasks/all/completed', authenticate, (req, res) => {
  const { projId, taskId, taskStatus } = req.query;

  pool.query(`UPDATE tasks SET status='${taskStatus}' WHERE id=${taskId}`).then((results) => {
    const allQueries = Promise.all([
      pool.query(`SELECT * FROM proj_tasks WHERE proj_id=${projId}`),
      pool.query(`SELECT * FROM tasks INNER JOIN proj_tasks ON proj_tasks.task_id = tasks.id WHERE proj_tasks.proj_id = ${projId} AND tasks.status = 'completed'`),
    ]).then((result) => {
      const totalTasks = result[0].rows.length;
      const completedTasks = result[1].rows.length;

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
      const second = Promise.all([
        pool.query(`UPDATE proj SET progress = ${progress} WHERE id=${projId}`),
        pool.query(`UPDATE proj SET status='${progressStatus}' WHERE id=${projId}`),
      ]);

      second.then((totalResults) => {
        console.log('successfully updated');
        res.redirect('/tasks/all');
      }).catch((error) => {
        console.log('Error executing query', error.stack);
        res.status(503).send(res.rows);
      });
    });
  });
});

// to get the form on whether they want to accept the task
app.get('/received/:id/accept', authenticate, getDetails, (req, res) => {
  const { id } = req.params;
  const { navbar } = req;
  pool.query(`SELECT tasks.name, tasks.id AS taskid, tasks.due_date, tasks.accepted, tasks.status, tasks.created_by, users.name AS username, users.id, users.email, messages.id AS messagesId, messages.accept, messages.task_id, messages.send_to FROM tasks INNER JOIN messages ON messages.task_id = tasks.id INNER JOIN users ON tasks.created_by= users.id WHERE messages.id= ${id}`).then((results) => {
    console.log(results.rows[0]);
    res.render('accepttasks', { task: results.rows[0], navbar });
  }).catch((error) => {
    console.log('Error executing query', error.stack);
    res.status(503).send(res.rows);
  });
});

// to post their response to whether they accepted
app.post('/received/:id/accept', authenticate, (req, res) => {
  const messageId = Number(req.params.id);
  const { accept } = req.body;
  pool.query(`SELECT * FROM messages WHERE id=${messageId}`).then((messagesResults) => {
    const taskId = Number(messagesResults.rows[0].task_id);
    return pool.query(`UPDATE tasks SET accepted ='${accept}' WHERE id=${taskId}`);
  }).then((updateResults) => pool.query(`UPDATE messages SET accept='${accept}' WHERE id=${messageId}`)).then((finalResults) => {
    console.log('updated');
    res.redirect('/inbox');
  })
    .catch((error) => {
      console.log('Error executing query', error.stack);
      res.status(503).send(res.rows);
    });
});

// to get the email that allow user to resend tasks
app.get('/sent/:id/response', authenticate, getDetails, (req, res) => {
  const { id } = req.params;
  const { navbar } = req;
  pool.query(`SELECT tasks.name, tasks.id AS taskid, tasks.due_date, tasks.accepted, tasks.status, tasks.created_by, users.name AS username, users.id, users.email, messages.id AS messagesId, messages.accept, messages.task_id, messages.send_to FROM messages INNER JOIN tasks ON messages.task_id = tasks.id INNER JOIN users ON users.id= messages.send_to WHERE messages.id= ${id}`).then((results) => {
    // sends back to the form modal that the email input has yet to be validated
    res.render('resendtasks', { task: results.rows[0], navbar, mailvalid: '' });
  }).catch((error) => {
    console.log('Error executing query', error.stack);
    res.status(503).send(res.rows);
  });
});

// to change the user that is assigned the task after task has been rejected
app.put('/task/:id/response', authenticate, getDetails, (req, res) => {
  const id = Number(req.params.id);
  const { navbar } = req;
  const { sendeeemail } = req.body;
  const taskPromises = [];

  pool.query(`SELECT * FROM users WHERE email='${sendeeemail}'`).then((results) => {
    console.log(results.rows);

    if (results.rows.length === 0) {
      console.log('error');
      const newPromise = new Promise((resolve, reject) => {
        pool.query(`SELECT name, id AS taskid, due_date, accepted, status, created_by FROM tasks WHERE id=${id}`).then((insertResults) => {
          resolve(insertResults);
        });
      });
      taskPromises.push(newPromise);
    } else {
      const receiptID = Number(results.rows[0].id);
      const newPromise = new Promise((resolve, reject) => {
        pool.query(`UPDATE user_tasks SET user_id= ${receiptID} WHERE task_id=${id}`).then((insertResults) => pool.query(`INSERT INTO messages (send_to, task_id, accept) VALUES ('${receiptID}', '${id}', 'pending')`).then((updateTasks) => pool.query(`UPDATE tasks SET accepted='no' WHERE id=${id}`))).then((lastResults) => {
          resolve('all done');
        });
      });
      taskPromises.push(newPromise);
    }

    const allQueries = Promise.all([...taskPromises]);
    allQueries.then((allQueriesResults) => {
      console.log('allQueries', allQueriesResults[0]);
      if (allQueriesResults[0] === 'all done') {
        res.redirect('/inbox');
      } else {
        const task = allQueriesResults[0].rows[0];
        // sends back to the form modal that the email input is invalid
        res.render('resendtasks', { navbar, task, mailvalid: 'is-invalid' });
      }
    });
  });
});

// to see their inbox
app.get('/inbox', authenticate, getDetails, (req, res) => {
  const { navbar, userId } = req;
  const { sortBy } = req.query;

  const allQueries = Promise.all([

    pool.query(`SELECT tasks.name, tasks.id, tasks.due_date, tasks.accepted, tasks.status, tasks.created_by, messages.accept, messages.task_id, messages.id AS messagesId, messages.send_to, users.name AS username, users.id, users.email FROM tasks INNER JOIN users ON tasks.created_by = users.id INNER JOIN messages ON messages.task_id = tasks.id WHERE messages.send_to='${userId}'`),

    pool.query(`SELECT tasks.name, tasks.id, tasks.due_date, tasks.accepted, tasks.status, tasks.created_by, messages.accept, messages.task_id, users.name AS username, users.id, users.email, messages.send_to, messages.id AS messagesId FROM messages INNER JOIN tasks ON messages.task_id = tasks.id INNER JOIN users ON messages.send_to = users.id WHERE tasks.created_by='${userId}'`),

  ]).then((results) => {
    const prereceivedTasks = results[0].rows;
    const receivedTasks = addSentProperty(prereceivedTasks, 'received');
    const presentTasks = results[1].rows;
    const sentTasks = addSentProperty(presentTasks, 'sent');
    const pretotalTasks = [...receivedTasks, ...sentTasks];
    const totalTasks = dynamicSort(sortBy, pretotalTasks);

    res.render('inbox', {
      totalTasks, navbar, inboxId: userId,
    });
  }).catch((error) => {
    console.log('Error executing query', error.stack);
    res.status(503).send(res.rows);
  });
});

app.listen(PORT);
