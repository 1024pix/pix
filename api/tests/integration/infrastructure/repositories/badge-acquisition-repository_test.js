const { expect, databaseBuilder, knex } = require('../../../test-helper');

const BadgeAcquisition = require('../../../../lib/domain/models/BadgeAcquisition');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

describe('Integration | Repository | Badge Acquisition', () => {

  let badgeAcquisitionToCreate;

  describe('#create', () => {

    let badgeAcquisition;

    beforeEach(async () => {
      const badgeId = databaseBuilder.factory.buildBadge().id;
      const userId = databaseBuilder.factory.buildUser().id;

      badgeAcquisitionToCreate = databaseBuilder.factory.buildBadgeAcquisition({ badgeId, userId });
      badgeAcquisitionToCreate.id = undefined;
      await databaseBuilder.commit();

    });

    afterEach(async () => {
      await knex('badge-acquisitions').delete();
      return knex('users').delete();
    });

    it('should persist the badge acquisition in db', async () => {
      // when
      badgeAcquisition = await DomainTransaction.execute(async (domainTransaction) => {
        return badgeAcquisitionRepository.create(badgeAcquisitionToCreate, domainTransaction);
      });

      // then
      const result = await knex('badge-acquisitions').where('id', badgeAcquisition.id);

      expect(result).to.have.lengthOf(1);
    });

    it('should return the saved badge acquired', async () => {
      // when
      badgeAcquisition = await DomainTransaction.execute(async (domainTransaction) => {
        return badgeAcquisitionRepository.create(badgeAcquisitionToCreate, domainTransaction);
      });

      // then
      expect(badgeAcquisition).to.be.an.instanceOf(BadgeAcquisition);
      expect(badgeAcquisition).to.have.property('id').and.not.to.be.null;
    });
  });

  describe('#hasAcquiredBadgeWithKey', () => {
    let userId;
    let badgeKey;

    beforeEach(async () => {
      const { id, key } = databaseBuilder.factory.buildBadge();
      badgeKey = key;
      userId = databaseBuilder.factory.buildUser().id;

      badgeAcquisitionToCreate = databaseBuilder.factory.buildBadgeAcquisition({ badgeId: id, userId });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex('badge-acquisitions').delete();
      await knex('badges').delete();
      return knex('users').delete();
    });

    it('should check that the user has acquired the badge', async () => {
      // when
      const hasBadge = await badgeAcquisitionRepository.hasAcquiredBadgeWithKey({ userId, badgeKey });

      // then
      expect(hasBadge).to.be.true;
    });

    it('should check that the user has not acquired the badge', async () => {
      // when
      const hasBadge = await badgeAcquisitionRepository.hasAcquiredBadgeWithKey({ userId, badgeKey: badgeKey + '!' });

      // then
      expect(hasBadge).to.be.false;
    });
  });

  describe('#getAcquiredBadgeIds', () => {
    let userId;
    let badgeId;

    beforeEach(async () => {
      badgeId = databaseBuilder.factory.buildBadge().id;
      userId = databaseBuilder.factory.buildUser().id;

      badgeAcquisitionToCreate = databaseBuilder.factory.buildBadgeAcquisition({ badgeId, userId });
      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex('badge-acquisitions').delete();
      await knex('badges').delete();
      return knex('users').delete();
    });

    it('should check that the user has acquired the badge', async () => {
      // when
      const acquiredBadgeIds = await badgeAcquisitionRepository.getAcquiredBadgeIds({ userId, badgeIds: [badgeId] });

      // then
      expect(acquiredBadgeIds).to.deep.equal([badgeId]);
    });

    it('should check that the user has not acquired the badge', async () => {
      // when
      const acquiredBadgeIds = await badgeAcquisitionRepository.getAcquiredBadgeIds({ userId, badgeIds: [-1] });

      // then
      expect(acquiredBadgeIds.length).to.equal(0);
    });
  });
});
