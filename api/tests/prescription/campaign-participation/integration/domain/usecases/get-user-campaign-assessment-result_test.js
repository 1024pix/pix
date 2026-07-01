import sinon from 'sinon';

import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import {
  CampaignParticipationStatuses,
  CampaignTypes,
} from '../../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { PIX_COUNT_BY_LEVEL } from '../../../../../../src/shared/constants.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { SCOPES } from '../../../../../../src/shared/domain/models/BadgeDetails.js';
import { KnowledgeElement } from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Prescription Integration | UseCase | get-user-campaign-assessment-result', function () {
  let areaId, thematicId, competenceId, skillIds, tubeId, userId;

  beforeEach(async function () {
    skillIds = ['acquisA', 'acquisB'];
    userId = databaseBuilder.factory.buildUser().id;
    areaId = databaseBuilder.factory.learningContent.buildArea({
      id: 'monAreaId',
    }).id;
    competenceId = databaseBuilder.factory.learningContent.buildCompetence({
      id: 'maCompetenceId',
      areaId,
      name_i18n: {
        fr: 'nom de la compétence',
      },
      skillIds,
    }).id;
    thematicId = databaseBuilder.factory.learningContent.buildThematic({
      id: 'thematic1',
      competenceId,
      tubes: ['tubeId1', 'tubeId2'],
    }).id;
    tubeId = databaseBuilder.factory.learningContent.buildTube({
      id: 'tube1',
      competenceId,
      thematicId,
    }).id;
    await databaseBuilder.commit();
  });

  context('when campaign is of type ASSESSMENT', function () {
    it('should return an participant assessment result based on the user profile', async function () {
      // given
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
        sharedAt: new Date(),
        status: CampaignParticipationStatuses.SHARED,
      }).id;
      const assessmentDB = databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId,
        type: Assessment.types.CAMPAIGN,
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

    context('badges', function () {
      it('returns only badges that match target profile tubes', async function () {
        const phantomTube = databaseBuilder.factory.learningContent.buildTube({
          id: 'phantomTube',
          competenceId,
          thematicId,
        });
        databaseBuilder.factory.learningContent.buildSkill({
          id: 'phantomSkill',
          tubeId: phantomTube.id,
          level: 4,
        });

        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId, tubeId, level: 1 });

        const badgeId = databaseBuilder.factory.buildBadge({ targetProfileId }).id;
        databaseBuilder.factory.buildBadgeCriterion({
          badgeId,
          scope: SCOPES.CAPPED_TUBES,
          cappedTubes: JSON.stringify([{ id: tubeId, level: 2 }]),
        });
        databaseBuilder.factory.buildBadgeCriterion({
          badgeId,
          scope: SCOPES.CAPPED_TUBES,
          cappedTubes: JSON.stringify([{ id: phantomTube.id, level: 4 }]),
        });

        const campaignId = databaseBuilder.factory.buildCampaign({
          type: CampaignTypes.ASSESSMENT,
          targetProfileId,
        }).id;

        skillIds.forEach((skillId, index) => {
          databaseBuilder.factory.learningContent.buildSkill({
            id: skillId,
            tubeId,
            level: index + 1,
          });
        });
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          sharedAt: new Date(),
          status: CampaignParticipationStatuses.SHARED,
        }).id;

        const assessmentDB = databaseBuilder.factory.buildAssessment({
          userId,
          campaignParticipationId,
          type: Assessment.types.CAMPAIGN,
        });

        skillIds.map((id) => {
          databaseBuilder.factory.buildKnowledgeElement({
            skillId: id,
            status: KnowledgeElement.StatusType.INVALIDATED,
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

        expect(participantAssessmentResult.badgeResults).lengthOf(1);
        expect(participantAssessmentResult.badgeResults[0].isValid).false;
        expect(participantAssessmentResult.badgeResults[0].acquisitionPercentage).null;
      });
    });

    context('stages', function () {
      it('return acquired stages on participation', async function () {
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        const campaignId = databaseBuilder.factory.buildCampaign({
          type: CampaignTypes.ASSESSMENT,
          targetProfileId,
        }).id;
        databaseBuilder.factory.buildStage({
          id: 123,
          targetProfileId,
          isFirstSkill: false,
          level: 0,
          threshold: null,
          title: 'Palier niveau 0 titre',
          message: 'Palier niveau 0 message',
          prescriberTitle: 'Palier niveau 0 titre prescripteur',
          prescriberDescription: 'Palier niveau 0 description prescripteur',
        });
        databaseBuilder.factory.buildStage({
          id: 456,
          targetProfileId,
          isFirstSkill: false,
          level: 1,
          threshold: null,
        });

        skillIds.map((skillId) =>
          databaseBuilder.factory.buildCampaignSkill({
            campaignId,
            skillId,
          }),
        );
        const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          sharedAt: new Date(),
          status: CampaignParticipationStatuses.SHARED,
        }).id;

        databaseBuilder.factory.buildStageAcquisition({
          stageId: 123,
          campaignParticipationId,
        });

        const assessmentDB = databaseBuilder.factory.buildAssessment({
          userId,
          campaignParticipationId,
          type: Assessment.types.CAMPAIGN,
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
            status: KnowledgeElement.StatusType.INVALIDATED,
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
        expect(participantAssessmentResult.reachedStage).to.deep.equal({
          id: 123,
          isFirstSkill: false,
          level: 0,
          title: 'Palier niveau 0 titre',
          message: 'Palier niveau 0 message',
          prescriberTitle: 'Palier niveau 0 titre prescripteur',
          prescriberDescription: 'Palier niveau 0 description prescripteur',
          reachedStage: 1,
          targetProfileId,
          threshold: null,
          totalStage: 2,
        });
      });
    });
  });

  context('when campaign is of type EXAM', function () {
    it('should return an participant assessment result based on the knowledge element snapshot attach on participation', async function () {
      // given
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
        sharedAt: new Date(),
        status: CampaignParticipationStatuses.SHARED,
      }).id;
      const assessmentDB = databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId,
        type: Assessment.types.CAMPAIGN,
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
