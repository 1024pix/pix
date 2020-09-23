const { expect, databaseBuilder, airtableBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const TargetProfileWithLearningContent = require('../../../../lib/domain/models/TargetProfileWithLearningContent');
const targetProfileWithLearningContentRepository = require('../../../../lib/infrastructure/repositories/target-profile-with-learning-content-repository');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | Target-profile-with-learning-content', () => {

  afterEach(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
  });

  describe('#get', () => {

    it('should return target profile with learning content', async () => {
      // given
      const skill1_1_1_2 = domainBuilder.buildTargetedSkill({
        id: 'recArea1_Competence1_Tube1_Skill2',
        name: 'skill1_1_1_2_name',
        tubeId: 'recArea1_Competence1_Tube1',
      });
      const skill1_2_1_1 = domainBuilder.buildTargetedSkill({
        id: 'recArea1_Competence2_Tube1_Skill1',
        name: 'skill1_2_1_1_name',
        tubeId: 'recArea1_Competence2_Tube1',
      });
      const tube1_1_1 = domainBuilder.buildTargetedTube({
        id: 'recArea1_Competence1_Tube1',
        practicalTitle: 'tube1_1_1_practicalTitle',
        competenceId: 'recArea1_Competence1',
        skills: [skill1_1_1_2],
      });
      const tube1_2_1 = domainBuilder.buildTargetedTube({
        id: 'recArea1_Competence2_Tube1',
        practicalTitle: 'tube1_2_1_practicalTitle',
        competenceId: 'recArea1_Competence2',
        skills: [skill1_2_1_1],
      });
      const competence1_1 = domainBuilder.buildTargetedCompetence({
        id: 'recArea1_Competence1',
        name: 'competence1_1_name',
        index: 'competence1_1_index',
        areaId: 'recArea1',
        tubes: [tube1_1_1],
      });
      const competence1_2 = domainBuilder.buildTargetedCompetence({
        id: 'recArea1_Competence2',
        name: 'competence1_2_name',
        index: 'competence1_2_index',
        areaId: 'recArea1',
        tubes: [tube1_2_1],
      });
      const area1 = domainBuilder.buildTargetedArea({
        id: 'recArea1',
        title: 'area1_TitleFr',
        competences: [competence1_1, competence1_2],
      });
      const targetProfileDB = databaseBuilder.factory.buildTargetProfile();
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfileDB.id, skillId: 'recArea1_Competence1_Tube1_Skill2' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfileDB.id, skillId: 'recArea1_Competence2_Tube1_Skill1' });
      const expectedTargetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        id: targetProfileDB.id,
        name: targetProfileDB.name,
        skills: [skill1_1_1_2, skill1_2_1_1],
        tubes: [tube1_1_1, tube1_2_1],
        competences: [competence1_1, competence1_2],
        areas: [area1],
      });
      const airtableObjects = airtableBuilder.factory.buildLearningContent.fromTargetProfileWithLearningContent({ targetProfile: expectedTargetProfile });
      airtableBuilder.mockLists(airtableObjects);
      await databaseBuilder.commit();

      // when
      const targetProfile = await targetProfileWithLearningContentRepository.get(targetProfileDB.id);

      // then
      expect(targetProfile).to.be.instanceOf(TargetProfileWithLearningContent);
      expect(targetProfile).to.deep.equal(expectedTargetProfile);
    });

    it('should throw a NotFoundError when targetProfile does not exists', async () => {
      // when
      const error = await catchErr(targetProfileWithLearningContentRepository.get)(123);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
