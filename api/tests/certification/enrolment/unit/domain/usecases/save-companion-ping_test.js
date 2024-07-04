import { CertificationCandidateCompanion } from '../../../../../../src/certification/enrolment/domain/models/CertificationCandidateCompanion.js';
import { saveCompanionPing } from '../../../../../../src/certification/enrolment/domain/usecases/save-companion-ping.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | save-companion-ping', function () {
  describe('#saveCompanionPing', function () {
    let certificationCandidateRepository;
    let temporaryCompanionStorageService;

    beforeEach(function () {
      certificationCandidateRepository = { findCertificationCandidateCompanionInfoByUserId: sinon.stub() };
      temporaryCompanionStorageService = { save: sinon.stub() };
    });

    describe('when the user is in a running session', function () {
      it('should persist the companion ping in redis', async function () {
        // given
        const userId = 123;
        const certificationCandidateCompanion = new CertificationCandidateCompanion({
          sessionId: 99,
          id: 101,
        });
        certificationCandidateRepository.findCertificationCandidateCompanionInfoByUserId
          .withArgs({ userId })
          .resolves(certificationCandidateCompanion);

        // when
        await saveCompanionPing({
          userId,
          certificationCandidateRepository,
          temporaryCompanionStorageService,
        });

        // then
        expect(temporaryCompanionStorageService.save).to.have.been.calledWithExactly(certificationCandidateCompanion);
      });
    });
  });
});
