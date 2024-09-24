import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import { reconcileCandidate } from '../../../../../../src/certification/enrolment/domain/usecases/reconcile-candidate.js';
import { UserNotAuthorizedToCertifyError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Domain | UseCase | reconcile-candidate', function () {
  let candidateRepository;
  let placementProfileService;
  let dependencies;
  let clock;
  let now;
  const userId = 2;

  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
    candidateRepository = {
      update: sinon.stub(),
    };
    placementProfileService = {
      getPlacementProfile: sinon.stub(),
    };
    dependencies = {
      userId,
      candidateRepository,
      placementProfileService,
    };

    now = new Date('2019-01-01T05:06:07Z');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  context('when a candidate has subscribed to a core certification', function () {
    context('when user profile is not certifiable', function () {
      it('should throw an error', async function () {
        // given
        const placementProfile = { isCertifiable: sinon.stub().returns(false) };
        placementProfileService.getPlacementProfile.withArgs({ userId, limitDate: now }).resolves(placementProfile);

        const candidate = domainBuilder.certification.enrolment.buildCandidate({
          userId: null,
          subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
        });

        // when
        const error = await catchErr(reconcileCandidate)({
          candidate,
          ...dependencies,
        });

        //then
        expect(error).to.be.instanceOf(UserNotAuthorizedToCertifyError);
        expect(candidateRepository.update).to.not.have.been.calledWith(candidate);
      });
    });

    context('when user profile is certifiable', function () {
      it('should link user', async function () {
        // given
        const placementProfile = { isCertifiable: sinon.stub().returns(true) };
        placementProfileService.getPlacementProfile.withArgs({ userId, limitDate: now }).resolves(placementProfile);

        const candidate = domainBuilder.certification.enrolment.buildCandidate({
          userId: null,
          reconciledAt: null,
          subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
        });

        candidateRepository.update.withArgs(candidate).resolves();

        // when
        await reconcileCandidate({
          candidate,
          ...dependencies,
        });

        //then
        expect(candidateRepository.update).to.have.been.calledWith(candidate);
        expect(candidate.userId).to.equal(userId);
        expect(candidate.reconciledAt).to.deep.equal(now);
      });
    });
  });
});
