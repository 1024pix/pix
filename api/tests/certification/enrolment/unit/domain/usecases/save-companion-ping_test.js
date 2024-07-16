import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import { CompanionPingInfo } from '../../../../../../src/certification/enrolment/domain/models/CompanionPingInfo.js';
import { saveCompanionPing } from '../../../../../../src/certification/enrolment/domain/usecases/save-companion-ping.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | save-companion-ping', function () {
  let certificationCandidateRepository;
  let temporaryCompanionStorageService;

  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda, _transactionConfig) => lambda());

    certificationCandidateRepository = { findCompanionPingInfoByUserId: sinon.stub() };
    temporaryCompanionStorageService = { save: sinon.stub() };
  });

  describe('when the user is in a running session', function () {
    it('should persist the companion ping in redis', async function () {
      // given
      const userId = 123;
      const certificationCandidateCompanion = new CompanionPingInfo({
        sessionId: 99,
        id: 101,
      });
      certificationCandidateRepository.findCompanionPingInfoByUserId
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
