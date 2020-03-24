const { expect, databaseBuilder, knex } = require('../../../test-helper');

const BadgeAcquisition = require('../../../../lib/domain/models/BadgeAcquisition');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

describe('Integration | Repository | Badge Acquisition', () => {

  describe('#create', () => {

    let badgeAcquisition;
    let badgeAcquisitionToCreate;
    let domainTransaction;

    beforeEach(async () => {
      const badgeId = databaseBuilder.factory.buildBadge().id;
      const userId = databaseBuilder.factory.buildUser().id;

      badgeAcquisitionToCreate = databaseBuilder.factory.buildBadgeAcquisition({ badgeId, userId });
      badgeAcquisitionToCreate.id = undefined;
      await databaseBuilder.commit();

      domainTransaction = await DomainTransaction.begin();
    });

    afterEach(() => {
      return knex('badge-acquisitions').delete();
    });

    it('should persist the badge acquisition in db', async () => {
      // when
      badgeAcquisition = await badgeAcquisitionRepository.create(domainTransaction, badgeAcquisitionToCreate);
      await domainTransaction.commit();

      // then
      const result = await knex('badge-acquisitions').where('id', badgeAcquisition.id);

      expect(result).to.have.lengthOf(1);
    });

    it('should return the saved badge acquired', async () => {
      // when
      badgeAcquisition = await badgeAcquisitionRepository.create(domainTransaction, badgeAcquisitionToCreate);
      await domainTransaction.commit();

      // then
      expect(badgeAcquisition).to.be.an.instanceOf(BadgeAcquisition);

      expect(badgeAcquisition).to.have.property('id').and.not.to.be.null;
    });
  });
});
