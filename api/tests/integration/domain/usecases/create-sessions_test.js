const { expect, databaseBuilder, knex, catchErr } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');

describe('Integration | UseCases | create-sessions', function () {
  describe('When there is a validation error', function () {
    it('should not save anything in database', async function () {
      // given
      const sessions = [
        {
          address: 'Site 1',
          room: 'Salle 1',
          date: '2022-03-12',
          time: '01:00',
          examiner: 'Pierre',
          description: '',
          certificationCandidates: [
            {
              firstName: 'CandidateWithMissingInfo',
            },
          ],
        },
      ];

      databaseBuilder.factory.buildCertificationCenter({ id: 99 });
      await databaseBuilder.commit();

      // when
      await catchErr(usecases.createSessions)({
        sessions,
        certificationCenterId: '99',
      });

      // then
      const result = await knex('sessions');
      expect(result).to.have.length(0);
    });
  });
});
