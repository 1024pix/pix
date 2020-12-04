const BookshelfPoleEmploiSending = require('../../infrastructure/data/pole-emploi-sending');

module.exports = {
  create({ poleEmploiSending }) {
    return new BookshelfPoleEmploiSending(poleEmploiSending).save();
  },
};
