import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { PIX_COUNT_BY_LEVEL } from '../../../../../../src/shared/domain/constants.js';
import { Assessment, KnowledgeElement } from '../../../../../../src/shared/domain/models/index.js';
import { databaseBuilder, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Prescription Integration | UseCase | get-user-campaign-assessment-result', function () {
  context('when campaign is of type ASSESSMENT', function () {
    it('should return an participant assessment result based on the user profile', async function () {
      // given
      const skillIds = ['acquisA', 'acquisB'];
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.ASSESSMENT,
      }).id;
      skillIds.map((skillId) =>
        databaseBuilder.factory.buildCampaignSkill({
          campaignId,
          skillId,
        }),
      );
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId,
        sharedAt: null,
        status: CampaignParticipationStatuses.TO_SHARE,
      }).id;
      const assessmentDB = databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId,
        type: Assessment.types.CAMPAIGN,
      });
      databaseBuilder.factory.learningContent.buildArea({
        id: 'monAreaId',
      });
      databaseBuilder.factory.learningContent.buildCompetence({
        id: 'maCompetenceId',
        areaId: 'monAreaId',
        name_i18n: {
          fr: 'nom de la compétence',
        },
        skillIds,
      });
      skillIds.map((id, index) => {
        databaseBuilder.factory.learningContent.buildSkill({
          id,
          competenceId: 'maCompetenceId',
          pixValue: PIX_COUNT_BY_LEVEL,
          status: 'actif',
          tubeId: 'monTubeId',
          level: index + 1,
        });
        databaseBuilder.factory.buildKnowledgeElement({
          skillId: id,
          status: KnowledgeElement.StatusType.VALIDATED,
          source: KnowledgeElement.SourceType.DIRECT,
          userId,
          assessmentId: assessmentDB.id,
        });
      });
      await databaseBuilder.commit();

      // when
      const participantAssessmentResult = await usecases.getUserCampaignAssessmentResult({
        userId,
        campaignId,
        locale: 'fr',
      });

      // then
      expect(participantAssessmentResult.masteryRate).to.equal(1);
      expect(participantAssessmentResult.competenceResults.length).to.equal(1);
      sinon.assert.match(participantAssessmentResult.competenceResults[0], {
        id: 'maCompetenceId',
      });
    });
  });
  context('when campaign is of type EXAM', function () {
    it('should return an participant assessment result based on the user profile', async function () {
      // given
      const skillIds = ['acquisA', 'acquisB'];
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.EXAM,
      }).id;
      skillIds.map((skillId) =>
        databaseBuilder.factory.buildCampaignSkill({
          campaignId,
          skillId,
        }),
      );
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId,
        sharedAt: null,
        status: CampaignParticipationStatuses.TO_SHARE,
      }).id;
      const assessmentDB = databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId,
        type: Assessment.types.CAMPAIGN,
      });
      databaseBuilder.factory.learningContent.buildArea({
        id: 'monAreaId',
      });
      databaseBuilder.factory.learningContent.buildCompetence({
        id: 'maCompetenceId',
        areaId: 'monAreaId',
        name_i18n: {
          fr: 'nom de la compétence',
        },
        skillIds,
      });
      const domainKEs = skillIds.map((id, index) => {
        databaseBuilder.factory.learningContent.buildSkill({
          id,
          competenceId: 'maCompetenceId',
          pixValue: PIX_COUNT_BY_LEVEL,
          status: 'actif',
          tubeId: 'monTubeId',
          level: index + 1,
        });
        return domainBuilder.buildKnowledgeElement({
          skillId: id,
          status: KnowledgeElement.StatusType.VALIDATED,
          source: KnowledgeElement.SourceType.DIRECT,
          userId,
          assessmentId: assessmentDB.id,
        });
      });
      const knowledgeElementsBefore = new KnowledgeElementCollection(domainKEs);
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId,
        snapshot: knowledgeElementsBefore.toSnapshot(),
      });
      await databaseBuilder.commit();

      // when
      const participantAssessmentResult = await usecases.getUserCampaignAssessmentResult({
        userId,
        campaignId,
        locale: 'fr',
      });

      // then
      expect(participantAssessmentResult.masteryRate).to.equal(1);
      expect(participantAssessmentResult.competenceResults.length).to.equal(1);
      sinon.assert.match(participantAssessmentResult.competenceResults[0], {
        id: 'maCompetenceId',
      });
    });
  });
});
