const { catchErr, expect, sinon } = require('../../../test-helper');
const sessionsImportValidationService = require('../../../../lib/domain/services/sessions-import-validation-service');
const { SessionWithIdAndInformationOnMassImportError } = require('../../../../lib/domain/errors');

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

    context('unnecessary session information validation', function () {
      context('when there is a sessionId and session information', function () {
        it('should throw', async function () {
          const sessions = [
            {
              ..._createValidSessionData(),
              sessionId: 1234,
              certificationCandidates: [],
            },
          ];

          // when
          const error = await catchErr(sessionsImportValidationService.validate)({
            sessions,
          });

          // then
          expect(error).to.be.an.instanceOf(SessionWithIdAndInformationOnMassImportError);
          expect(error.message).to.equal(
            'Merci de ne pas renseigner les informations de session pour la session: 1234'
          );
        });
      });

      context('when there is session information but no sessionId', function () {
        it('should not throw', async function () {
          const sessions = [
            {
              ..._createValidSessionData(),
              certificationCandidates: [],
            },
          ];

          // when
          // then
          expect(sessionsImportValidationService.validate({ sessions })).not.to.throw;
        });
      });

      context('when there is a sessionId but no session information', function () {
        it('should not throw', async function () {
          const sessions = [
            {
              certificationCandidates: [],
              sessionId: 123,
            },
          ];

          // when
          // then
          expect(sessionsImportValidationService.validate({ sessions })).not.to.throw;
        });
      });
    });
  });
});

function _createValidSessionData() {
  return {
    sessionId: undefined,
    address: 'Site 1',
    room: 'Salle 1',
    date: '2023-03-12',
    time: '01:00',
    examiner: 'Pierre',
    description: 'desc',
    certificationCandidates: [],
  };
}
