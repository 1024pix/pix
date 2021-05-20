const BookshelfPoleEmploiSending = require('../orm-models/PoleEmploiSending');

module.exports = {
  create({ poleEmploiSending }) {
    return new BookshelfPoleEmploiSending(poleEmploiSending).save();
  },
};
