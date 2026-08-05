import sinon from 'sinon';

import { anonymizeServices } from '../../../../../../src/privacy/domain/services/anonymize-services/index.js';
import { featureToggles } from '../../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Privacy | Domain | UseCase | Services | Anonymize | anonymize-user-by-itself', function () {
  const userId = '123';
  let dependencies;

  beforeEach(async function () {
    dependencies = {
      featureToggles,
      learnersApiRepository: { hasBeenLearner: sinon.stub().resolves(false) },
      campaignParticipationsApiRepository: {
        hasCampaignParticipations: sinon.stub(),
      },
      candidatesApiRepository: {
        hasBeenCandidate: sinon.stub().resolves(false),
      },
      userTeamsApiRepository: {
        getUserTeamsInfo: sinon.stub().resolves({
          isPixAgent: false,
          isOrganizationMember: false,
          isCertificationCenterMember: false,
        }),
      },
    };
  });

  context('When feature flag is enabled', function () {
    context('When user is eligible', function () {
      it('returns true', async function () {
        // given
        await featureToggles.set('isSelfAccountDeletionEnabled', true);
        // when
        const result = await anonymizeServices.canAnonymizeItself({ userId, ...dependencies });

        // then
        expect(result).to.be.true;
      });
    });

    context('When user has been a learner', function () {
      it('returns false', async function () {
        // given
        dependencies.learnersApiRepository.hasBeenLearner.withArgs({ userId }).resolves(true);

        // when
        const result = await anonymizeServices.canAnonymizeItself({ userId, ...dependencies });

        // then
        expect(result).to.be.false;
      });
    });

    context('When user has participated in a campaign', function () {
      it('returns false', async function () {
        // given
        dependencies.campaignParticipationsApiRepository.hasCampaignParticipations.withArgs({ userId }).resolves(true);

        // when
        const result = await anonymizeServices.canAnonymizeItself({ userId, ...dependencies });

        // then
        expect(result).to.be.false;
      });
    });

    context('when user has not participated in a campaign', function () {
      it('returns true', async function () {
        // given
        dependencies.campaignParticipationsApiRepository.hasCampaignParticipations.withArgs({ userId }).resolves(false);

        // when
        const result = await anonymizeServices.canAnonymizeItself({ userId, ...dependencies });

        // then
        expect(result).to.be.true;
      });
    });

    context('User has been a candidate to certification', function () {
      it('returns false', async function () {
        // given
        dependencies.candidatesApiRepository.hasBeenCandidate.withArgs({ userId }).resolves(true);

        // when
        const result = await anonymizeServices.canAnonymizeItself({ userId, ...dependencies });

        // then
        expect(result).to.be.false;
      });
    });

    context('User if user is a Pix agent', function () {
      it('returns false', async function () {
        // given
        dependencies.userTeamsApiRepository.getUserTeamsInfo.withArgs({ userId }).resolves({
          isPixAgent: true,
          isOrganizationMember: false,
          isCertificationCenterMember: false,
        });

        // when
        const result = await anonymizeServices.canAnonymizeItself({ userId, ...dependencies });

        // then
        expect(result).to.be.false;
      });
    });

    context('User if user is member of an organization', function () {
      it('returns false', async function () {
        // given
        dependencies.userTeamsApiRepository.getUserTeamsInfo.withArgs({ userId }).resolves({
          isPixAgent: false,
          isOrganizationMember: true,
          isCertificationCenterMember: false,
        });

        // when
        const result = await anonymizeServices.canAnonymizeItself({ userId, ...dependencies });

        // then
        expect(result).to.be.false;
      });
    });

    context('User if user is member of a certification center', function () {
      it('returns false', async function () {
        // given
        dependencies.userTeamsApiRepository.getUserTeamsInfo.withArgs({ userId }).resolves({
          isPixAgent: false,
          isOrganizationMember: false,
          isCertificationCenterMember: true,
        });

        // when
        const result = await anonymizeServices.canAnonymizeItself({ userId, ...dependencies });

        // then
        expect(result).to.be.false;
      });
    });
  });

  context('Feature flag is disabled', function () {
    beforeEach(async function () {
      await featureToggles.set('isSelfAccountDeletionEnabled', false);
    });

    context('When user is eligible', function () {
      it('returns false', async function () {
        // given

        // when
        const result = await anonymizeServices.canAnonymizeItself({ userId: '123', ...dependencies });

        // then
        expect(result).to.be.false;
      });
    });
  });
});
