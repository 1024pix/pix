import { expect, databaseBuilder, domainBuilder } from '../../../test-helper';
import certifiableProfileForLearningContentRepository from '../../../../lib/infrastructure/repositories/certifiable-profile-for-learning-content-repository';
import KnowledgeElement from '../../../../lib/domain/models/KnowledgeElement';
import CertifiableProfileForLearningContent from '../../../../lib/domain/models/CertifiableProfileForLearningContent';

describe('Integration | Repository | certifiable-profile-for-learning-content', function () {
  describe('#get', function () {
    it('should return user profile', async function () {
      // given
      const skill1 = domainBuilder.buildSkill({
        id: 'skill1_id',
        name: 'skill1_name',
        tubeId: 'tube1_id',
      });
      const skill2 = domainBuilder.buildSkill({
        id: 'skill2_id',
        name: 'skill2_name',
        tubeId: 'tube1_id',
      });
      const tube = domainBuilder.buildTube({
        id: 'tube1_id',
        competenceId: 'competence1_id',
        skills: [skill1, skill2],
      });
      const competence = domainBuilder.buildCompetence({
        id: 'competence1_id',
        areaId: 'area1_id',
        tubes: [tube],
      });
      const area = domainBuilder.buildArea({
        id: 'area1_id',
        competences: [competence],
      });
      const framework = domainBuilder.buildFramework({ areas: [area] });

      const learningContent = domainBuilder.buildLearningContent([framework]);

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
        learningContent,
        knowledgeElements: [knowledgeElement1, knowledgeElement2],
        answerAndChallengeIdsByAnswerId: {
          [answer1.id]: { id: answer1.id, challengeId: 'challenge1' },
          [answer2.id]: { id: answer2.id, challengeId: 'challenge2' },
        },
      });
      await databaseBuilder.commit();

      // when
      const userProfile = await certifiableProfileForLearningContentRepository.get({
        id: userId,
        profileDate,
        learningContent,
      });

      // then
      expect(userProfile).to.be.instanceOf(CertifiableProfileForLearningContent);
      expect(userProfile).to.deep.equal(expectedCertifiableProfileForLearningContent);
    });

    it('should include user skill that are in the target profile only', async function () {
      // given
      const skill = domainBuilder.buildSkill({
        id: 'skill1_id',
        name: 'skill1_name',
        tubeId: 'tube1_id',
      });
      const tube = domainBuilder.buildTube({
        id: 'tube1_id',
        competenceId: 'competence1_id',
        skills: [skill],
      });
      const competence = domainBuilder.buildCompetence({
        id: 'competence1_id',
        areaId: 'area1_id',
        tubes: [tube],
      });
      const area = domainBuilder.buildArea({
        id: 'area1_id',
        competences: [competence],
      });
      const framework = domainBuilder.buildFramework({ areas: [area] });

      const learningContent = domainBuilder.buildLearningContent([framework]);

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
        learningContent,
        knowledgeElements: [knowledgeElement1],
        answerAndChallengeIdsByAnswerId: { [answer1.id]: { id: answer1.id, challengeId: 'challenge1' } },
      });
      await databaseBuilder.commit();

      // when
      const userProfile = await certifiableProfileForLearningContentRepository.get({
        id: userId,
        profileDate,
        learningContent,
      });

      // then
      expect(userProfile).to.be.instanceOf(CertifiableProfileForLearningContent);
      expect(userProfile).to.deep.equal(expectedCertifiableProfileForLearningContent);
    });

    it('should include user skill that are within the profile date only', async function () {
      // given
      const skill1 = domainBuilder.buildSkill({
        id: 'skill1_id',
        name: 'skill1_name',
        tubeId: 'tube1_id',
      });
      const skill2 = domainBuilder.buildSkill({
        id: 'skill2_id',
        name: 'skill2_name',
        tubeId: 'tube1_id',
      });
      const tube = domainBuilder.buildTube({
        id: 'tube1_id',
        competenceId: 'competence1_id',
        skills: [skill1, skill2],
      });
      const competence = domainBuilder.buildCompetence({
        id: 'competence1_id',
        areaId: 'area1_id',
        tubes: [tube],
      });
      const area = domainBuilder.buildArea({
        id: 'area1_id',
        competences: [competence],
      });
      const framework = domainBuilder.buildFramework({ areas: [area] });

      const learningContent = domainBuilder.buildLearningContent([framework]);

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
        learningContent,
        knowledgeElements: [knowledgeElement1],
        answerAndChallengeIdsByAnswerId: { [answer1.id]: { id: answer1.id, challengeId: 'challenge1' } },
      });
      await databaseBuilder.commit();

      // when
      const userProfile = await certifiableProfileForLearningContentRepository.get({
        id: userId,
        profileDate,
        learningContent,
      });

      // then
      expect(userProfile).to.be.instanceOf(CertifiableProfileForLearningContent);
      expect(userProfile).to.deep.equal(expectedCertifiableProfileForLearningContent);
    });
  });
});
