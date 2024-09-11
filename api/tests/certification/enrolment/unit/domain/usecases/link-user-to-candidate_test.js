import { linkUserToCandidate } from '../../../../../../src/certification/enrolment/domain/usecases/link-user-to-candidate.js';
import { CERTIFICATION_VERSIONS } from '../../../../../../src/certification/shared/domain/models/CertificationVersion.js';
import { UserNotAuthorizedToCertifyError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Domain | UseCase | link-user-to-candidate', function () {
  let candidateRepository;
  let placementProfileService;
  let dependencies;
  let clock;
  let now;
  const userId = 2;

  beforeEach(function () {
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
        placementProfileService.getPlacementProfile
          .withArgs({ userId, limitDate: now, version: CERTIFICATION_VERSIONS.V3 })
          .resolves(placementProfile);

        const candidate = domainBuilder.certification.enrolment.buildCandidate({
          userId: null,
          subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
        });

        // when
        const error = await catchErr(linkUserToCandidate)({
          candidate,
          sessionVersion: CERTIFICATION_VERSIONS.V3,
          ...dependencies,
        });

        //then
        expect(error).to.be.instanceOf(UserNotAuthorizedToCertifyError);
      });
    });

    context('when user profile is certifiable', function () {
      it('should link user', async function () {
        // given
        const placementProfile = { isCertifiable: sinon.stub().returns(true) };
        placementProfileService.getPlacementProfile
          .withArgs({ userId, limitDate: now, version: CERTIFICATION_VERSIONS.V3 })
          .resolves(placementProfile);

        const candidate = domainBuilder.certification.enrolment.buildCandidate({
          userId: null,
          subscriptions: [domainBuilder.certification.enrolment.buildCoreSubscription()],
        });

        candidateRepository.update.withArgs(candidate).resolves();

        // when
        await linkUserToCandidate({
          candidate,
          sessionVersion: CERTIFICATION_VERSIONS.V3,
          ...dependencies,
        });

        //then
        expect(candidateRepository.update).to.have.been.calledWith(candidate);
      });
    });
  });
});
