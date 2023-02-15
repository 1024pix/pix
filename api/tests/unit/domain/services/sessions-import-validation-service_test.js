const { catchErr, expect, sinon } = require('../../../test-helper');
const sessionsImportValidationService = require('../../../../lib/domain/services/sessions-import-validation-service');
const { SessionWithIdAndInformationOnMassImportError } = require('../../../../lib/domain/errors');
const { UnprocessableEntityError } = require('../../../../lib/application/http-errors');

describe('Unit | Service | sessions import validation Service', function () {
  describe('#validate', function () {
    let clock;
    let sessionRepository;

    beforeEach(function () {
      clock = sinon.useFakeTimers({
        now: new Date('2023-01-01'),
        toFake: ['Date'],
      });
      sessionRepository = { isSessionExisting: sinon.stub() };
    });

    afterEach(async function () {
      clock.restore();
    });

    context('when the parsed data is valid', function () {
      context('when there is no sessionId', function () {
        it('should not throw', async function () {
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
          expect(await sessionsImportValidationService.validate({ sessions })).to.not.throw;
        });
      });

      context('when there is a sessionId', function () {
        it('should not throw', async function () {
          // given
          const sessionScheduledInThePastData = {
            sessionId: 1,
            certificationCandidates: [],
          };

          const sessions = [sessionScheduledInThePastData];
          sessionRepository.isSessionExisting.withArgs({ ...sessions[0] }).resolves(false);

          // when
          // then
          expect(await sessionsImportValidationService.validate({ sessions, sessionRepository })).to.not.throw;
        });
      });
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

    context('when there already is an existing session with the same data as a newly imported one', function () {
      it('should throw an error', async function () {
        // given
        const sessions = [{ sessionId: 1234 }];
        sessionRepository.isSessionExisting.withArgs({ ...sessions[0] }).resolves(true);

        // when
        const err = await catchErr(sessionsImportValidationService.validate)({
          sessions,
          sessionRepository,
        });

        // then
        expect(err).to.be.instanceOf(UnprocessableEntityError);
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
