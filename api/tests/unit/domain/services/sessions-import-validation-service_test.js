const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const sessionsImportValidationService = require('../../../../lib/domain/services/sessions-import-validation-service');
const { SessionWithIdAndInformationOnMassImportError } = require('../../../../lib/domain/errors');
const { UnprocessableEntityError } = require('../../../../lib/application/http-errors');

describe('Unit | Service | sessions import validation Service', function () {
  describe('#validate', function () {
    let clock;
    let sessionRepository;
    let certificationCourseRepository;

    beforeEach(function () {
      clock = sinon.useFakeTimers({
        now: new Date('2023-01-01'),
        toFake: ['Date'],
      });
      sessionRepository = { isSessionExisting: sinon.stub() };
      certificationCourseRepository = { findCertificationCoursesBySessionId: sinon.stub() };
    });

    afterEach(async function () {
      clock.restore();
    });

    context('when the parsed data is valid', function () {
      context('when the session has not started yet', function () {
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
            expect(
              await sessionsImportValidationService.validate({
                sessions,
                sessionRepository,
                certificationCourseRepository,
              })
            ).to.not.throw;
          });
        });

        context('when there is a sessionId', function () {
          it('should not throw', async function () {
            // given
            const sessionId = 1;
            const sessionScheduledInThePastData = {
              sessionId,
              certificationCandidates: [],
            };

            const sessions = [sessionScheduledInThePastData];
            sessionRepository.isSessionExisting.withArgs({ ...sessions[0] }).resolves(false);
            certificationCourseRepository.findCertificationCoursesBySessionId
              .withArgs({
                sessionId,
              })
              .resolves([]);

            // when
            // then
            expect(
              await sessionsImportValidationService.validate({
                sessions,
                sessionRepository,
                certificationCourseRepository,
              })
            ).to.not.throw;
          });
        });
      });
    });

    context('when the session has already started', function () {
      it('should throw an UnprocessableEntityError', async function () {
        const sessions = [
          {
            sessionId: 1234,
            certificationCandidates: [],
          },
        ];

        certificationCourseRepository.findCertificationCoursesBySessionId
          .withArgs({ sessionId: 1234 })
          .resolves([domainBuilder.buildCertificationCourse({ sessionId: 1234 })]);

        // when
        const error = await catchErr(sessionsImportValidationService.validate)({
          sessions,
          sessionRepository,
          certificationCourseRepository,
        });

        // then
        expect(error).to.be.instanceOf(UnprocessableEntityError);
        expect(error.message).to.equal("Impossible d'ajouter un candidat à une session qui a déjà commencé.");
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
            sessionRepository,
            certificationCourseRepository,
          });

          // then
          expect(error.message).to.equal('Une session ne peut pas être programmée dans le passé');
        });
      });
    });

    context('conflicting session information validation', function () {
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
            sessionRepository,
            certificationCourseRepository,
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
          expect(
            sessionsImportValidationService.validate({ sessions, sessionRepository, certificationCourseRepository })
          ).not.to.throw;
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
          certificationCourseRepository,
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
