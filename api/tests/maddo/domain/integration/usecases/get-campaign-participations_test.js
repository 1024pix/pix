import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { usecases } from '../../../../../src/maddo/domain/usecases/index.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Maddo | UseCase | get-campaign-participations', function () {
  describe('#getCampaignParticipations', function () {
    let organization, clientId, campaign, user1, user2;

    beforeEach(async function () {
      // given
      organization = databaseBuilder.factory.buildOrganization({
        identityProviderForCampaigns: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
      });

      clientId = 'test-client';

      const frameworkId = databaseBuilder.factory.learningContent.buildFramework().id;
      const areaId = databaseBuilder.factory.learningContent.buildArea({ frameworkId }).id;
      const competenceId = databaseBuilder.factory.learningContent.buildCompetence({ areaId }).id;
      const tube = databaseBuilder.factory.learningContent.buildTube({ competenceId });
      const skillId = databaseBuilder.factory.learningContent.buildSkill({ tubeId: tube.id, status: 'actif' }).id;

      user1 = databaseBuilder.factory.buildUser({ firstName: 'John', lastName: 'Doe' });
      user2 = databaseBuilder.factory.buildUser({ firstName: 'Jane', lastName: 'Smith' });

      const organizationLearner1 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId: user1.id,
        firstName: 'Jane',
        lastName: 'Smith',
      });

      const organizationLearner2 = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: organization.id,
        userId: user2.id,
        firstName: 'John',
        lastName: 'Doe',
      });

      campaign = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.ASSESSMENT,
        organizationId: organization.id,
      });
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId });

      const participation1 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.SHARED,
        organizationLearnerId: organizationLearner1.id,
        userId: user1.id,
        masteryRate: 0.8,
        validatedSkillsCount: 10,
        createdAt: new Date('2025-01-01'),
      });

      const ke = databaseBuilder.factory.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId,
        userId: user1.id,
      });

      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId: participation1.id,
        snapshot: new KnowledgeElementCollection([ke]).toSnapshot(),
      });

      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.STARTED,
        organizationLearnerId: organizationLearner2.id,
        userId: user2.id,
        masteryRate: null,
        createdAt: new Date('2026-01-01'),
      });

      await databaseBuilder.commit();
    });

    context('when organization has an identity provider', function () {
      it('should add authenticationId to participations when users have matching authentication methods', async function () {
        // given
        const tag = databaseBuilder.factory.buildTag();
        databaseBuilder.factory.buildOrganizationTag({ organizationId: organization.id, tagId: tag.id });

        databaseBuilder.factory.buildClientApplication({
          clientId,
          jurisdiction: { rules: [{ name: 'tags', value: [tag.name] }] },
        });
        // Create authentication methods with external identifiers
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
          userId: user1.id,
          externalIdentifier: 'external-id-user1',
        });
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
          userId: user2.id,
          externalIdentifier: 'external-id-user2',
        });

        await databaseBuilder.commit();

        // when
        const { models } = await usecases.getCampaignParticipations({
          campaignId: campaign.id,
          clientId,
        });

        // then
        expect(models).to.have.lengthOf(2);

        const participationWithUser1 = models.find((p) => p.participantFirstName === 'Jane');
        const participationWithUser2 = models.find((p) => p.participantFirstName === 'John');

        expect(participationWithUser1.authenticationId).to.equal('external-id-user1');
        expect(participationWithUser2.authenticationId).to.equal('external-id-user2');
      });
    });
    context('when a sort param is added', function () {
      it('should sort by the given param', async function () {
        //given
        const sort = [{ value: 'createdAt', type: 'asc' }];

        // when
        const { models } = await usecases.getCampaignParticipations({
          campaignId: campaign.id,
          clientId,
          sort,
        });

        // then
        expect(models).to.have.lengthOf(2);
        expect(models[0].createdAt).to.deep.equal(new Date('2025-01-01'));
        expect(models[1].createdAt).to.deep.equal(new Date('2026-01-01'));
      });
    });
  });
});
