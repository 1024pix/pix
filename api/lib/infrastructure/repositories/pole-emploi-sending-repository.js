const BookshelfPoleEmploiSending = require('../../infrastructure/data/pole-emploi-sending');
const DomainTransaction = require('../DomainTransaction');

module.exports = {
  create({ poleEmploiSending, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const transacting = domainTransaction && domainTransaction.knexTransaction;
    return new BookshelfPoleEmploiSending(poleEmploiSending).save(null, { transacting });
  },
};
