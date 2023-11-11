import { expect, databaseBuilder, mockLearningContent, catchErr } from '../../../test-helper.js';
import { KnowledgeElement } from '../../../../lib/domain/models/KnowledgeElement.js';
import * as campaignAssessmentParticipationResultRepository from '../../../../lib/infrastructure/repositories/campaign-assessment-participation-result-repository.js';
import { LOCALE } from '../../../../src/shared/domain/constants.js';

const { ENGLISH_SPOKEN, FRENCH_SPOKEN } = LOCALE;

import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Integration | Repository | Campaign Assessment Participation Result', function () {
  describe('#getByCampaignIdAndCampaignParticipationId', function () {
    let campaignId, campaignParticipationId;

    beforeEach(function () {
      const learningContent = {
        frameworks: [{ id: 'frameworkId', name: 'frameworkName' }],
        areas: [
          {
            id: 'recArea0',
            competenceIds: ['rec1', 'rec2'],
            color: 'orange',
            frameworkId: 'frameworkId',
          },
        ],
        competences: [
          {
            id: 'rec1',
            index: '1.1',
            areaId: 'recArea0',
            skillIds: ['skill1'],
            origin: 'Pix',
            name_i18n: {
              fr: 'Compétence 1',
              en: 'English competence 1',
            },
          },
          {
            id: 'rec2',
            index: '1.2',
            areaId: 'recArea0',
            skillIds: ['skill2'],
            origin: 'Pix',
            name_i18n: {
              fr: 'Compétence 2',
              en: 'English competence 2',
            },
          },
        ],
        thematics: [],
        tubes: [
          {
            id: 'recTube1',
            competenceId: 'rec1',
          },
          {
            id: 'recTube2',
            competenceId: 'rec2',
          },
        ],
        skills: [
          {
            id: 'skill1',
            name: '@acquis1',
            status: 'actif',
            tubeId: 'recTube1',
            competenceId: 'rec1',
          },
          {
            id: 'skill2',
            name: '@acquis2',
            status: 'actif',
            tubeId: 'recTube2',
            competenceId: 'rec1',
          },
        ],
        challenges: [],
      };

      mockLearningContent(learningContent);
      return databaseBuilder.commit();
    });

    context('When campaign participation is shared', function () {
      beforeEach(function () {
        campaignId = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT' }).id;
        _buildCampaignSkills(campaignId);
        const userId = databaseBuilder.factory.buildUser().id;
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          sharedAt: new Date('2020-01-02'),
        }).id;

        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });

        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          skillId: 'skill1',
          competenceId: 'rec1',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        });
        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          skillId: 'skill2',
          competenceId: 'rec2',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.INVALIDATED,
        });
        databaseBuilder.factory.buildKnowledgeElement({
          userId,
          skillId: 'skill3',
          competenceId: 'rec2',
          createdAt: new Date('2020-01-01'),
          status: KnowledgeElement.StatusType.VALIDATED,
        });
        return databaseBuilder.commit();
      });

      it('fills competenceResults', async function () {
        const expectedResult = [
          {
            areaColor: 'orange',
            id: `${campaignParticipationId}-rec1`,
            index: '1.1',
            name: 'Compétence 1',
            competenceMasteryRate: 1,
          },
          {
            areaColor: 'orange',
            id: `${campaignParticipationId}-rec2`,
            index: '1.2',
            name: 'Compétence 2',
            competenceMasteryRate: 0,
          },
        ];

        const campaignAssessmentParticipationResult =
          await campaignAssessmentParticipationResultRepository.getByCampaignIdAndCampaignParticipationId({
            campaignId,
            campaignParticipationId,
          });

        expect(campaignAssessmentParticipationResult.isShared).to.equal(true);
        expect(campaignAssessmentParticipationResult.competenceResults.length).to.equal(2);
        expect(campaignAssessmentParticipationResult.competenceResults).to.deep.equal(expectedResult);
      });
    });

    context('When given locale is fr', function () {
      const locale = FRENCH_SPOKEN;
      beforeEach(function () {
        campaignId = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT' }).id;
        _buildCampaignSkills(campaignId);
        const userId = databaseBuilder.factory.buildUser().id;
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          sharedAt: new Date('2020-01-02'),
        }).id;
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });
        return databaseBuilder.commit();
      });

      it('returns french', async function () {
        const campaignAssessmentParticipationResult =
          await campaignAssessmentParticipationResultRepository.getByCampaignIdAndCampaignParticipationId({
            campaignId,
            campaignParticipationId,
            locale,
          });

        expect(campaignAssessmentParticipationResult.competenceResults[0].name).to.equal('Compétence 1');
      });
    });

    context('When given locale is en', function () {
      const locale = ENGLISH_SPOKEN;
      beforeEach(function () {
        campaignId = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT' }).id;
        _buildCampaignSkills(campaignId);
        const userId = databaseBuilder.factory.buildUser().id;
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          sharedAt: new Date('2020-01-02'),
        }).id;
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });
        return databaseBuilder.commit();
      });

      it('returns english', async function () {
        const campaignAssessmentParticipationResult =
          await campaignAssessmentParticipationResultRepository.getByCampaignIdAndCampaignParticipationId({
            campaignId,
            campaignParticipationId,
            locale,
          });

        expect(campaignAssessmentParticipationResult.competenceResults[0].name).to.equal('English competence 1');
      });
    });

    context('When no given locale', function () {
      beforeEach(function () {
        campaignId = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT' }).id;
        _buildCampaignSkills(campaignId);
        const userId = databaseBuilder.factory.buildUser().id;
        campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
          campaignId,
          userId,
          sharedAt: new Date('2020-01-02'),
        }).id;
        databaseBuilder.factory.buildAssessment({ campaignParticipationId, userId });
        return databaseBuilder.commit();
      });

      it('returns french', async function () {
        const campaignAssessmentParticipationResult =
          await campaignAssessmentParticipationResultRepository.getByCampaignIdAndCampaignParticipationId({
            campaignId,
            campaignParticipationId,
          });

        expect(campaignAssessmentParticipationResult.competenceResults[0].name).to.equal('Compétence 1');
      });
    });

    context('When something is wrong with a campaign participations', function () {
      it('throws a NotFoundError when no existing campaign participation', async function () {
        campaignId = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT' }).id;
        _buildCampaignSkills(campaignId);

        await databaseBuilder.commit();

        const error = await catchErr(
          campaignAssessmentParticipationResultRepository.getByCampaignIdAndCampaignParticipationId,
        )({ campaignId, campaignParticipationId: 77777 });

        //then
        expect(error).to.be.instanceof(NotFoundError);
      });

      it('throws a NotFoundError when campaign participation is deleted', async function () {
        campaignId = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT' }).id;
        _buildCampaignSkills(campaignId);
        campaignParticipationId = databaseBuilder.factory.buildAssessmentFromParticipation({
          sharedAt: null,
          deletedAt: new Date('2022-01-01'),
          campaignId,
        }).campaignParticipationId;

        await databaseBuilder.commit();

        const error = await catchErr(
          campaignAssessmentParticipationResultRepository.getByCampaignIdAndCampaignParticipationId,
        )({ campaignId, campaignParticipationId });

        //then
        expect(error).to.be.instanceof(NotFoundError);
      });
    });
  });
});

function _buildCampaignSkills(campaignId) {
  databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'skill1' });
  databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'skill2' });
}
