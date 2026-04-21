import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { usecases } from '../../../../../src/maddo/domain/usecases/index.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';

import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Maddo | UseCase | get-campaign-participations', function () {
  describe('#getCampaignParticipations', function () {
    context('when organization has an identity provider', function () {
      it('should add authenticationId to participations when users have matching authentication methods', async function () {
        // given
        const organization = databaseBuilder.factory.buildOrganization({
          identityProviderForCampaigns: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
        });

        const tag = databaseBuilder.factory.buildTag();
        databaseBuilder.factory.buildOrganizationTag({ organizationId: organization.id, tagId: tag.id });

        const clientId = 'test-client';
        databaseBuilder.factory.buildClientApplication({
          clientId,
          jurisdiction: { rules: [{ name: 'tags', value: [tag.name] }] },
        });

        const frameworkId = databaseBuilder.factory.learningContent.buildFramework().id;
        const areaId = databaseBuilder.factory.learningContent.buildArea({ frameworkId }).id;
        const competenceId = databaseBuilder.factory.learningContent.buildCompetence({ areaId }).id;
        const tube = databaseBuilder.factory.learningContent.buildTube({ competenceId });
        const skillId = databaseBuilder.factory.learningContent.buildSkill({ tubeId: tube.id, status: 'actif' }).id;

        const user1 = databaseBuilder.factory.buildUser({ firstName: 'John', lastName: 'Doe' });
        const user2 = databaseBuilder.factory.buildUser({ firstName: 'Jane', lastName: 'Smith' });

        // Create authentication methods with external identifiers
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
          userId: user1.id,
          externalIdentifier: 'external-id-user1',
        });
        databaseBuilder.factory.buildAuthenticationMethod.withGarAsIdentityProvider({
          userId: user2.id,
          externalIdentifier: 'external-id-user2',
        });

        const organizationLearner1 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          userId: user1.id,
          firstName: 'John',
          lastName: 'Doe',
        });

        const organizationLearner2 = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: organization.id,
          userId: user2.id,
          firstName: 'Jane',
          lastName: 'Smith',
        });

        const campaign = databaseBuilder.factory.buildCampaign({
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
        });

        await databaseBuilder.commit();

        // when
        const { models } = await usecases.getCampaignParticipations({
          campaignId: campaign.id,
          clientId,
        });

        // then
        expect(models).to.have.lengthOf(2);

        const participationWithUser1 = models.find((p) => p.participantFirstName === 'John');
        const participationWithUser2 = models.find((p) => p.participantFirstName === 'Jane');

        expect(participationWithUser1.authenticationId).to.equal('external-id-user1');
        expect(participationWithUser2.authenticationId).to.equal('external-id-user2');
      });
    });
  });
});
