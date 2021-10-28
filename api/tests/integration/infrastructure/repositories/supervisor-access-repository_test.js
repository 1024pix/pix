const { expect, databaseBuilder, knex } = require('../../../test-helper');
const supervisorAccessRepository = require('../../../../lib/infrastructure/repositories/supervisor-access-repository');

describe('Integration | Repository | supervisor-access-repository', function () {
  describe('#create', function () {
    afterEach(function () {
      return knex('supervisor-accesses').delete();
    });

    it('should save a supervisor access', async function () {
      // given
      const sessionId = databaseBuilder.factory.buildSession().id;
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      // when
      await supervisorAccessRepository.create({ sessionId, userId });

      // then
      const supervisorAccessInDB = await knex.from('supervisor-accesses').first();
      expect(supervisorAccessInDB.sessionId).to.equal(sessionId);
      expect(supervisorAccessInDB.userId).to.equal(userId);
    });
  });
});
