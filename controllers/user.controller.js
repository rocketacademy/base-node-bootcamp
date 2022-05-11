import { validateForm, createEmpty } from '../helperfunctions/formvalidation.js';


class UserController {
  constructor(db) {
    this.db = db;
  }

  getLoginForm = async (request, response) => {
    try {
       const validate = validateForm('', '', 'Enter valid password', 'Enter valid email');
      response.render('login', validate);
    } catch (err) {
      console.error(err);
    }
  };

  createItem = async (request, response) => {
    try {
      const { item } = request.body;
      const resp = await this.db.Item.create({
        name: item,
      });
      const newItem = resp.toJSON();

      response.render('items', { newItem });
    } catch (err) {
      console.error(err);
    }
  };
}

export default ItemController;
