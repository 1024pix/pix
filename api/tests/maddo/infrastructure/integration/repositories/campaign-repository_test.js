import { Campaign } from '../../../../../src/maddo/domain/models/Campaign.ts';
import { findByOrganizationId } from '../../../../../src/maddo/infrastructure/repositories/campaign-repository.js';
import { KnowledgeElementCollection } from '../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/index.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Maddo | Infrastructure | Repositories | Integration | campaign', function () {
  describe('#findByOrganizationId', function () {
    it('lists campaigns belonging to organization with given id', async function () {
      // given
      const organization = databaseBuilder.factory.buildOrganization();
      const { id: otherOrganizationId } = databaseBuilder.factory.buildOrganization();
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      const campaign1 = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        targetProfileId: targetProfile.id,
      });
      const campaign2 = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        targetProfileId: targetProfile.id,
      });
      databaseBuilder.factory.buildCampaign({ organizationId: otherOrganizationId });

      const frameworkId = databaseBuilder.factory.learningContent.buildFramework().id;
      const areaId = databaseBuilder.factory.learningContent.buildArea({ frameworkId }).id;
      const competence = databaseBuilder.factory.learningContent.buildCompetence({ areaId });
      const tube = databaseBuilder.factory.learningContent.buildTube({ competenceId: competence.id });
      const skill = databaseBuilder.factory.learningContent.buildSkill({ tubeId: tube.id, status: 'actif' });

      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign1.id, skillId: skill.id });
      databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign2.id, skillId: skill.id });
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildMembership({ organizationId: organization.id, userId });

      const participationUser = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1.id,
        userId,
      });

      const ke = databaseBuilder.factory.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: skill.id,
        userId: participationUser.userId,
      });

      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId: participationUser.id,
        snapshot: new KnowledgeElementCollection([ke]).toSnapshot(),
      });

      const participationUser2 = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2.id,
        userId,
      });

      const ke2 = databaseBuilder.factory.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.INVALIDATED,
        skillId: skill.id,
        userId: participationUser.userId,
      });

      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId: participationUser2.id,
        snapshot: new KnowledgeElementCollection([ke2]).toSnapshot(),
      });

      await databaseBuilder.commit();

      // when
      const campaigns = await findByOrganizationId(organization.id);

      // then
      expect(campaigns).to.deep.equal([
        new Campaign({
          id: campaign1.id,
          name: campaign1.name,
          type: campaign1.type,
          targetProfileName: targetProfile.name,
          code: campaign1.code,
          createdAt: campaign1.createdAt,
          tubes: [
            {
              competenceId: competence.id,
              id: tube.id,
              maxLevel: skill.level,
              meanLevel: 2,
              practicalDescription: tube.practicalDescription_i18n['fr'],
              practicalTitle: tube.practicalTitle_i18n['fr'],
            },
          ],
        }),
        new Campaign({
          id: campaign2.id,
          name: campaign2.name,
          type: campaign2.type,
          targetProfileName: targetProfile.name,
          code: campaign2.code,
          createdAt: campaign2.createdAt,
          tubes: [
            {
              competenceId: competence.id,
              id: tube.id,
              maxLevel: skill.level,
              meanLevel: 0,
              practicalDescription: tube.practicalDescription_i18n['fr'],
              practicalTitle: tube.practicalTitle_i18n['fr'],
            },
          ],
        }),
      ]);
    });
  });
});
