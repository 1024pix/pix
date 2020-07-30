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

  function _createCertificationChallenge(challengeId, skill) {
    return new CertificationChallenge({
      challengeId,
      associatedSkillName: skill.name,
      associatedSkillId: skill.id,
      competenceId: skill.competenceId,
    });
  }

  const competenceFlipper = _createCompetence('competenceRecordIdOne', '1.1', '1.1 Construire un flipper', '1');
  const competenceRemplir = _createCompetence('competenceRecordIdTwo', '1.2', '1.2 Adopter un dauphin', '1');
  const competenceRequin = _createCompetence('competenceRecordIdThree', '1.3', '1.3 Se faire manger par un requin', '1');

  const skillCitation4 = new Skill({ id: 10, name: '@citation4', competenceId: competenceFlipper.id });
  const skillCollaborer4 = new Skill({ id: 20, name: '@collaborer4', competenceId: competenceFlipper.id });
  const skillMoteur3 = new Skill({ id: 30, name: '@moteur3', competenceId: competenceFlipper.id });
  const skillRecherche4 = new Skill({ id: 40, name: '@recherche4', competenceId: competenceFlipper.id });
  const skillRemplir2 = new Skill({ id: 50, name: '@remplir2', competenceId: competenceRemplir.id });
  const skillRemplir4 = new Skill({ id: 60, name: '@remplir4', competenceId: competenceRemplir.id });
  const skillUrl3 = new Skill({ id: 70, name: '@url3', competenceId: competenceRemplir.id });
  const skillWeb1 = new Skill({ id: 80, name: '@web1', competenceId: competenceRemplir.id });
  const skillRequin5 = new Skill({ id: 110, name: '@requin5', competenceId: competenceRequin.id });
  const skillRequin8 = new Skill({ id: 120, name: '@requin8', competenceId: competenceRequin.id });

  const challengeForSkillCollaborer4 = _createChallenge('challengeRecordIdThree', 'competenceRecordIdThatDoesNotExistAnymore', [skillCollaborer4], '@collaborer4');

  const challengeForSkillCitation4 = _createChallenge('challengeRecordIdOne', competenceFlipper.id, [skillCitation4], '@citation4');
  const challengeForSkillCitation4AndMoteur3 = _createChallenge('challengeRecordIdTwo', competenceFlipper.id, [skillCitation4, skillMoteur3], '@citation4');
  const challengeForSkillRecherche4 = _createChallenge('challengeRecordIdFour', competenceFlipper.id, [skillRecherche4], '@recherche4');
  const challengeRecordWithoutSkills = _createChallenge('challengeRecordIdNine', competenceFlipper.id, [], null);
  const anotherChallengeForSkillCitation4 = _createChallenge('challengeRecordIdTen', competenceFlipper.id, [skillCitation4], '@citation4');

  const challengeForSkillRemplir2 = _createChallenge('challengeRecordIdFive', competenceRemplir.id, [skillRemplir2], '@remplir2');
  const challengeForSkillRemplir4 = _createChallenge('challengeRecordIdSix', competenceRemplir.id, [skillRemplir4], '@remplir4');
  const challengeForSkillUrl3 = _createChallenge('challengeRecordIdSeven', competenceRemplir.id, [skillUrl3], '@url3');
  const challengeForSkillWeb1 = _createChallenge('challengeRecordIdEight', competenceRemplir.id, [skillWeb1], '@web1');

  const challengeForSkillRequin5 = _createChallenge('challengeRecordIdNine', competenceRequin.id, [skillRequin5], '@requin5');
  const challengeForSkillRequin8 = _createChallenge('challengeRecordIdTen', competenceRequin.id, [skillRequin8], '@requin8');

  const competences = [
    competenceFlipper,
    competenceRemplir,
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
      const expectedCertificationChallenge = _createCertificationChallenge(challengeForSkillRemplir2.id, skillRemplir2);

      // when
      const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

      // then
      expect(certificationChallenges).to.deep.equal([expectedCertificationChallenge]);
    });

    context('when competence level is less than 1', () => {

      it('should select no challenge', async () => {
        // given
        userCompetence1.estimatedLevel = 0;
        placementProfile.userCompetences = [userCompetence1];

        answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves([]);

        // when
        const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

        // then
        expect(certificationChallenges).to.deep.equal([]);
      });
    });

    context('when no challenge validate the skill', () => {

      it('should not return the skill', async () => {
        // given
        placementProfile.userCompetences = [userCompetence2];
        answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdEleven']);

        // when
        const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

        // then
        expect(certificationChallenges).to.deep.equal([]);
      });
    });

    context('when three challenges validate the same skill', () => {

      it('should select an unanswered challenge', async () => {
        // given
        placementProfile.userCompetences = [userCompetence1];
        answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdOne']);
        const expectedSkills = [skillCitation4.name];

        // when
        const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

        // then
        const skillsForChallenges = _.uniq(_.map(certificationChallenges, 'associatedSkillName'));
        expect(skillsForChallenges).to.deep.include.members(expectedSkills);
      });

      it('should select a challenge for every skill', async () => {
        // given
        placementProfile.userCompetences = [userCompetence1];
        answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdFour', 'challengeRecordIdTwo']);
        const expectedSkills = [skillCitation4.name, skillRecherche4.name, skillMoteur3.name];

        // when
        const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

        // then
        const skillsForChallenges = _.uniq(_.map(certificationChallenges, 'associatedSkillName'));
        expect(skillsForChallenges).to.deep.include.members(expectedSkills);
      });

      it('should return at most one challenge per skill', async () => {
        // given
        placementProfile.userCompetences = [userCompetence1];
        answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdFour', 'challengeRecordIdTwo']);
        const expectedSkills = [skillCitation4, skillRecherche4, skillMoteur3];

        // when
        const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

        // then
        const skillsForChallenges = _.uniq(_.map(certificationChallenges, 'associatedSkillName'));
        expect(skillsForChallenges.length).to.equal(expectedSkills.length);
      });
    });

    it('should group skills by competence', async () => {
      // given
      placementProfile.userCompetences = [userCompetence1, userCompetence2];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdFour', 'challengeRecordIdFive', 'challengeRecordIdSeven']);
      const expectedCertificationChallenges = [
        _createCertificationChallenge(challengeForSkillRecherche4.id, skillRecherche4),
        _createCertificationChallenge(challengeForSkillUrl3.id, skillUrl3),
        _createCertificationChallenge(challengeForSkillRemplir2.id, skillRemplir2),
      ];

      // when
      const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

      // then
      expect(certificationChallenges).to.deep.equal(expectedCertificationChallenges);
    });

    it('should sort in desc grouped skills by competence', async () => {
      // given
      placementProfile.userCompetences = [userCompetence1, userCompetence2];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdSix', 'challengeRecordIdFive', 'challengeRecordIdSeven']);
      const expectedCertificationChallenges = [
        _createCertificationChallenge(challengeForSkillRemplir4.id, skillRemplir4),
        _createCertificationChallenge(challengeForSkillUrl3.id, skillUrl3),
        _createCertificationChallenge(challengeForSkillRemplir2.id, skillRemplir2),
      ];

      // when
      const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

      // then
      expect(certificationChallenges).to.deep.equal(expectedCertificationChallenges);
    });

    it('should return the three most difficult skills sorted in desc grouped by competence', async () => {
      // given
      placementProfile.userCompetences = [userCompetence1, userCompetence2];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdSix', 'challengeRecordIdFive', 'challengeRecordIdSeven', 'challengeRecordIdEight']);
      const expectedCertificationChallenges = [
        _createCertificationChallenge(challengeForSkillRemplir4.id, skillRemplir4),
        _createCertificationChallenge(challengeForSkillUrl3.id, skillUrl3),
        _createCertificationChallenge(challengeForSkillRemplir2.id, skillRemplir2),
      ];

      // when
      const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

      // then
      expect(certificationChallenges).to.deep.equal(expectedCertificationChallenges);
    });

    it('should not add a skill twice', async () => {
      // given
      placementProfile.userCompetences = [userCompetence1, userCompetence2];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdFive', 'challengeRecordIdFive']);
      // when
      const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

      // then
      expect(certificationChallenges).to.deep.equal([_createCertificationChallenge(challengeForSkillRemplir2.id, skillRemplir2)]);
    });

    it('should not add a challenge twice', async () => {
      // given
      const onlyOneChallengeForCitation4AndMoteur3 = [
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
      ];
      challengeRepository.findOperative.resolves(onlyOneChallengeForCitation4AndMoteur3);
      placementProfile.userCompetences = [userCompetence1];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdTwo']);
      // when
      const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

      // then
      expect(_.map(certificationChallenges, 'challengeId')).to.deep.equal(['challengeRecordIdTwo']);
    });

    it('should not assign skill, when the challenge id is not found', async () => {
      // given
      placementProfile.userCompetences = [userCompetence1, userCompetence2];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['nonExistentchallengeRecordId']);
      // when
      const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

      // then
      expect(certificationChallenges).to.deep.equal([]);
    });

    it('should not assign skill, when the competence is not found', async () => {
      // given
      placementProfile.userCompetences = [userCompetence1, userCompetence2];
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123, 456, 789]).resolves(['challengeRecordIdThree']);
      // when
      const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(placementProfile);

      // then
      expect(certificationChallenges).to.deep.equal([]);
    });
  });
});
