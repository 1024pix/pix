const { expect, databaseBuilder, domainBuilder, knex } = require('../../../test-helper');
const campaignAnalysisRepository = require('../../../../lib/infrastructure/repositories/campaign-analysis-repository');
const CampaignAnalysis = require('../../../../lib/domain/read-models/CampaignAnalysis');
const _ = require('lodash');

function _createUserWithSharedCampaignParticipation(userName, campaignId, sharedAt) {
  const userId = databaseBuilder.factory.buildUser({ firstName: userName }).id;
  const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
    campaignId,
    userId,
    isShared: true,
    sharedAt,
  });

  return { userId, campaignParticipation };
}

function _createUserWithNonSharedCampaignParticipation(userName, campaignId) {
  const userId = databaseBuilder.factory.buildUser({ firstName: userName }).id;
  const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
    campaignId,
    userId,
    isShared: false,
  });

  return { userId, campaignParticipation };
}

describe('Integration | Repository | Campaign analysis repository', () => {

  describe('#getCampaignAnalysis', () => {

    afterEach(() => {
      return knex('knowledge-element-snapshots').delete();
    });

    context('in a rich context close to reality', () => {
      let targetProfile;
      let campaignId;

      beforeEach(async () => {
        campaignId = databaseBuilder.factory.buildCampaign().id;

        const url1 = domainBuilder.buildTargetedSkill({ id: 'recUrl1', tubeId: 'recTubeUrl', name: '@url1' });
        const url2 = domainBuilder.buildTargetedSkill({ id: 'recUrl2', tubeId: 'recTubeUrl', name: '@url2' });
        const tubeUrl = domainBuilder.buildTargetedTube({ id: 'recTubeUrl', competenceId: 'recCompetence', skills: [url1, url2] });

        const file2 = domainBuilder.buildTargetedSkill({ id: 'recFile2', tubeId: 'recTubeFile', name: '@file2' });
        const file3 = domainBuilder.buildTargetedSkill({ id: 'recFile3', tubeId: 'recTubeFile', name: '@file3' });
        const tubeFile = domainBuilder.buildTargetedTube({ id: 'recTubeFile', competenceId: 'recCompetence', skills: [file2, file3] });

        const competence = domainBuilder.buildTargetedCompetence({ id: 'recCompetence', areaId: 'recArea', tubes: [tubeUrl, tubeFile], name: 'The C', index: '2.3' });
        const area = domainBuilder.buildTargetedArea({ id: 'recArea', competences: [competence], color: 'jaffa' });
        targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
          skills: [url1, file2],
          tubes: [tubeUrl, tubeFile],
          competences: [competence],
          areas: [area],
        });

        return databaseBuilder.commit();
      });

      it('should resolves an analysis with expected tube recommendations initialized correctly', async () => {
        // when
        const tutorials = [];
        const actualAnalysis = await campaignAnalysisRepository.getCampaignAnalysis(campaignId, targetProfile, tutorials);

        // then
        const pickedAttributes = ['campaignId', 'tube', 'id', 'competenceId', 'competenceName', 'tubePracticalTitle', 'areaColor', 'maxSkillLevelInTargetProfile'];
        expect(actualAnalysis).to.be.an.instanceof(CampaignAnalysis);
        expect(actualAnalysis.id).to.equal(campaignId);

        const tubeARecommendation = actualAnalysis.campaignTubeRecommendations[0];
        expect(_.pick(tubeARecommendation, pickedAttributes)).to.deep.equal({
          campaignId,
          tube: targetProfile.tubes[0],
          competenceId: targetProfile.competences[0].id,
          id: `${campaignId}_${targetProfile.tubes[0].id}`,
          competenceName: targetProfile.competences[0].name,
          tubePracticalTitle: targetProfile.tubes[0].practicalTitle,
          areaColor: targetProfile.areas[0].color,
          maxSkillLevelInTargetProfile: targetProfile.maxSkillDifficulty,
        });

        const tubeBRecommendation = actualAnalysis.campaignTubeRecommendations[1];
        expect(_.pick(tubeBRecommendation, pickedAttributes)).to.deep.equal({
          campaignId,
          tube: targetProfile.tubes[1],
          competenceId: targetProfile.competences[0].id,
          id: `${campaignId}_${targetProfile.tubes[1].id}`,
          competenceName: targetProfile.competences[0].name,
          tubePracticalTitle: targetProfile.tubes[1].practicalTitle,
          areaColor: targetProfile.areas[0].color,
          maxSkillLevelInTargetProfile: targetProfile.maxSkillDifficulty,
        });
      });

      context('when there is no participant', () => {

        it('should resolves an analysis with null average scores on recommendation', async () => {
          // when
          const tutorials = [];
          const actualAnalysis = await campaignAnalysisRepository.getCampaignAnalysis(campaignId, targetProfile, tutorials);

          // then
          const tubeARecommendation = actualAnalysis.campaignTubeRecommendations[0];
          expect(tubeARecommendation.averageScore).to.be.null;
          const tubeBRecommendation = actualAnalysis.campaignTubeRecommendations[1];
          expect(tubeBRecommendation.averageScore).to.be.null;
        });
      });

      context('when there is a participant but she did not share its contribution', () => {

        beforeEach(() => {
          const goliathId = databaseBuilder.factory.buildUser({ firstName: 'Goliath' }).id;

          databaseBuilder.factory.buildCampaignParticipation({
            campaignId,
            userId: goliathId,
            isShared: false,
          });

          databaseBuilder.factory.buildKnowledgeElement({
            userId: goliathId,
            skillId: 'recUrl1',
            status: 'validated',
            campaignId,
            createdAt: new Date('2019-02-01'),
          });

          return databaseBuilder.commit();
        });

        it('should resolves an analysis with null average scores', async () => {
          // when
          const tutorials = [];
          const actualAnalysis = await campaignAnalysisRepository.getCampaignAnalysis(campaignId, targetProfile, tutorials);

          // then
          const tubeARecommendation = actualAnalysis.campaignTubeRecommendations[0];
          expect(tubeARecommendation.averageScore).to.be.null;
          const tubeBRecommendation = actualAnalysis.campaignTubeRecommendations[1];
          expect(tubeBRecommendation.averageScore).to.be.null;
        });
      });

      context('when there are participants who shared their contribution', () => {

        beforeEach(() => {
          const beforeCampaignParticipationShareDate = new Date('2019-01-01');
          const userWithCampaignParticipationFred = _createUserWithSharedCampaignParticipation('Fred', campaignId, new Date());
          const userWithCampaignParticipationJoe = _createUserWithSharedCampaignParticipation('Joe', campaignId, new Date());
          const userWithNonSharedParticipation = _createUserWithNonSharedCampaignParticipation('Paul', campaignId, new Date());
          const fredId = userWithCampaignParticipationFred.userId;
          const joeId = userWithCampaignParticipationJoe.userId;
          const paulId = userWithNonSharedParticipation.userId;

          _.each([
            { userId: paulId, skillId: 'recUrl1', status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, skillId: 'recUrl1', status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, skillId: 'recUrl2', status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: joeId, skillId: 'recUrl1', status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, skillId: 'recFile2', status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, skillId: 'recFile3', status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId: fredId, skillId: 'someUntargetedSkill', status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
          ], (knowledgeElement) => {
            databaseBuilder.factory.buildKnowledgeElement(knowledgeElement);
          });

          return databaseBuilder.commit();
        });

        it('should resolves an analysis based on participant score ignoring untargeted or non validated knowledge elements', async () => {
          // when
          const tutorials = [];
          const actualAnalysis = await campaignAnalysisRepository.getCampaignAnalysis(campaignId, targetProfile, tutorials);

          // then
          const tubeUrlRecommendation = actualAnalysis.campaignTubeRecommendations[0];
          expect(tubeUrlRecommendation.averageScore).to.equal(65);
          const tubeFileRecommendation = actualAnalysis.campaignTubeRecommendations[1];
          expect(tubeFileRecommendation.averageScore).to.equal(80);
        });
      });
    });
  });

  describe('#getCampaignParticipationAnalysis', () => {

    afterEach(() => {
      return knex('knowledge-element-snapshots').delete();
    });

    context('in a rich context close to reality', () => {
      let targetProfile;
      let campaignId;
      let userId;
      let campaignParticipation;

      beforeEach(async () => {
        campaignId = databaseBuilder.factory.buildCampaign().id;
        const sharedAt = new Date('2020-04-01');
        const userWithCampaignParticipation = _createUserWithSharedCampaignParticipation('Fred', campaignId, sharedAt);
        userId = userWithCampaignParticipation.userId;
        campaignParticipation = { userId, sharedAt };

        const url1 = domainBuilder.buildTargetedSkill({ id: 'recUrl1', tubeId: 'recTubeUrl', name: '@url1' });
        const url2 = domainBuilder.buildTargetedSkill({ id: 'recUrl2', tubeId: 'recTubeUrl', name: '@url2' });
        const tubeUrl = domainBuilder.buildTargetedTube({ id: 'recTubeUrl', competenceId: 'recCompetence', skills: [url1, url2] });

        const file2 = domainBuilder.buildTargetedSkill({ id: 'recFile2', tubeId: 'recTubeFile', name: '@file2' });
        const file3 = domainBuilder.buildTargetedSkill({ id: 'recFile3', tubeId: 'recTubeFile', name: '@file3' });
        const tubeFile = domainBuilder.buildTargetedTube({ id: 'recTubeFile', competenceId: 'recCompetence', skills: [file2, file3] });

        const competence = domainBuilder.buildTargetedCompetence({ id: 'recCompetence', areaId: 'recArea', tubes: [tubeUrl, tubeFile], name: 'The C', index: '2.3' });
        const area = domainBuilder.buildTargetedArea({ id: 'recArea', competences: [competence], color: 'jaffa' });
        targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
          skills: [url1, file2],
          tubes: [tubeUrl, tubeFile],
          competences: [competence],
          areas: [area],
        });

        return databaseBuilder.commit();
      });

      it('should resolves an analysis with expected tube recommendations initialized correctly', async () => {
        // when
        const tutorials = [];
        const actualAnalysis = await campaignAnalysisRepository.getCampaignParticipationAnalysis(campaignId, campaignParticipation, targetProfile, tutorials);

        // then
        const pickedAttributes = ['campaignId', 'tube', 'id', 'competenceId', 'competenceName', 'tubePracticalTitle', 'areaColor', 'maxSkillLevelInTargetProfile'];
        expect(actualAnalysis).to.be.an.instanceof(CampaignAnalysis);
        expect(actualAnalysis.id).to.equal(campaignId);

        const tubeARecommendation = actualAnalysis.campaignTubeRecommendations[0];
        expect(_.pick(tubeARecommendation, pickedAttributes)).to.deep.equal({
          campaignId,
          tube: targetProfile.tubes[0],
          competenceId: targetProfile.competences[0].id,
          id: `${campaignId}_${targetProfile.tubes[0].id}`,
          competenceName: targetProfile.competences[0].name,
          tubePracticalTitle: targetProfile.tubes[0].practicalTitle,
          areaColor: targetProfile.areas[0].color,
          maxSkillLevelInTargetProfile: targetProfile.maxSkillDifficulty,
        });

        const tubeBRecommendation = actualAnalysis.campaignTubeRecommendations[1];
        expect(_.pick(tubeBRecommendation, pickedAttributes)).to.deep.equal({
          campaignId,
          tube: targetProfile.tubes[1],
          competenceId: targetProfile.competences[0].id,
          id: `${campaignId}_${targetProfile.tubes[1].id}`,
          competenceName: targetProfile.competences[0].name,
          tubePracticalTitle: targetProfile.tubes[1].practicalTitle,
          areaColor: targetProfile.areas[0].color,
          maxSkillLevelInTargetProfile: targetProfile.maxSkillDifficulty,
        });
      });

      context('participation details', () => {

        beforeEach(() => {
          const beforeCampaignParticipationShareDate = new Date('2019-01-01');

          _.each([
            { userId, skillId: 'recUrl1', status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId, skillId: 'recUrl2', status: 'invalidated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId, skillId: 'recFile2', status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId, skillId: 'recFile3', status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
            { userId, skillId: 'someUntargetedSkill', status: 'validated', campaignId, createdAt: beforeCampaignParticipationShareDate },
          ], (knowledgeElement) => {
            databaseBuilder.factory.buildKnowledgeElement(knowledgeElement);
          });

          return databaseBuilder.commit();
        });

        it('should resolves an analysis based on participant score ignoring untargeted or non validated knowledge elements', async () => {
          // when
          const tutorials = [];
          const actualAnalysis = await campaignAnalysisRepository.getCampaignParticipationAnalysis(campaignId, campaignParticipation, targetProfile, tutorials);

          // then
          const tubeUrlRecommendation = actualAnalysis.campaignTubeRecommendations[0];
          expect(tubeUrlRecommendation.averageScore).to.equal(65);
          const tubeFileRecommendation = actualAnalysis.campaignTubeRecommendations[1];
          expect(tubeFileRecommendation.averageScore).to.equal(115);
        });
      });
    });
  });
});
