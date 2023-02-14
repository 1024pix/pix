const { catchErr, expect, sinon } = require('../../../test-helper');
const sessionsImportValidationService = require('../../../../lib/domain/services/sessions-import-validation-service');

describe('Unit | Service | sessions import validation Service', function () {
  describe('#validate', function () {
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers({
        now: new Date('2023-01-01'),
        toFake: ['Date'],
      });
    });

    afterEach(async function () {
      clock.restore();
    });

    context('date validation', function () {
      context('when at least one session is scheduled in the past', function () {
        it('should throw', async function () {
          // given
          const sessionScheduledInThePastData = {
            sessionId: undefined,
            address: 'Site 1',
            room: 'Salle 1',
            date: '2020-03-12',
            time: '01:00',
            examiner: 'Pierre',
            description: 'desc',
            certificationCandidates: [],
          };

          const sessions = [sessionScheduledInThePastData];

          // when
          const error = await catchErr(sessionsImportValidationService.validate)({
            sessions,
          });

          // then
          expect(error.message).to.equal('Une session ne peut pas être programmée dans le passé');
        });
      });

      context('when no session is scheduled in the past', function () {
        it('should not throw', function () {
          // given
          const sessionScheduledInThePastData = {
            sessionId: undefined,
            address: 'Site 1',
            room: 'Salle 1',
            date: '2024-03-12',
            time: '01:00',
            examiner: 'Pierre',
            description: 'desc',
            certificationCandidates: [],
          };

          const sessions = [sessionScheduledInThePastData];

          // when
          // then
          expect(sessionsImportValidationService.validate({ sessions })).to.not.throw;
        });
      });
    });
  });
});
