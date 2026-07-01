import sinon from 'sinon';

import { reconcileCandidate } from '../../../../../../src/certification/enrolment/domain/usecases/reconcile-candidate.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Enrolment | Unit | Domain | UseCase | reconcile-candidate', function () {
  let candidateRepository;
  let dependencies;
  let eventAdapter;
  let clock;
  let now;
  const userId = 2;

  beforeEach(function () {
    candidateRepository = {
      update: sinon.stub(),
    };

    eventAdapter = {
      onCandidateReconciled: sinon.stub(),
    };

    dependencies = {
      userId,
      candidateRepository,
      eventAdapter,
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
    const result = await reconcileCandidate({
      candidate,
      ...dependencies,
    });

    //then
    expect(candidateRepository.update).to.have.been.calledWith(candidate);
    expect(candidate.userId).to.equal(userId);
    expect(candidate.reconciledAt).to.deep.equal(now);
    expect(eventAdapter.onCandidateReconciled).to.have.been.calledWithExactly({ candidate });
    expect(result).to.deep.equal(candidate);
  });
});
