class ProfileController {
  constructor(pool) {
    this.pool = pool;
  }

  getProfile = async (request, response) => {
    try {
      const { navbar, userId } = request;
      const user = await this.pool.query(`SELECT * FROM users WHERE id=${userId}`);
      response.render('profile', { navbar, user: user.rows[0] });
    } catch (error) {
      console.log(error);
    }
  }

  uploadUserPhoto = async (request, response) => {
    try {
      const userId = Number(request.params.id);
      await this.pool.query(`UPDATE users SET photo='${request.file.location}' WHERE id=${userId}`);
      response.redirect('/profile');
    } catch (error) {
      console.log(error);
    }
  }

  editProfile = async (request, response) => {
    try {
      const userId = Number(request.params.id);
      const user = request.body;
      await this.pool.query(`UPDATE users SET name='${user.name}', email='${user.email}', contact='${user.contact}', role='${user.role}', workplace='${user.workplace}' WHERE id=${userId}`);
      response.redirect('/profile');
    } catch (error) {
      console.log(error);
    }
  }
}

export default ProfileController;
