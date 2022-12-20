const CertifiableProfileForLearningContent = require('../../../../lib/domain/models/CertifiableProfileForLearningContent');

const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | CertifiableProfileForLearningContent', function () {
  describe('#constructor', function () {
    it('should filter out knowledge elements data that does not intersect with learning content', function () {
      // given
      const skill = domainBuilder.buildSkill({ id: 'recSkill1', tubeId: 'recTube1' });
      const tube = domainBuilder.buildTube({ id: 'recTube1', competenceId: 'recCompetence1', skills: [skill] });
      const competence = domainBuilder.buildCompetence({
        id: 'recCompetence1',
        competenceId: 'recCompetence1',
        areaId: 'recArea1',
        tubes: [tube],
      });
      const area = domainBuilder.buildArea({ id: 'recArea1', competences: [competence] });
      const framework = domainBuilder.buildFramework({ areas: [area] });
      const learningContent = domainBuilder.buildLearningContent([framework]);
      const knowledgeElement1 = domainBuilder.buildKnowledgeElement({
        answerId: 123,
        skillId: 'recSkill1',
      });
      const knowledgeElement2 = domainBuilder.buildKnowledgeElement({
        answerId: 456,
        skillId: 'someSkillIdProbablyNotInTargetProfileBecauseThisNameIsUncanny',
      });
      const answerAndChallengeIdsByAnswerId = {
        123: { id: 123, challengeId: 'chal1' },
        456: { id: 456, challengeId: 'chal2' },
      };

      // when
      const certifiableProfile = new CertifiableProfileForLearningContent({
        userId: 'someUserId',
        profileDate: 'someProfileDate',
        learningContent,
        knowledgeElements: [knowledgeElement1, knowledgeElement2],
        answerAndChallengeIdsByAnswerId,
      });

      // then
      const skillIds = certifiableProfile.skillResults.map((skillResult) => skillResult.skillId);
      expect(skillIds).to.deep.equal(['recSkill1']);
    });
  });

  describe('#getOrderedCertifiableSkillsByDecreasingDifficultyGroupedByAreaId', function () {
    let learningContent;

    beforeEach(function () {
      const easySkillArea1 = domainBuilder.buildSkill({
        id: 'a1_c1_t1_s1_id',
        name: '@iziAreaOne1',
        tubeId: 'a1_c1_t1_id',
      });
      const mediumSkillArea1 = domainBuilder.buildSkill({
        id: 'a1_c1_t2_s1_id',
        name: '@mediumAreaOne2',
        tubeId: 'a1_c1_t2_id',
      });
      const hardSkillArea1 = domainBuilder.buildSkill({
        id: 'a1_c2_t1_s1_id',
        name: '@hardAreaOne4',
        tubeId: 'a1_c2_t1_id',
      });
      const tube1Area1 = domainBuilder.buildTube({
        id: 'a1_c1_t1_id',
        competenceId: 'a1_c1_id',
        skills: [easySkillArea1],
      });
      const tube2Area1 = domainBuilder.buildTube({
        id: 'a1_c1_t2_id',
        competenceId: 'a1_c1_id',
        skills: [mediumSkillArea1],
      });
      const tube3Area1 = domainBuilder.buildTube({
        id: 'a1_c2_t1_id',
        competenceId: 'a1_c2_id',
        skills: [hardSkillArea1],
      });
      const competence1Area1 = domainBuilder.buildCompetence({
        id: 'a1_c1_id',
        areaId: 'a1_id',
        tubes: [tube1Area1, tube2Area1],
        origin: 'Origin1',
      });
      const competence2Area1 = domainBuilder.buildCompetence({
        id: 'a1_c2_id',
        areaId: 'a1_id',
        tubes: [tube3Area1],
        origin: 'Origin2',
      });
      const area1 = domainBuilder.buildArea({
        id: 'a1_id',
        competences: [competence1Area1, competence2Area1],
      });
      const easySkillArea2 = domainBuilder.buildSkill({
        id: 'a2_c1_t1_s1_id',
        name: '@iziAreaTwo3',
        tubeId: 'a2_c1_t1_id',
      });
      const mediumSkillArea2 = domainBuilder.buildSkill({
        id: 'a2_c1_t1_s2_id',
        name: '@mediumAreaOne5',
        tubeId: 'a2_c1_t1_id',
      });
      const tube1Area2 = domainBuilder.buildTube({
        id: 'a2_c1_t1_id',
        competenceId: 'a2_c1_id',
        skills: [easySkillArea2, mediumSkillArea2],
      });
      const competence1Area2 = domainBuilder.buildCompetence({
        id: 'a2_c1_id',
        areaId: 'a2_id',
        tubes: [tube1Area2],
        origin: 'Origin1',
      });
      const area2 = domainBuilder.buildArea({
        id: 'a2_id',
        competences: [competence1Area2],
      });
      const framework = domainBuilder.buildFramework({ areas: [area1, area2] });
      learningContent = domainBuilder.buildLearningContent([framework]);
    });

    it('should return directly validated skills ordered by decreasing difficulty by area id', function () {
      // given
      const knowledgeElementEasySkillArea1 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 123,
        skillId: 'a1_c1_t1_s1_id',
      });
      const knowledgeElementMediumSkillArea1 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 456,
        skillId: 'a1_c1_t2_s1_id',
      });
      const knowledgeElementHardSkillArea1 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 789,
        skillId: 'a1_c2_t1_s1_id',
      });
      const knowledgeElementEasySkillArea2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 159,
        skillId: 'a2_c1_t1_s1_id',
      });
      const knowledgeElementMediumSkillArea2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 753,
        skillId: 'a2_c1_t1_s2_id',
      });
      const answerAndChallengeIdsByAnswerId = {
        123: { id: 123, challengeId: 'chal1' },
        456: { id: 456, challengeId: 'chal2' },
        789: { id: 789, challengeId: 'chal3' },
        159: { id: 159, challengeId: 'chal4' },
        753: { id: 753, challengeId: 'chal5' },
      };
      const certifiableProfile = new CertifiableProfileForLearningContent({
        userId: 'someUserId',
        profileDate: 'someProfileDate',
        learningContent,
        knowledgeElements: [
          knowledgeElementEasySkillArea1,
          knowledgeElementMediumSkillArea1,
          knowledgeElementHardSkillArea1,
          knowledgeElementEasySkillArea2,
          knowledgeElementMediumSkillArea2,
        ],
        answerAndChallengeIdsByAnswerId,
      });

      // when
      const directlyValidatedSkillsOrderedByDecreasingDifficultyByAreaId =
        certifiableProfile.getOrderedCertifiableSkillsByDecreasingDifficultyGroupedByAreaId();

      // then
      expect(directlyValidatedSkillsOrderedByDecreasingDifficultyByAreaId).to.deep.equal({
        a1_id: ['a1_c2_t1_s1_id', 'a1_c1_t2_s1_id', 'a1_c1_t1_s1_id'],
        a2_id: ['a2_c1_t1_s2_id', 'a2_c1_t1_s1_id'],
      });
    });

    it('should ignore skills that are not directly validated', function () {
      // given
      const knowledgeElementEasySkillArea1 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 123,
        skillId: 'a1_c1_t1_s1_id',
      });
      const knowledgeElementMediumSkillArea1 = domainBuilder.buildKnowledgeElement.directlyInvalidated({
        answerId: 456,
        skillId: 'a1_c1_t2_s1_id',
      });
      const knowledgeElementHardSkillArea1 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 789,
        skillId: 'a1_c2_t1_s1_id',
      });
      const knowledgeElementEasySkillArea2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 159,
        skillId: 'a2_c1_t1_s1_id',
      });
      const knowledgeElementMediumSkillArea2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 753,
        skillId: 'a2_c1_t1_s2_id',
      });
      const answerAndChallengeIdsByAnswerId = {
        123: { id: 123, challengeId: 'chal1' },
        456: { id: 456, challengeId: 'chal2' },
        789: { id: 789, challengeId: 'chal3' },
        159: { id: 159, challengeId: 'chal4' },
        753: { id: 753, challengeId: 'chal5' },
      };
      const certifiableProfile = new CertifiableProfileForLearningContent({
        userId: 'someUserId',
        profileDate: 'someProfileDate',
        learningContent,
        knowledgeElements: [
          knowledgeElementEasySkillArea1,
          knowledgeElementMediumSkillArea1,
          knowledgeElementHardSkillArea1,
          knowledgeElementEasySkillArea2,
          knowledgeElementMediumSkillArea2,
        ],
        answerAndChallengeIdsByAnswerId,
      });

      // when
      const directlyValidatedSkillsOrderedByDecreasingDifficultyByAreaId =
        certifiableProfile.getOrderedCertifiableSkillsByDecreasingDifficultyGroupedByAreaId();

      // then
      expect(directlyValidatedSkillsOrderedByDecreasingDifficultyByAreaId).to.deep.equal({
        a1_id: ['a1_c2_t1_s1_id', 'a1_c1_t1_s1_id'],
        a2_id: ['a2_c1_t1_s2_id', 'a2_c1_t1_s1_id'],
      });
    });

    it('should only include skills not in excludedOrigins', function () {
      // given
      const knowledgeElementEasySkillArea1 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 123,
        skillId: 'a1_c1_t1_s1_id',
      });
      const knowledgeElementMediumSkillArea1 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 456,
        skillId: 'a1_c1_t2_s1_id',
      });
      const knowledgeElementHardSkillArea1 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 789,
        skillId: 'a1_c2_t1_s1_id',
      });
      const knowledgeElementEasySkillArea2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 159,
        skillId: 'a2_c1_t1_s1_id',
      });
      const knowledgeElementMediumSkillArea2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 753,
        skillId: 'a2_c1_t1_s2_id',
      });
      const answerAndChallengeIdsByAnswerId = {
        123: { id: 123, challengeId: 'chal1' },
        456: { id: 456, challengeId: 'chal2' },
        789: { id: 789, challengeId: 'chal3' },
        159: { id: 159, challengeId: 'chal4' },
        753: { id: 753, challengeId: 'chal5' },
      };
      const certifiableProfile = new CertifiableProfileForLearningContent({
        userId: 'someUserId',
        profileDate: 'someProfileDate',
        learningContent,
        knowledgeElements: [
          knowledgeElementEasySkillArea1,
          knowledgeElementMediumSkillArea1,
          knowledgeElementHardSkillArea1,
          knowledgeElementEasySkillArea2,
          knowledgeElementMediumSkillArea2,
        ],
        answerAndChallengeIdsByAnswerId,
      });

      // when
      const excludedOrigins = ['Origin2'];
      const directlyValidatedSkillsOrderedByDecreasingDifficultyByAreaId =
        certifiableProfile.getOrderedCertifiableSkillsByDecreasingDifficultyGroupedByAreaId(excludedOrigins);

      // then
      expect(directlyValidatedSkillsOrderedByDecreasingDifficultyByAreaId).to.deep.equal({
        a1_id: ['a1_c1_t2_s1_id', 'a1_c1_t1_s1_id'],
        a2_id: ['a2_c1_t1_s2_id', 'a2_c1_t1_s1_id'],
      });
    });
  });

  describe('#getAlreadyAnsweredChallengeIds', function () {
    it('should return list of uniq challenge ids answered on directly validated skills in the learning content', function () {
      // given
      const skill1 = domainBuilder.buildSkill({
        id: 'skill1',
        tubeId: 'tube1',
      });
      const skill2 = domainBuilder.buildSkill({
        id: 'skill2',
        tubeId: 'tube1',
      });
      const skill3 = domainBuilder.buildSkill({
        id: 'skill3',
        tubeId: 'tube1',
      });
      const skill4 = domainBuilder.buildSkill({
        id: 'skill4',
        tubeId: 'tube1',
      });
      const tube1 = domainBuilder.buildTube({
        id: 'tube1',
        competenceId: 'competence1',
        skills: [skill1, skill2, skill3, skill4],
      });
      const competence1 = domainBuilder.buildCompetence({
        id: 'competence1',
        areaId: 'area1',
        tubes: [tube1],
      });
      const area1 = domainBuilder.buildArea({
        id: 'area1',
        competences: [competence1],
      });
      const framework = domainBuilder.buildFramework({ areas: [area1] });
      const learningContent = domainBuilder.buildLearningContent([framework]);

      const knowledgeElement1 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 1,
        skillId: 'skill1',
      });
      const knowledgeElement2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 2,
        skillId: 'skill2',
      });
      const knowledgeElement3 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 3,
        skillId: 'skill3',
      });
      const knowledgeElement4 = domainBuilder.buildKnowledgeElement.directlyInvalidated({
        answerId: 4,
        skillId: 'skill4',
      });
      const answerAndChallengeIdsByAnswerId = {
        1: { id: 1, challengeId: 'chalA' },
        2: { id: 2, challengeId: 'chalB' },
        3: { id: 3, challengeId: 'chalA' },
        4: { id: 4, challengeId: 'chalC' },
      };
      const certifiableProfile = new CertifiableProfileForLearningContent({
        userId: 'someUserId',
        profileDate: 'someProfileDate',
        learningContent,
        knowledgeElements: [knowledgeElement1, knowledgeElement2, knowledgeElement3, knowledgeElement4],
        answerAndChallengeIdsByAnswerId,
      });

      // when
      const uniqDirectlyValidatedChallengeIds = certifiableProfile.getAlreadyAnsweredChallengeIds();

      // then
      expect(uniqDirectlyValidatedChallengeIds).to.include.members(['chalA', 'chalB']);
    });
  });
});
