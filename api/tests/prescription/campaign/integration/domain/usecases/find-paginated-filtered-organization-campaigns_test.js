import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { KnowledgeElement } from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { CampaignReport } from '../../../../../../src/shared/domain/read-models/CampaignReport.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | UseCase | find-paginated-filtered-organization-campaigns', function () {
  context('when cover rate is false', function () {
    it('should return paginated campaign reports for a given organization without cover rate', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildCampaign({ organizationId });
      databaseBuilder.factory.buildMembership({ organizationId, userId });
      await databaseBuilder.commit();
      // when
      const result = await usecases.findPaginatedFilteredOrganizationCampaigns({
        locale: 'fr',
        organizationId,
        page: { number: 1, size: 4 },
        userId,
      });

      //then
      expect(result.models[0]).to.be.an.instanceof(CampaignReport);
      expect(result.models[0].tubes).to.be.undefined;
    });
  });
  context('when cover rate is true', function () {
    it('should return paginated campaign reports for a given organization with cover rate', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      const frameworkId = databaseBuilder.factory.learningContent.buildFramework().id;

      const areaId = databaseBuilder.factory.learningContent.buildArea({ frameworkId }).id;

      const competenceId = databaseBuilder.factory.learningContent.buildCompetence({ areaId }).id;

      const tubeId = databaseBuilder.factory.learningContent.buildTube({ competenceId }).id;

      const skillId = databaseBuilder.factory.learningContent.buildSkill({ tubeId, status: 'actif' }).id;

      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId });

      databaseBuilder.factory.buildMembership({ organizationId, userId });

      const participationUser = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId,
      });

      const ke = databaseBuilder.factory.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId,
        userId: participationUser.userId,
      });

      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId: participationUser.id,
        snapshot: new KnowledgeElementCollection([ke]).toSnapshot(),
      });

      await databaseBuilder.commit();
      // when
      const result = await usecases.findPaginatedFilteredOrganizationCampaigns({
        locale: 'fr',
        organizationId,
        page: { number: 1, size: 4 },
        userId,
        withCoverRate: true,
      });

      //then
      expect(result.models[0]).to.be.an.instanceof(CampaignReport);
      expect(result.models[0].tubes[0]).to.deep.equal({
        id: 'tubeIdA',
        competenceId: 'competenceIdA',
        practicalTitle: 'practicalTitle FR Tube A',
        practicalDescription: 'practicalDescription FR Tube A',
        maxLevel: 2,
        meanLevel: 2,
      });
    });
  });
});
