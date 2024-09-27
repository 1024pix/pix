import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import { reconcileCandidate } from '../../../../../../src/certification/enrolment/domain/usecases/reconcile-candidate.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Domain | UseCase | reconcile-candidate', function () {
  let candidateRepository;
  let dependencies;
  let clock;
  let now;
  const userId = 2;

  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
    candidateRepository = {
      update: sinon.stub(),
    };
    dependencies = {
      userId,
      candidateRepository,
    };

    now = new Date('2019-01-01T05:06:07Z');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  it('should link user', async function () {
    // given
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
