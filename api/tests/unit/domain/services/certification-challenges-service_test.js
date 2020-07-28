const _ = require('lodash');

const { expect, sinon } = require('../../../test-helper');

const CertificationChallenge = require('../../../../lib/domain/models/CertificationChallenge');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Competence = require('../../../../lib/domain/models/Competence');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
const PlacementProfile = require('../../../../lib/domain/models/PlacementProfile');
const Skill = require('../../../../lib/domain/models/Skill');
const UserCompetence = require('../../../../lib/domain/models/UserCompetence');

const certificationChallengesService = require('../../../../lib/domain/services/certification-challenges-service');

const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const knowledgeElementRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-repository');

describe('Unit | Service | Certification Challenge Service', () => {

  const userId = 63731;

  function _createCompetence(id, index, name, areaCode) {
    const competence = new Competence();
    competence.id = id;
    competence.index = index;
    competence.name = name;
    competence.area = { code: areaCode };

    return competence;
  }

  function _createChallenge(id, competence, skills, testedSkill) {
    const challenge = new Challenge();
    challenge.id = id;
    challenge.skills = skills;
    challenge.competenceId = competence;
    challenge.testedSkill = testedSkill;
    return challenge;
  }

  const skillCitation4 = new Skill({ id: 10, name: '@citation4' });
  const skillCollaborer4 = new Skill({ id: 20, name: '@collaborer4' });
  const skillMoteur3 = new Skill({ id: 30, name: '@moteur3' });
  const skillRecherche4 = new Skill({ id: 40, name: '@recherche4' });
  const skillRemplir2 = new Skill({ id: 50, name: '@remplir2' });
  const skillRemplir4 = new Skill({ id: 60, name: '@remplir4' });
  const skillUrl3 = new Skill({ id: 70, name: '@url3' });
  const skillWeb1 = new Skill({ id: 80, name: '@web1' });
  const skillRequin5 = new Skill({ id: 110, name: '@requin5' });
  const skillRequin8 = new Skill({ id: 120, name: '@requin8' });

  const competenceFlipper = _createCompetence('competenceRecordIdOne', '1.1', '1.1 Construire un flipper', '1');
  const competenceDauphin = _createCompetence('competenceRecordIdTwo', '1.2', '1.2 Adopter un dauphin', '1');
  const competenceRequin = _createCompetence('competenceRecordIdThree', '1.3', '1.3 Se faire manger par un requin', '1');

  const challengeForSkillCollaborer4 = _createChallenge('challengeRecordIdThree', 'competenceRecordIdThatDoesNotExistAnymore', [skillCollaborer4], '@collaborer4');

  const challengeForSkillCitation4 = _createChallenge('challengeRecordIdOne', competenceFlipper.id, [skillCitation4], '@citation4');
  const challengeForSkillCitation4AndMoteur3 = _createChallenge('challengeRecordIdTwo', competenceFlipper.id, [skillCitation4, skillMoteur3], '@citation4');
  const challengeForSkillRecherche4 = _createChallenge('challengeRecordIdFour', competenceFlipper.id, [skillRecherche4], '@recherche4');
  const challengeRecordWithoutSkills = _createChallenge('challengeRecordIdNine', competenceFlipper.id, [], null);
  const anotherChallengeForSkillCitation4 = _createChallenge('challengeRecordIdTen', competenceFlipper.id, [skillCitation4], '@citation4');

  const challengeForSkillRemplir2 = _createChallenge('challengeRecordIdFive', competenceDauphin.id, [skillRemplir2], '@remplir2');
  const challengeForSkillRemplir4 = _createChallenge('challengeRecordIdSix', competenceDauphin.id, [skillRemplir4], '@remplir4');
  const challengeForSkillUrl3 = _createChallenge('challengeRecordIdSeven', competenceDauphin.id, [skillUrl3], '@url3');
  const challengeForSkillWeb1 = _createChallenge('challengeRecordIdEight', competenceDauphin.id, [skillWeb1], '@web1');

  const challengeForSkillRequin5 = _createChallenge('challengeRecordIdNine', competenceRequin.id, [skillRequin5], '@requin5');
  const challengeForSkillRequin8 = _createChallenge('challengeRecordIdTen', competenceRequin.id, [skillRequin8], '@requin8');

  const competences = [
    competenceFlipper,
    competenceDauphin,
    competenceRequin,
  ];

  beforeEach(() => {
    sinon.stub(challengeRepository, 'findOperative').resolves([
      challengeForSkillCitation4,
      anotherChallengeForSkillCitation4,
      challengeForSkillCitation4AndMoteur3,
      challengeForSkillCollaborer4,
      challengeForSkillRecherche4,
      challengeForSkillRemplir2,
      challengeForSkillRemplir4,
      challengeForSkillUrl3,
      challengeForSkillWeb1,
      challengeRecordWithoutSkills,
      challengeForSkillRequin5,
      challengeForSkillRequin8,
    ]);
    sinon.stub(competenceRepository, 'listPixCompetencesOnly').resolves(competences);
  });

  describe('#generateCertificationChallenges', () => {

    const challenge1 = {
      id: 'challengeId11',
      competenceId: 'competenceId1',
      testedSkill: { id: 'skill1Id', name: 'skill1Name' },
    };
    const certificationChallenge1 = new CertificationChallenge({
      challengeId: challenge1.id,
      competenceId: challenge1.competenceId,
      associatedSkillName: challenge1.testedSkill.name,
      associatedSkillId: challenge1.testedSkill.id,
    });
    const challenge2 = {
      id: 'challengeId2',
      competence: 'competenceId2',
      testedSkill: { id: 'skill2Id', name: 'skill2Name' },
    };
    const certificationChallenge2 = new CertificationChallenge({
      challengeId: challenge2.id,
      competenceId: challenge2.competenceId,
      associatedSkillName: challenge2.testedSkill.name,
      associatedSkillId: challenge2.testedSkill.id,
    });

    it('should return certification challenges objects generated from the provided userCompetences and certificationCourseId', async () => {
      // when
      const actualCertificationChallenges = await certificationChallengesService.generateCertificationChallenges([challenge1, challenge2]);

      // then
      expect(actualCertificationChallenges).to.deep.equal([ certificationChallenge1, certificationChallenge2 ]);
    });
  });

  describe('#pickCertificationChallenges', () => {
    let placementProfile;
    let userCompetence1;
    let userCompetence2;

    beforeEach(() => {
      userCompetence1 = new UserCompetence({
        id: 'competenceRecordIdOne',
        index: '1.1',
        area: { code: '1' },
        name: '1.1 Construire un flipper',
        pixScore: 12,
        estimatedLevel: 1
      });
      userCompetence2 = new UserCompetence({
        id: 'competenceRecordIdTwo',
        index: '1.2',
        area: { code: '1' },
        name: '1.2 Adopter un dauphin',
        pixScore: 23,
        estimatedLevel: 2
      });
      placementProfile = new PlacementProfile({
        userId,
        userCompetences: [],
        profileDate: 'limitDate'
      });

      sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId')
        .withArgs({ userId, limitDate: 'limitDate' }).resolves('ke');

      KnowledgeElement.findDirectlyValidatedFromGroups = sinon.stub().returns([{ answerId: 123 }, { answerId: 456 }, { answerId: 789 }]);
      sinon.stub(answerRepository, 'findChallengeIdsFromAnswerIds');
    });

    it('should find validated challenges', async () => {
      // given
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdFive']);

      // when
      await certificationChallengesService.pickCertificationChallenges(placementProfile);

      // then
      sinon.assert.calledOnce(challengeRepository.findOperative);
    });

    it('should assign skill to related competence', async () => {
      // given
      placementProfile.userCompetences = [userCompetence2];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdFive']);

      // when
      const challenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

      // then
      expect(challenges).to.deep.equal([challengeForSkillRemplir2]);
    });

    context('when competence level is less than 1', () => {

      it('should select no challenge', async () => {
        // given
        userCompetence1.estimatedLevel = 0;
        placementProfile.userCompetences = [userCompetence1];

        answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves([]);

        // when
        const challenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

        // then
        expect(challenges).to.deep.equal([]);
      });
    });

    context('when no challenge validate the skill', () => {

      it('should not return the skill', async () => {
        // given
        placementProfile.userCompetences = [userCompetence2];
        answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdEleven']);

        // when
        const challenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

        // then
        expect(challenges).to.deep.equal([]);
      });
    });

    context('when three challenges validate the same skill', () => {

      it('should select an unanswered challenge', async () => {
        // given
        placementProfile.userCompetences = [userCompetence1];
        answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdOne']);

        // when
        const challenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);
        const expectedSkills = [skillCitation4];

        // then
        const skillsForChallenges = _.uniq(_.flatMap(challenges, 'skills'));
        expect(skillsForChallenges).to.deep.include.members(expectedSkills);
      });

      it('should select a challenge for every skill', async () => {
        // given
        placementProfile.userCompetences = [userCompetence1];
        answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdFour', 'challengeRecordIdTwo']);

        // when
        const challenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);
        const expectedSkills = [skillCitation4, skillRecherche4, skillMoteur3];

        // then
        const skillsForChallenges = _.uniq(_.flatMap(challenges, 'skills'));
        expect(skillsForChallenges).to.deep.include.members(expectedSkills);
      });

      it('should return at most one challenge per skill', async () => {
        // given
        placementProfile.userCompetences = [userCompetence1];
        answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdFour', 'challengeRecordIdTwo']);

        // when
        const challenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);
        const expectedSkills = [skillCitation4, skillRecherche4, skillMoteur3];

        // then
        const skillsForChallenges = _.uniq(_.flatMap(challenges, 'skills'));
        expect(skillsForChallenges.length).to.equal(expectedSkills.length);
      });
    });

    it('should group skills by competence ', async () => {
      // given
      placementProfile.userCompetences = [userCompetence1, userCompetence2];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdFour', 'challengeRecordIdFive', 'challengeRecordIdSeven']);
      // when
      const challenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

      // then
      expect(challenges).to.deep.equal([challengeForSkillRecherche4, challengeForSkillUrl3, challengeForSkillRemplir2]);
    });

    it('should sort in desc grouped skills by competence', async () => {
      // given
      placementProfile.userCompetences = [userCompetence1, userCompetence2];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdSix', 'challengeRecordIdFive', 'challengeRecordIdSeven']);
      // when
      const challenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

      // then
      expect(challenges).to.deep.equal([challengeForSkillRemplir4, challengeForSkillUrl3, challengeForSkillRemplir2]);
    });

    it('should return the three most difficult skills sorted in desc grouped by competence', async () => {
      // given
      placementProfile.userCompetences = [userCompetence1, userCompetence2];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdSix', 'challengeRecordIdFive', 'challengeRecordIdSeven', 'challengeRecordIdEight']);
      // when
      const challenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

      // then
      expect(challenges).to.deep.equal([challengeForSkillRemplir4, challengeForSkillUrl3, challengeForSkillRemplir2]);
    });

    it('should not add a skill twice', async () => {
      // given
      placementProfile.userCompetences = [userCompetence1, userCompetence2];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdFive', 'challengeRecordIdFive']);
      // when
      const challenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

      // then
      expect(challenges).to.deep.equal([challengeForSkillRemplir2]);
    });

    it('should not assign skill, when the challenge id is not found', async () => {
      // given
      placementProfile.userCompetences = [userCompetence1, userCompetence2];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['nonExistentchallengeRecordId']);
      // when
      const challenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

      // then
      expect(challenges).to.deep.equal([]);
    });

    it('should not assign skill, when the competence is not found', async () => {
      // given
      placementProfile.userCompetences = [userCompetence1, userCompetence2];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdThree']);
      // when
      const challenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

      // then
      expect(challenges).to.deep.equal([]);
    });
  });
});
