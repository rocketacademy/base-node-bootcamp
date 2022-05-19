class FriendController {
  constructor(pool) {
    this.pool = pool;
  }

  getAllTeammates = async (request, response) => {
    try {
      const { navbar, userId } = request;
      const friends = await this.pool.query(`SELECT * FROM users INNER JOIN friends ON users.id = friends.friend_id WHERE friends.user_id=${userId}`);
      response.render('teammates', {
        navbar, friends: friends.rows, mailvalid: '', invalid: '',
      });
    } catch (error) {
      console.log(error);
    }
  }

  addTeammate = async (request, response) => {
    const { navbar, userId } = request;
    const user = request.body;
    try {
      const checkEmail = await this.pool.query(`SELECT * FROM users WHERE email='${user.sendeeemail}'`);
      if (checkEmail.rows.length === 0) {
        throw new Error('email does not exist');
      }
      const receiptID = checkEmail.rows[0].id;
      const checkFriends = await this.pool.query(`SELECT * FROM users INNER JOIN friends ON users.id = friends.friend_id WHERE friends.user_id=${userId} AND friends.friend_id=${receiptID} `);
      if (checkFriends.rows.length > 0) {
        throw new Error('friend exists');
      }
      await this.pool.query(`INSERT INTO friends (user_id, friend_id) VALUES ( ${userId}, ${receiptID} )`);
      response.redirect('/teammates');
    } catch (error) {
      const finalResults = await this.pool.query(`SELECT * FROM users INNER JOIN friends ON users.id = friends.friend_id WHERE friends.user_id=${userId}`);

      if (error.message === 'friend exists') {
        response.render('teammates', {
          navbar, friends: finalResults.rows, invalid: 'friend already exists', mailvalid: 'is-invalid',
        });
      } else if (error.message === 'email does not exist') {
        response.render('teammates', {
          navbar, friends: finalResults.rows, invalid: 'Email does not belong to any user', mailvalid: 'is-invalid',
        });
      }
    }
  }

  deleteTeammates = async (request, response) => {
    try {
      const { userId } = request;
      const friendId = Number(request.params.id);
      await this.pool.query(`DELETE FROM friends WHERE friend_id=${friendId} AND user_id=${userId}`);
      response.redirect('/teammates');
    } catch (error) {
      console.log(error);
    }
  }
}

export default FriendController;
