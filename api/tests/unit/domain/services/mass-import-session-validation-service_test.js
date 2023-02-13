const { expect, sinon } = require('../../../test-helper');
const massImportSessionValidationService = require('../../../../lib/domain/services/mass-import-session-validation-service');
const sessionCodeService = require('../../../../lib/domain/services/session-code-service');
const sessionRepository = require('../../../../lib/infrastructure/repositories/sessions/session-repository');
const certificationCpfCountryRepository = require('../../../../lib/infrastructure/repositories/certification-cpf-country-repository');
const certificationCpfCityRepository = require('../../../../lib/infrastructure/repositories/certification-cpf-city-repository');
const complementaryCertificationRepository = require('../../../../lib/infrastructure/repositories/complementary-certification-repository');
const Session = require('../../../../lib/domain/models/Session');

describe('Unit | Service | mass-import-session-validation-service', function () {
  describe('#checkMassImportSessions', function () {
    describe('when session is scheduled in the past', function () {
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

      it('should return sessions to save and massImportSessionErrorManager', async function () {
        // given
        const certificationCenter = 'centre de certifix';
        const certificationCenterId = 1234;
        const sessionScheduledInThePastData = {
          sessionId: undefined,
          line: 12,
          address: 'Site 1',
          room: 'Salle 1',
          date: '2020-03-12',
          time: '01:00',
          examiner: 'Pierre',
          description: 'desc',
          certificationCandidates: [],
        };

        sinon.stub(sessionRepository, 'isSessionExisting').resolves(false);
        sinon.stub(sessionCodeService, 'getNewSessionCode').returns('code');
        sinon.stub(Session.prototype, 'generateSupervisorPassword').callsFake(function () {
          this.supervisorPassword = 'toto';
        });
        // when
        const { sessionsToSave, massImportSessionErrorManager } =
          await massImportSessionValidationService.checkMassImportSessions({
            sessions: [sessionScheduledInThePastData],
            isSco: false,
            certificationCenter,
            certificationCenterId,
          });

        //then
        const expectedSessionsToSave = new Session({
          ...sessionScheduledInThePastData,
          accessCode: 'code',
          certificationCenter,
          certificationCenterId,
          supervisorPassword: 'toto',
        });

        expect(sessionsToSave).to.deepEqualArray([expectedSessionsToSave]);
        expect(massImportSessionErrorManager.blockingErrors).to.deep.equal([
          {
            12: ['Une session ne peut pas être programmée dans le passé'],
          },
        ]);
      });
    });
  });
});
