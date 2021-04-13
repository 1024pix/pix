const BookshelfPoleEmploiSending = require('../../infrastructure/data/pole-emploi-sending');
const DomainTransaction = require('../DomainTransaction');

module.exports = {
  create({ poleEmploiSending, domainTransaction = DomainTransaction.emptyTransaction() }) {
    return new BookshelfPoleEmploiSending(poleEmploiSending).save(null, { transacting: domainTransaction.knexTransaction });
  },
};
