const BookshelfUserTutorials = require('../orm-models/UserTutorials');

module.exports = {
  async addTutorial({ userId, tutorialId }) {
    const userTutorial = await BookshelfUserTutorials.where({ userId, tutorialId }).fetch({ require: false });
    if (userTutorial) {
      return _toDomain(userTutorial);
    }
    const rawUserTutorial = new BookshelfUserTutorials({ userId, tutorialId });
    const savedUserTutorial = await rawUserTutorial.save();
    return _toDomain(savedUserTutorial);
  },

  async find({ userId }) {
    const userTutorials = await BookshelfUserTutorials.where({ userId }).fetchAll();
    return userTutorials.map(_toDomain);
  },

  async removeFromUser(userTutorial) {
    return BookshelfUserTutorials.where(userTutorial).destroy({ require: false });
  },
};

function _toDomain(bookshelfUserTutorial) {
  return {
    id: bookshelfUserTutorial.get('id'),
    tutorialId: bookshelfUserTutorial.get('tutorialId'),
    userId: bookshelfUserTutorial.get('userId'),
  };
}
