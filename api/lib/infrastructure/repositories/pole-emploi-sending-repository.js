const BookshelfPoleEmploiSending = require('../data/PoleEmploiSending');

module.exports = {
  create({ poleEmploiSending }) {
    return new BookshelfPoleEmploiSending(poleEmploiSending).save();
  },
};
