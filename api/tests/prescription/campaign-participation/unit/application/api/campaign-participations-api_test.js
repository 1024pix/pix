import { expect } from 'chai';
import sinon from 'sinon';

import * as campaignParticipationsApi from '../../../../../../src/prescription/campaign-participation/application/api/campaign-participations-api.js';
import { AssessmentCampaignResult } from '../../../../../../src/prescription/campaign-participation/application/api/read-models/AssessmentCampaignResult.js';
import { CampaignParticipation } from '../../../../../../src/prescription/campaign-participation/application/api/read-models/CampaignParticipation.js';
import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';

describe('Unit | API | Campaign Participations', function () {
  describe('#findByUserId', function () {
    it('should return campaign participations mapped to CampaignParticipation DTOs', async function () {
      // given
      const userId = 1;
      sinon.stub(usecases, 'findCampaignParticipationsByUserId').resolves([
        { id: 10, campaignId: 20, targetProfileId: 30 },
        { id: 11, campaignId: 21, targetProfileId: 31 },
      ]);

      // when
      const results = await campaignParticipationsApi.findByUserId({ userId });

      // then
      expect(usecases.findCampaignParticipationsByUserId).to.have.been.calledOnceWith({ userId });
      expect(results).to.deep.equal([
        new CampaignParticipation({ id: 10, campaignId: 20, targetProfileId: 30 }),
        new CampaignParticipation({ id: 11, campaignId: 21, targetProfileId: 31 }),
      ]);
    });

    it('should return an empty array when user has no participations', async function () {
      // given
      const userId = 1;
      sinon.stub(usecases, 'findCampaignParticipationsByUserId').resolves([]);

      // when
      const results = await campaignParticipationsApi.findByUserId({ userId });

      // then
      expect(results).to.deep.equal([]);
    });
  });

  describe('#getAssessmentCampaignResult', function () {
    it('should call usecase and return an AssessmentCampaignResult read-model', async function () {
      // given
      const campaignParticipationId = 12;
      const locale = 'en';
      sinon.stub(usecases, 'getResultLevelsPerTubesAndCompetences').resolves({
        id: campaignParticipationId,
        masteryRate: 0.42,
        maxReachableLevel: 3,
        meanReachedLevel: 1.5,
        levelsPerCompetence: [
          { id: 'compA', index: '1.1', name: 'Compétence A', description: 'desc A', maxLevel: 3, meanLevel: 1.5 },
        ],
        levelsPerTube: [
          {
            id: 'tubeA',
            competenceId: 'compA',
            competenceName: 'Compétence A',
            title: 'Sujet A',
            description: 'desc sujet A',
            maxLevel: 4,
            meanLevel: 2,
          },
          {
            id: 'tubeB',
            competenceId: 'compA',
            competenceName: 'Compétence A',
            title: 'Sujet B',
            description: 'desc sujet B',
            maxLevel: 2,
            meanLevel: 1,
          },
          {
            id: 'tubeOther',
            competenceId: 'compOther',
            title: 'Sujet hors compétence',
            maxLevel: 2,
            meanLevel: 1,
          },
        ],
      });

      // when
      const result = await campaignParticipationsApi.getAssessmentCampaignResult({
        campaignParticipationId,
        locale,
      });

      // then
      expect(usecases.getResultLevelsPerTubesAndCompetences).to.have.been.calledOnceWithExactly({
        campaignParticipationId,
        locale,
      });
      expect(result).to.be.instanceOf(AssessmentCampaignResult);
      expect(result).to.deep.equal({
        id: campaignParticipationId,
        masteryRate: 0.42,
        maxReachableLevel: 3,
        meanReachedLevel: 1.5,
        levelsPerCompetence: [
          {
            id: 'compA',
            index: '1.1',
            name: 'Compétence A',
            description: 'desc A',
            maxLevel: 3,
            meanLevel: 1.5,
            levelsPerTube: [
              {
                id: 'tubeA',
                competenceId: 'compA',
                competenceName: 'Compétence A',
                title: 'Sujet A',
                description: 'desc sujet A',
                maxLevel: 4,
                meanLevel: 2,
              },
              {
                id: 'tubeB',
                competenceId: 'compA',
                competenceName: 'Compétence A',
                title: 'Sujet B',
                description: 'desc sujet B',
                maxLevel: 2,
                meanLevel: 1,
              },
            ],
          },
        ],
      });
    });

    it('should use fr-FR as default locale', async function () {
      // given
      sinon.stub(usecases, 'getResultLevelsPerTubesAndCompetences').resolves({
        id: 1,
        maxReachableLevel: 0,
        meanReachedLevel: 0,
        levelsPerCompetence: [],
        levelsPerTube: [],
      });

      // when
      await campaignParticipationsApi.getAssessmentCampaignResult({ campaignParticipationId: 1 });

      // then
      expect(usecases.getResultLevelsPerTubesAndCompetences).to.have.been.calledOnceWithExactly({
        campaignParticipationId: 1,
        locale: 'fr-FR',
      });
    });
  });
});
