const { expect, databaseBuilder, domainBuilder } = require('../../../test-helper');
const certifiableProfileForLearningContentRepository = require('../../../../lib/infrastructure/repositories/certifiable-profile-for-learning-content-repository');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const CertifiableProfileForLearningContent = require('../../../../lib/domain/models/CertifiableProfileForLearningContent');

describe('Integration | Repository | certifiable-profile-for-learning-content', () => {

  describe('#get', () => {

    it('should return user profile', async () => {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({
        id: 'skill1_id',
        name: 'skill1_name',
        tubeId: 'tube1_id',
      });
      const skill2 = domainBuilder.buildTargetedSkill({
        id: 'skill2_id',
        name: 'skill2_name',
        tubeId: 'tube1_id',
      });
      const tube = domainBuilder.buildTargetedTube({
        id: 'tube1_id',
        competenceId: 'competence1_id',
        skills: [skill1, skill2],
      });
      const competence = domainBuilder.buildTargetedCompetence({
        id: 'competence1_id',
        areaId: 'area1_id',
        tubes: [tube],
      });
      const area = domainBuilder.buildTargetedArea({
        id: 'area1_id',
        competences: [competence],
      });
      const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1, skill2],
        tubes: [tube],
        competences: [competence],
        areas: [area],
      });

      const userId = databaseBuilder.factory.buildUser().id;
      const profileDate = new Date('2021-01-01');
      const answer1 = databaseBuilder.factory.buildAnswer({
        challengeId: 'challenge1',
      });
      const knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2020-01-01'),
        source: KnowledgeElement.SourceType.DIRECT,
        status: KnowledgeElement.StatusType.VALIDATED,
        earnedPix: 2,
        skillId: skill1.id,
        answerId: answer1.id,
      });
      const answer2 = databaseBuilder.factory.buildAnswer({
        challengeId: 'challenge2',
      });
      const knowledgeElement2 = databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2020-01-01'),
        source: KnowledgeElement.SourceType.INFERRED,
        status: KnowledgeElement.StatusType.INVALIDATED,
        earnedPix: 0,
        skillId: skill2.id,
        answerId: answer2.id,
      });
      const expectedCertifiableProfileForLearningContent = domainBuilder.buildCertifiableProfileForLearningContent({
        userId,
        profileDate,
        targetProfileWithLearningContent,
        knowledgeElements: [knowledgeElement1, knowledgeElement2],
        answerAndChallengeIdsByAnswerId: { [answer1.id]: { id: answer1.id, challengeId: 'challenge1' }, [answer2.id]: { id: answer2.id, challengeId: 'challenge2' } },
      });
      await databaseBuilder.commit();

      // when
      const userProfile = await certifiableProfileForLearningContentRepository.get({ id: userId, profileDate, targetProfileWithLearningContent });

      // then
      expect(userProfile).to.be.instanceOf(CertifiableProfileForLearningContent);
      expect(userProfile).to.deep.equal(expectedCertifiableProfileForLearningContent);
    });

    it('should include user skill that are in the target profile only', async () => {
      // given
      const skill = domainBuilder.buildTargetedSkill({
        id: 'skill1_id',
        name: 'skill1_name',
        tubeId: 'tube1_id',
      });
      const tube = domainBuilder.buildTargetedTube({
        id: 'tube1_id',
        competenceId: 'competence1_id',
        skills: [skill],
      });
      const competence = domainBuilder.buildTargetedCompetence({
        id: 'competence1_id',
        areaId: 'area1_id',
        tubes: [tube],
      });
      const area = domainBuilder.buildTargetedArea({
        id: 'area1_id',
        competences: [competence],
      });
      const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill],
        tubes: [tube],
        competences: [competence],
        areas: [area],
      });

      const userId = databaseBuilder.factory.buildUser().id;
      const profileDate = new Date('2021-01-01');
      const answer1 = databaseBuilder.factory.buildAnswer({
        challengeId: 'challenge1',
      });
      const knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2020-01-01'),
        source: KnowledgeElement.SourceType.DIRECT,
        status: KnowledgeElement.StatusType.VALIDATED,
        earnedPix: 2,
        skillId: skill.id,
        answerId: answer1.id,
      });
      const answer2 = databaseBuilder.factory.buildAnswer({
        challengeId: 'challenge2',
      });
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2020-01-01'),
        source: KnowledgeElement.SourceType.INFERRED,
        status: KnowledgeElement.StatusType.INVALIDATED,
        earnedPix: 0,
        skillId: 'someOtherSkill',
        answerId: answer2.id,
      });
      const expectedCertifiableProfileForLearningContent = domainBuilder.buildCertifiableProfileForLearningContent({
        userId,
        profileDate,
        targetProfileWithLearningContent,
        knowledgeElements: [knowledgeElement1],
        answerAndChallengeIdsByAnswerId: { [answer1.id]: { id: answer1.id, challengeId: 'challenge1' } },
      });
      await databaseBuilder.commit();

      // when
      const userProfile = await certifiableProfileForLearningContentRepository.get({ id: userId, profileDate, targetProfileWithLearningContent });

      // then
      expect(userProfile).to.be.instanceOf(CertifiableProfileForLearningContent);
      expect(userProfile).to.deep.equal(expectedCertifiableProfileForLearningContent);
    });

    it('should include user skill that are within the profile date only', async () => {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({
        id: 'skill1_id',
        name: 'skill1_name',
        tubeId: 'tube1_id',
      });
      const skill2 = domainBuilder.buildTargetedSkill({
        id: 'skill2_id',
        name: 'skill2_name',
        tubeId: 'tube1_id',
      });
      const tube = domainBuilder.buildTargetedTube({
        id: 'tube1_id',
        competenceId: 'competence1_id',
        skills: [skill1, skill2],
      });
      const competence = domainBuilder.buildTargetedCompetence({
        id: 'competence1_id',
        areaId: 'area1_id',
        tubes: [tube],
      });
      const area = domainBuilder.buildTargetedArea({
        id: 'area1_id',
        competences: [competence],
      });
      const targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent({
        skills: [skill1, skill2],
        tubes: [tube],
        competences: [competence],
        areas: [area],
      });

      const userId = databaseBuilder.factory.buildUser().id;
      const profileDate = new Date('2021-01-01');
      const answer1 = databaseBuilder.factory.buildAnswer({
        challengeId: 'challenge1',
      });
      const knowledgeElement1 = databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2020-01-01'),
        source: KnowledgeElement.SourceType.DIRECT,
        status: KnowledgeElement.StatusType.VALIDATED,
        earnedPix: 2,
        skillId: skill1.id,
        answerId: answer1.id,
      });
      const answer2 = databaseBuilder.factory.buildAnswer({
        challengeId: 'challenge2',
      });
      databaseBuilder.factory.buildKnowledgeElement({
        userId,
        createdAt: new Date('2022-01-01'),
        source: KnowledgeElement.SourceType.INFERRED,
        status: KnowledgeElement.StatusType.INVALIDATED,
        earnedPix: 0,
        skillId: skill2.id,
        answerId: answer2.id,
      });
      const expectedCertifiableProfileForLearningContent = domainBuilder.buildCertifiableProfileForLearningContent({
        userId,
        profileDate,
        targetProfileWithLearningContent,
        knowledgeElements: [knowledgeElement1],
        answerAndChallengeIdsByAnswerId: { [answer1.id]: { id: answer1.id, challengeId: 'challenge1' } },
      });
      await databaseBuilder.commit();

      // when
      const userProfile = await certifiableProfileForLearningContentRepository.get({ id: userId, profileDate, targetProfileWithLearningContent });

      // then
      expect(userProfile).to.be.instanceOf(CertifiableProfileForLearningContent);
      expect(userProfile).to.deep.equal(expectedCertifiableProfileForLearningContent);
    });
  });
});
