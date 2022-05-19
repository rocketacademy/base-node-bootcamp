module.exports = {
  up: async (queryInterface) => {
    const userList = [
      {
        name: 'bernice',
        email: 'berniceyeosuping@gmail.com',
        password: '1234',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'test',
        email: 'test@gmail.com',
        password: '1234',
        created_at: new Date(),
        updated_at: new Date(),
      },

    ];
    const drummers = await queryInterface.bulkInsert(
      'users',
      userList,
      { returning: true },
    );

    const reservations = [];
    for (let i = 0; i < userList.length; i++) {
      reservations.push({
        created_by: userList[i].id,
        name: '2021-04-05',
        created_at: new Date(),
        updated_at: new Date(),
      });
      reservations.push({
        drummer_id: drummers[i].id,
        booking_date: '2021-04-16',
        created_at: new Date(),
        updated_at: new Date(),
      });

      queryInterface.bulkInsert('reservations', reservations);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('drummers', null, {});
    await queryInterface.bulkDelete('reservations', null, {});
  },
};
