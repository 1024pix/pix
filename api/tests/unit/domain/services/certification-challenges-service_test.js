const _ = require('lodash');
const { expect, sinon, domainBuilder } = require('../../../test-helper');
const { PIX_ORIGIN } = require('../../../../lib/domain/constants');
const PlacementProfile = require('../../../../lib/domain/models/PlacementProfile');
const certificationChallengesService = require('../../../../lib/domain/services/certification-challenges-service');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const knowledgeElementRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-repository');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
const learningContentRepository = require('../../../../lib/infrastructure/repositories/learning-content-repository');
const certifiableProfileForLearningContentRepository = require('../../../../lib/infrastructure/repositories/certifiable-profile-for-learning-content-repository');

describe('Unit | Service | Certification Challenge Service', function () {
  const userId = 63731;
  const locale = 'fr-fr';

  let competenceFlipper;
  let competenceRemplir;
  let competenceRequin;
  let competenceKoala;

  let skillCitation4;
  let skillCollaborer4;
  let skillMoteur3;
  let skillRecherche4;
  let skillRemplir2;
  let skillRemplir2Focus;
  let skillRemplir4;
  let skillUrl3;
  let skillWeb1;
  let skillRequin5;
  let skillRequin8;
  let skillKoala1;
  let skillKoala2;

  let challengeForSkillCollaborer4;
  let challengeForSkillCitation4;
  let challengeForSkillRecherche4;
  let challengeRecordWithoutSkills;
  let anotherChallengeForSkillCitation4;
  let challengeForSkillKoala1;
  let challengeForSkillKoala2;
  let challengeForSkillRemplir2;
  let challengeForSkillRemplir2Focus;
  let challengeForSkillRemplir4;
  let challengeForSkillUrl3;
  let challengeForSkillWeb1;
  let challengeForSkillRequin5;
  let challengeForSkillRequin8;

  function _createCertificationChallenge(challengeId, skill, certifiableBadgeKey = null) {
    if (certifiableBadgeKey) {
      return domainBuilder.buildCertificationChallenge.forPixPlusCertification({
        challengeId,
        associatedSkillName: skill.name,
        associatedSkillId: skill.id,
        competenceId: skill.competenceId,
        isNeutralized: false,
        certifiableBadgeKey,
      });
    }
    return domainBuilder.buildCertificationChallenge.forPixCertification({
      challengeId,
      associatedSkillName: skill.name,
      associatedSkillId: skill.id,
      competenceId: skill.competenceId,
      isNeutralized: false,
      certifiableBadgeKey,
    });
  }

  function findOperativeByIds(skillIds) {
    const skills = [
      skillCitation4,
      skillCollaborer4,
      skillMoteur3,
      skillRecherche4,
      skillRemplir2,
      skillRemplir2Focus,
      skillRemplir4,
      skillUrl3,
      skillWeb1,
      skillRequin5,
      skillRequin8,
      skillKoala1,
      skillKoala2,
    ];
    return skills.filter((skill) => skillIds.includes(skill.id));
  }

  beforeEach(function () {
    competenceFlipper = domainBuilder.buildCompetence({
      id: 'competenceRecordIdOne',
      index: '1.1',
      name: '1.1 Construire un flipper',
      area: '1',
    });
    competenceRemplir = domainBuilder.buildCompetence({
      id: 'competenceRecordIdTwo',
      index: '1.2',
      name: '1.2 Adopter un dauphin',
      area: '1',
    });
    competenceRequin = domainBuilder.buildCompetence({
      id: 'competenceRecordIdThree',
      index: '1.3',
      name: '1.3 Se faire manger par un requin',
      area: '1',
    });
    competenceKoala = domainBuilder.buildCompetence({
      id: 'competenceRecordIdKoala',
      index: '1.3',
      name: '1.3 Se faire manger par un koala',
      area: '1',
    });

    skillCitation4 = domainBuilder.buildSkill({
      id: 10,
      name: '@citation4',
      difficulty: 4,
      competenceId: competenceFlipper.id,
    });
    skillCollaborer4 = domainBuilder.buildSkill({
      id: 20,
      name: '@collaborer4',
      difficulty: 4,
      competenceId: competenceFlipper.id,
    });
    skillMoteur3 = domainBuilder.buildSkill({
      id: 30,
      name: '@moteur3',
      difficulty: 3,
      competenceId: competenceFlipper.id,
    });
    skillRecherche4 = domainBuilder.buildSkill({
      id: 40,
      name: '@recherche4',
      difficulty: 4,
      competenceId: competenceFlipper.id,
    });
    skillRemplir2 = domainBuilder.buildSkill({
      id: 50,
      name: '@remplir2',
      difficulty: 2,
      competenceId: competenceRemplir.id,
      version: 1,
    });
    skillRemplir2Focus = domainBuilder.buildSkill({
      id: 1789,
      name: '@remplir2',
      difficulty: 2,
      competenceId: competenceRemplir.id,
      version: 2,
    });
    skillRemplir4 = domainBuilder.buildSkill({
      id: 60,
      name: '@remplir4',
      difficulty: 4,
      competenceId: competenceRemplir.id,
    });
    skillUrl3 = domainBuilder.buildSkill({ id: 70, name: '@url3', difficulty: 3, competenceId: competenceRemplir.id });
    skillWeb1 = domainBuilder.buildSkill({ id: 80, name: '@web1', difficulty: 1, competenceId: competenceRemplir.id });
    skillRequin5 = domainBuilder.buildSkill({
      id: 110,
      name: '@requin5',
      difficulty: 5,
      competenceId: competenceRequin.id,
    });
    skillRequin8 = domainBuilder.buildSkill({
      id: 120,
      name: '@requin7',
      difficulty: 7,
      competenceId: competenceRequin.id,
    });
    skillKoala1 = domainBuilder.buildSkill({
      id: 110,
      name: '@koala1',
      difficulty: 1,
      competenceId: competenceKoala.id,
    });
    skillKoala2 = domainBuilder.buildSkill({
      id: 120,
      name: '@koala2',
      difficulty: 2,
      competenceId: competenceKoala.id,
    });

    challengeForSkillCollaborer4 = domainBuilder.buildChallenge({
      id: 'challengeRecordIdThree',
      competenceId: 'competenceRecordIdThatDoesNotExistAnymore',
      skill: skillCollaborer4,
    });
    challengeForSkillCitation4 = domainBuilder.buildChallenge({
      id: 'challengeRecordIdOne',
      competenceId: competenceFlipper.id,
      skill: skillCitation4,
    });
    challengeForSkillRecherche4 = domainBuilder.buildChallenge({
      id: 'challengeRecordIdFour',
      competenceId: competenceFlipper.id,
      skill: skillRecherche4,
    });
    challengeRecordWithoutSkills = domainBuilder.buildChallenge({
      id: 'challengeRecordIdNine',
      competenceId: competenceFlipper.id,
      skill: null,
    });
    anotherChallengeForSkillCitation4 = domainBuilder.buildChallenge({
      id: 'challengeRecordIdTen',
      competenceId: competenceFlipper.id,
      skill: skillCitation4,
    });
    challengeForSkillKoala1 = domainBuilder.buildChallenge({
      id: 'challengeRecordIdKoala1',
      competenceId: competenceKoala.id,
      skill: skillKoala1,
    });
    challengeForSkillKoala2 = domainBuilder.buildChallenge({
      id: 'challengeRecordIdKoala2',
      competenceId: competenceKoala.id,
      skill: skillKoala2,
    });
    challengeForSkillRemplir2 = domainBuilder.buildChallenge({
      id: 'challengeRecordIdFive',
      competenceId: competenceRemplir.id,
      skill: skillRemplir2,
    });
    challengeForSkillRemplir2Focus = domainBuilder.buildChallenge({
      id: 'challengeRecordIdFiveFocus',
      competenceId: competenceRemplir.id,
      skill: skillRemplir2Focus,
    });
    domainBuilder.buildChallenge({
      id: 'anotherChallengeForSkillRemplir2',
      competenceId: competenceRemplir.id,
      skill: skillRemplir2,
    });
    challengeForSkillRemplir4 = domainBuilder.buildChallenge({
      id: 'challengeRecordIdSix',
      competenceId: competenceRemplir.id,
      skill: skillRemplir4,
    });
    challengeForSkillUrl3 = domainBuilder.buildChallenge({
      id: 'challengeRecordIdSeven',
      competenceId: competenceRemplir.id,
      skill: skillUrl3,
    });
    challengeForSkillWeb1 = domainBuilder.buildChallenge({
      id: 'challengeRecordIdEight',
      competenceId: competenceRemplir.id,
      skill: skillWeb1,
    });
    challengeForSkillRequin5 = domainBuilder.buildChallenge({
      id: 'challengeRecordIdNine',
      competenceId: competenceRequin.id,
      skill: skillRequin5,
    });
    challengeForSkillRequin8 = domainBuilder.buildChallenge({
      id: 'challengeRecordIdTen',
      competenceId: competenceRequin.id,
      skill: skillRequin8,
    });
  });

  describe('#pickCertificationChallenges', function () {
    let placementProfile;
    let userCompetence1;
    let userCompetence2;

    beforeEach(function () {
      sinon
        .stub(challengeRepository, 'findOperativeHavingLocale')
        .withArgs(locale)
        .resolves([
          challengeForSkillCitation4,
          anotherChallengeForSkillCitation4,
          challengeForSkillCollaborer4,
          challengeForSkillRecherche4,
          challengeForSkillRemplir2,
          challengeForSkillRemplir2Focus,
          challengeForSkillRemplir4,
          challengeForSkillUrl3,
          challengeForSkillWeb1,
          challengeRecordWithoutSkills,
          challengeForSkillRequin5,
          challengeForSkillRequin8,
          challengeForSkillKoala1,
          challengeForSkillKoala2,
        ]);
      sinon.stub(skillRepository, 'findOperativeByIds').callsFake(findOperativeByIds);
      userCompetence1 = domainBuilder.buildUserCompetence({
        id: 'competenceRecordIdOne',
        index: '1.1',
        name: '1.1 Construire un flipper',
        pixScore: 12,
        estimatedLevel: 1,
      });
      userCompetence2 = domainBuilder.buildUserCompetence({
        id: 'competenceRecordIdTwo',
        index: '1.2',
        name: '1.2 Adopter un dauphin',
        pixScore: 23,
        estimatedLevel: 2,
      });

      placementProfile = new PlacementProfile({
        userId,
        userCompetences: [],
        profileDate: 'limitDate',
      });

      sinon.stub(knowledgeElementRepository, 'findUniqByUserIdGroupedByCompetenceId');

      sinon.stub(answerRepository, 'findChallengeIdsFromAnswerIds');
    });

    it('should assign skill to related competence', async function () {
      // given
      placementProfile.userCompetences = [
        domainBuilder.buildUserCompetence({
          ...userCompetence2,
          skills: [skillRemplir2],
        }),
      ];
      knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId
        .withArgs({ userId, limitDate: 'limitDate' })
        .resolves([
          domainBuilder.buildKnowledgeElement({
            answerId: 123,
            competenceId: competenceRemplir.id,
            skillId: skillRemplir2.id,
          }),
        ]);

      answerRepository.findChallengeIdsFromAnswerIds.withArgs([123]).resolves(['challengeRecordIdFive']);
      const expectedCertificationChallenge = _createCertificationChallenge(challengeForSkillRemplir2.id, skillRemplir2);

      // when
      const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(
        placementProfile,
        locale
      );

      // then
      expect(certificationChallenges).to.deep.equal([expectedCertificationChallenge]);
    });

    context('when competence level is less than 1', function () {
      it('should select no challenge', async function () {
        // given
        const userCompetenceWithLowLevel = domainBuilder.buildUserCompetence({
          ...userCompetence1,
          pixScore: 5,
          estimatedLevel: 0,
        });
        placementProfile.userCompetences = [userCompetenceWithLowLevel];

        knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId
          .withArgs({ userId, limitDate: 'limitDate' })
          .resolves([
            domainBuilder.buildKnowledgeElement({
              answerId: 123,
              earnedPix: 5,
              competenceId: userCompetenceWithLowLevel.id,
            }),
          ]);
        answerRepository.findChallengeIdsFromAnswerIds.withArgs([123]).resolves(['whatever']);

        // when
        const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(
          placementProfile,
          locale
        );

        // then
        expect(certificationChallenges).to.deep.equal([]);
      });
    });

    context('when no challenge validate the skill', function () {
      it('should not return the skill', async function () {
        // given
        placementProfile.userCompetences = [userCompetence2];
        knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId
          .withArgs({ userId, limitDate: 'limitDate' })
          .resolves([domainBuilder.buildKnowledgeElement({ answerId: 123 })]);
        answerRepository.findChallengeIdsFromAnswerIds.withArgs([123]).resolves(['challengeRecordIdEleven']);

        // when
        const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(
          placementProfile,
          locale
        );

        // then
        expect(certificationChallenges).to.deep.equal([]);
      });
    });

    context('when three challenges validate the same skill', function () {
      it('should select an unanswered challenge', async function () {
        // given
        placementProfile.userCompetences = [
          domainBuilder.buildUserCompetence({
            ...userCompetence1,
            skills: [skillCitation4],
          }),
        ];
        knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId
          .withArgs({ userId, limitDate: 'limitDate' })
          .resolves([
            domainBuilder.buildKnowledgeElement({
              answerId: 1,
              competenceId: competenceFlipper.id,
              skillId: challengeForSkillCitation4.skill.id,
            }),
          ]);
        answerRepository.findChallengeIdsFromAnswerIds.withArgs([1]).resolves(['challengeRecordIdOne']);

        // when
        const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(
          placementProfile,
          locale
        );

        // then
        expect(certificationChallenges[0].challengeId).to.be.oneOf(['challengeRecordIdTen', 'challengeRecordIdTwo']);
      });

      it('should select a challenge for every skill', async function () {
        // given
        placementProfile.userCompetences = [
          domainBuilder.buildUserCompetence({
            ...userCompetence1,
            skills: [skillRecherche4, skillCitation4, skillMoteur3],
          }),
        ];
        knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId
          .withArgs({ userId, limitDate: 'limitDate' })
          .resolves([
            domainBuilder.buildKnowledgeElement({
              answerId: 123,
              competenceId: competenceFlipper.id,
              skillId: challengeForSkillRecherche4.skill.id,
            }),
          ]);
        answerRepository.findChallengeIdsFromAnswerIds
          .withArgs([123])
          .resolves(['challengeRecordIdFour', 'challengeRecordIdTwo']);
        const expectedSkills = [skillCitation4.name, skillRecherche4.name];

        // when
        const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(
          placementProfile,
          locale
        );

        // then
        const skillsForChallenges = _.uniq(_.map(certificationChallenges, 'associatedSkillName'));
        expect(skillsForChallenges).to.deep.include.members(expectedSkills);
      });

      it('should return at most one challenge per skill', async function () {
        // given
        placementProfile.userCompetences = [
          domainBuilder.buildUserCompetence({
            ...userCompetence1,
            skills: [skillRecherche4, skillCitation4, skillMoteur3],
          }),
        ];
        knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId
          .withArgs({ userId, limitDate: 'limitDate' })
          .resolves([
            domainBuilder.buildKnowledgeElement({
              answerId: 123,
              competenceId: competenceFlipper.id,
              skillId: challengeForSkillRecherche4.skill.id,
            }),
          ]);
        answerRepository.findChallengeIdsFromAnswerIds
          .withArgs([123])
          .resolves(['challengeRecordIdFour', 'challengeRecordIdTwo']);
        const expectedSkills = [skillCitation4, skillRecherche4];

        // when
        const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(
          placementProfile,
          locale
        );

        // then
        const skillsForChallenges = _.uniq(_.map(certificationChallenges, 'associatedSkillName'));
        expect(skillsForChallenges.length).to.equal(expectedSkills.length);
      });
    });

    it('should group skills by competence', async function () {
      // given
      placementProfile.userCompetences = [
        domainBuilder.buildUserCompetence({
          ...userCompetence1,
          skills: [skillRecherche4],
        }),
        domainBuilder.buildUserCompetence({
          ...userCompetence2,
          skills: [skillRemplir2, skillUrl3],
        }),
      ];
      knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId
        .withArgs({ userId, limitDate: 'limitDate' })
        .resolves([
          domainBuilder.buildKnowledgeElement({
            answerId: 123,
            competenceId: competenceFlipper.id,
            skillId: challengeForSkillRecherche4.skill.id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 456,
            competenceId: competenceRemplir.id,
            skillId: challengeForSkillUrl3.skill.id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 789,
            competenceId: competenceRemplir.id,
            skillId: challengeForSkillRemplir2.skill.id,
          }),
        ]);
      answerRepository.findChallengeIdsFromAnswerIds
        .withArgs([123, 456, 789])
        .resolves([challengeForSkillRecherche4.id, challengeForSkillUrl3.id, challengeForSkillRemplir2.id]);
      const expectedCertificationChallenges = [
        _createCertificationChallenge(challengeForSkillRecherche4.id, skillRecherche4),
        _createCertificationChallenge(challengeForSkillUrl3.id, skillUrl3),
        _createCertificationChallenge(challengeForSkillRemplir2.id, skillRemplir2),
      ];

      // when
      const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(
        placementProfile,
        locale
      );

      // then
      expect(certificationChallenges).to.deep.equal(expectedCertificationChallenges);
    });

    it('should sort in desc grouped skills by competence', async function () {
      // given
      placementProfile.userCompetences = [
        userCompetence1,
        domainBuilder.buildUserCompetence({
          ...userCompetence2,
          skills: [skillRemplir2, skillUrl3, skillRemplir4],
        }),
      ];
      knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId
        .withArgs({ userId, limitDate: 'limitDate' })
        .resolves([
          domainBuilder.buildKnowledgeElement({
            answerId: 123,
            competenceId: competenceRemplir.id,
            skillId: skillRemplir4.id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 456,
            competenceId: competenceRemplir.id,
            skillId: skillRemplir2.id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 789,
            competenceId: competenceRemplir.id,
            skillId: skillUrl3.id,
          }),
        ]);
      answerRepository.findChallengeIdsFromAnswerIds
        .withArgs([123, 456, 789])
        .resolves(['challengeRecordIdSix', 'challengeRecordIdFive', 'challengeRecordIdSeven']);
      const expectedCertificationChallenges = [
        _createCertificationChallenge(challengeForSkillRemplir4.id, skillRemplir4),
        _createCertificationChallenge(challengeForSkillUrl3.id, skillUrl3),
        _createCertificationChallenge(challengeForSkillRemplir2.id, skillRemplir2),
      ];

      // when
      const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(
        placementProfile,
        locale
      );

      // then
      expect(certificationChallenges).to.deep.equal(expectedCertificationChallenges);
    });

    it('should return the three most difficult skills sorted in desc grouped by competence', async function () {
      // given
      placementProfile.userCompetences = [
        domainBuilder.buildUserCompetence({
          ...userCompetence1,
        }),
        domainBuilder.buildUserCompetence({
          ...userCompetence2,
          skills: [skillRemplir2, skillRemplir4, skillUrl3, skillWeb1],
        }),
      ];
      knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId
        .withArgs({ userId, limitDate: 'limitDate' })
        .resolves([
          domainBuilder.buildKnowledgeElement({
            answerId: 1,
            competenceId: competenceRemplir.id,
            skillId: challengeForSkillRemplir4.skill.id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 2,
            competenceId: competenceRemplir.id,
            skillId: challengeForSkillRemplir2.skill.id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 3,
            competenceId: competenceRemplir.id,
            skillId: challengeForSkillUrl3.skill.id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 4,
            competenceId: competenceRemplir.id,
            skillId: challengeForSkillWeb1.skill.id,
          }),
        ]);
      answerRepository.findChallengeIdsFromAnswerIds
        .withArgs([1, 2, 3, 4])
        .resolves([
          challengeForSkillRemplir4.id,
          challengeForSkillRemplir2.id,
          challengeForSkillUrl3.id,
          challengeForSkillWeb1.id,
        ]);
      const expectedCertificationChallenges = [
        _createCertificationChallenge(challengeForSkillRemplir4.id, skillRemplir4),
        _createCertificationChallenge(challengeForSkillUrl3.id, skillUrl3),
        _createCertificationChallenge(challengeForSkillRemplir2.id, skillRemplir2),
      ];

      // when
      const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(
        placementProfile,
        locale
      );

      // then
      expect(certificationChallenges).to.deep.equal(expectedCertificationChallenges);
    });

    it('should not add a skill with a given id twice', async function () {
      // given
      placementProfile.userCompetences = [
        userCompetence1,
        domainBuilder.buildUserCompetence({
          ...userCompetence2,
          skills: [skillRemplir2],
        }),
      ];
      knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId
        .withArgs({ userId, limitDate: 'limitDate' })
        .resolves([
          domainBuilder.buildKnowledgeElement({
            answerId: 1,
            competenceId: competenceRemplir.id,
            skillId: skillRemplir2.id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 2,
            competenceId: competenceRemplir.id,
            skillId: skillRemplir2.id,
          }),
        ]);
      answerRepository.findChallengeIdsFromAnswerIds
        .withArgs([1, 2])
        .resolves(['challengeRecordIdFive', 'anotherChallengeForSkillRemplir2']);
      // when
      const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(
        placementProfile,
        locale
      );

      // then
      expect(certificationChallenges).to.deep.equal([
        _createCertificationChallenge(challengeForSkillRemplir2.id, skillRemplir2),
      ]);
    });

    it('should not add a skill with a given name twice', async function () {
      // given
      expect(skillRemplir2.version).to.deep.equal(1);
      expect(skillRemplir2Focus.version).to.deep.equal(2);
      placementProfile.userCompetences = [
        userCompetence1,
        domainBuilder.buildUserCompetence({
          ...userCompetence2,
          skills: [skillRemplir2, skillRemplir2Focus],
        }),
      ];
      knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId
        .withArgs({ userId, limitDate: 'limitDate' })
        .resolves([
          domainBuilder.buildKnowledgeElement({
            answerId: 1,
            competenceId: competenceRemplir.id,
            skillId: skillRemplir2.id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 2,
            competenceId: competenceRemplir.id,
            skillId: skillRemplir2Focus.id,
          }),
        ]);
      answerRepository.findChallengeIdsFromAnswerIds
        .withArgs([1, 2])
        .resolves(['challengeRecordIdFive', 'anotherChallengeForSkillRemplir2']);

      // when
      const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(
        placementProfile,
        locale
      );

      // then
      expect(certificationChallenges).to.deep.equal([
        _createCertificationChallenge(challengeForSkillRemplir2Focus.id, skillRemplir2Focus),
      ]);
    });

    it('should not assign skill, when the challenge id is not found', async function () {
      // given
      placementProfile.userCompetences = [userCompetence1, userCompetence2];
      knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId
        .withArgs({ userId, limitDate: 'limitDate' })
        .resolves([domainBuilder.buildKnowledgeElement({ answerId: 1 })]);
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([1]).resolves(['nonExistentchallengeRecordId']);
      // when
      const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(
        placementProfile,
        locale
      );

      // then
      expect(certificationChallenges).to.deep.equal([]);
    });

    it('should not assign skill, when the competence is not found', async function () {
      // given
      placementProfile.userCompetences = [userCompetence1, userCompetence2];
      knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId
        .withArgs({ userId, limitDate: 'limitDate' })
        .resolves([domainBuilder.buildKnowledgeElement({ answerId: 1 })]);
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([1]).resolves(['challengeRecordIdThree']);
      // when
      const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(
        placementProfile,
        locale
      );

      // then
      expect(certificationChallenges).to.deep.equal([]);
    });

    it('should avoid skills of same tube if there is same level challenge alternative', async function () {
      // given
      const toto6 = domainBuilder.buildSkill({
        id: 'toto6',
        name: '@toto6',
        difficulty: 6,
        tubeId: 'totoId',
        competenceId: 'competenceId',
      });
      const toto5 = domainBuilder.buildSkill({
        id: 'toto5',
        name: '@toto5',
        difficulty: 5,
        tubeId: 'totoId',
        competenceId: 'competenceId',
      });
      const toto4 = domainBuilder.buildSkill({
        id: 'toto4',
        name: '@toto4',
        difficulty: 4,
        tubeId: 'totoId',
        competenceId: 'competenceId',
      });
      const zaza4 = domainBuilder.buildSkill({
        id: 'zaza4',
        name: '@zaza4',
        difficulty: 4,
        tubeId: 'zazaId',
        competenceId: 'competenceId',
      });
      const userCompetence = domainBuilder.buildUserCompetence({
        id: 'competenceId',
        index: '1.2',
        area: { code: '1' },
        name: '1.2 Adopter un dauphin',
        pixScore: 23,
        estimatedLevel: 2,
      });
      placementProfile.userCompetences = [
        domainBuilder.buildUserCompetence({
          ...userCompetence,
          skills: [toto6, toto5, toto4, zaza4],
        }),
      ];

      challengeRepository.findOperativeHavingLocale
        .withArgs(locale)
        .resolves([
          domainBuilder.buildChallenge({ id: 'challengeToto6', competenceId: 'competenceId', skill: toto6 }),
          domainBuilder.buildChallenge({ id: 'challengeToto5', competenceId: 'competenceId', skill: toto5 }),
          domainBuilder.buildChallenge({ id: 'challengeToto4', competenceId: 'competenceId', skill: toto4 }),
          domainBuilder.buildChallenge({ id: 'challengeZaza4', competenceId: 'competenceId', skill: zaza4 }),
        ]);
      knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId
        .withArgs({ userId, limitDate: 'limitDate' })
        .resolves([
          domainBuilder.buildKnowledgeElement({
            answerId: 123,
            competenceId: 'competenceId',
            skillId: toto6.id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 456,
            competenceId: 'competenceId',
            skillId: toto5.id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 789,
            competenceId: 'competenceId',
            skillId: toto4.id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 257,
            competenceId: 'competenceId',
            skillId: zaza4.id,
          }),
        ]);
      answerRepository.findChallengeIdsFromAnswerIds
        .withArgs([123, 456, 789, 257])
        .resolves(['challengeToto6', 'challengeToto5', 'challengeToto4', 'challengeZaza4']);

      // when
      const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(
        placementProfile,
        locale
      );

      // then
      const expectedCertificationChallenges = [
        _createCertificationChallenge('challengeToto6', toto6),
        _createCertificationChallenge('challengeToto5', toto5),
        _createCertificationChallenge('challengeZaza4', zaza4),
      ];
      expect(certificationChallenges).to.deep.equal(expectedCertificationChallenges);
    });

    it('should not avoid skills of same tube if there is no challenge alternative', async function () {
      // given
      const toto6 = domainBuilder.buildSkill({
        id: 'toto6',
        name: '@toto6',
        difficulty: 6,
        tubeId: 'totoId',
        competenceId: 'competenceId',
      });
      const toto5 = domainBuilder.buildSkill({
        id: 'toto5',
        name: '@toto5',
        difficulty: 5,
        tubeId: 'totoId',
        competenceId: 'competenceId',
      });
      const mama5 = domainBuilder.buildSkill({
        id: 'mama5',
        name: '@mama5',
        difficulty: 5,
        tubeId: 'mamaId',
        competenceId: 'competenceId',
      });
      const toto4 = domainBuilder.buildSkill({
        id: 'toto4',
        name: '@toto4',
        difficulty: 4,
        tubeId: 'totoId',
        competenceId: 'competenceId',
      });
      const zaza4 = domainBuilder.buildSkill({
        id: 'zaza4',
        name: '@zaza4',
        difficulty: 4,
        tubeId: 'zazaId',
        competenceId: 'competenceId',
      });

      const userCompetence = domainBuilder.buildUserCompetence({
        id: 'competenceId',
        index: '1.2',
        area: { code: '1' },
        name: '1.2 Adopter un dauphin',
        pixScore: 23,
        estimatedLevel: 2,
      });
      placementProfile.userCompetences = [
        domainBuilder.buildUserCompetence({
          ...userCompetence,
          skills: [toto6, toto5, toto4, mama5, zaza4],
        }),
      ];

      challengeRepository.findOperativeHavingLocale
        .withArgs(locale)
        .resolves([
          domainBuilder.buildChallenge({ id: 'challengeToto6', competenceId: 'competenceId', skill: toto6 }),
          domainBuilder.buildChallenge({ id: 'challengeToto5', competenceId: 'competenceId', skill: toto5 }),
          domainBuilder.buildChallenge({ id: 'challengeToto4', competenceId: 'competenceId', skill: toto4 }),
          domainBuilder.buildChallenge({ id: 'challengeZaza4', competenceId: 'competenceId', skill: zaza4 }),
          domainBuilder.buildChallenge({ id: 'challengeMama5', competenceId: 'competenceId', skill: mama5 }),
        ]);
      knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId
        .withArgs({ userId, limitDate: 'limitDate' })
        .resolves([
          domainBuilder.buildKnowledgeElement({
            answerId: 123,
            competenceId: 'competenceId',
            skillId: toto6.id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 456,
            competenceId: 'competenceId',
            skillId: toto5.id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 789,
            competenceId: 'competenceId',
            skillId: toto4.id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 257,
            competenceId: 'competenceId',
            skillId: zaza4.id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 245,
            competenceId: 'competenceId',
            skillId: mama5.id,
          }),
        ]);
      answerRepository.findChallengeIdsFromAnswerIds
        .withArgs([123, 456, 789, 257, 245])
        .resolves(['challengeToto6', 'challengeToto5', 'challengeToto4', 'challengeZaza4', 'challengeMama5']);

      // when
      const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(
        placementProfile,
        locale
      );

      // then
      const expectedCertificationChallenges = [
        _createCertificationChallenge('challengeToto6', toto6),
        _createCertificationChallenge('challengeMama5', mama5),
        _createCertificationChallenge('challengeToto5', toto5),
      ];
      expect(certificationChallenges).to.deep.equal(expectedCertificationChallenges);
    });
  });

  describe('#pickCertificationChallengesForPixPlus', function () {
    let learningContent;
    let clock;
    const now = new Date('2019-01-01T05:06:07Z');
    function _createTubeWithSkills({ maxLevel, tubeName, tubeId, areaName }) {
      const skills = [];
      for (let i = 1; i <= maxLevel; ++i) {
        skills.push(
          domainBuilder.buildSkill({
            id: `${tubeName}${i}_id`,
            name: `@${tubeName}${i}`,
            difficulty: i,
            tubeId,
          })
        );
      }

      return domainBuilder.buildTube({
        id: tubeId,
        name: tubeName,
        competenceId: `comp_${areaName}_id`,
        skills,
      });
    }
    function _createAreaForTubes({ tubes, areaName, areaId, origin }) {
      const competence = domainBuilder.buildCompetence({
        id: `comp_${areaName}_id`,
        name: `comp_${areaName}`,
        areaId,
        tubes,
        origin,
      });
      const area = domainBuilder.buildArea({
        id: areaId,
        name: areaName,
        competences: [competence],
      });
      return area;
    }
    function _createChallengeWithDecl(challengeBaseId, skill, countDecl) {
      const challenges = [];

      for (let i = 1; i <= countDecl; ++i) {
        challenges.push(
          domainBuilder.buildChallenge({
            id: `${challengeBaseId}_dec${i}`,
            name: `${challengeBaseId}_dec${i}`,
            skill,
          })
        );
      }
      return challenges;
    }

    beforeEach(function () {
      clock = sinon.useFakeTimers(now);
      const tube1Area1 = _createTubeWithSkills({
        maxLevel: 5,
        tubeName: 'faireDesCourses',
        tubeId: 'faireDesCourses_id',
        areaName: 'reussirDehors',
      });
      const tube2Area1 = _createTubeWithSkills({
        maxLevel: 4,
        tubeName: 'direBonjour',
        tubeId: 'direBonjour_id',
        areaName: 'reussirDehors',
      });
      const tube3Area1 = _createTubeWithSkills({
        maxLevel: 5,
        tubeName: 'conduireUneVoiture',
        tubeId: 'conduireUneVoiture_id',
        areaName: 'reussirDehors',
      });
      const tube1Area2 = _createTubeWithSkills({
        maxLevel: 3,
        tubeName: 'laverLesDents',
        tubeId: 'laverLesDents_id',
        areaName: 'faireBienDedans',
      });
      const tube2Area2 = _createTubeWithSkills({
        maxLevel: 6,
        tubeName: 'faireSonLit',
        tubeId: 'faireSonLit_id',
        areaName: 'faireBienDedans',
      });
      const area1 = _createAreaForTubes({
        tubes: [tube1Area1, tube2Area1, tube3Area1],
        areaId: 'reussirDehors_id',
        areaName: 'reussirDehors',
        origin: 'PixPlusEpreuvesDeLaVie',
      });
      const area2 = _createAreaForTubes({
        tubes: [tube1Area2, tube2Area2],
        areaId: 'faireBienDedans_id',
        areaName: 'faireBienDedans',
        origin: 'PixPlusEpreuvesDeLaVie',
      });
      const framework = domainBuilder.buildFramework({ areas: [area1, area2] });

      learningContent = domainBuilder.buildLearningContent([framework]);
      sinon.stub(learningContentRepository, 'findByCampaignId').withArgs(123, locale).resolves(learningContent);
    });

    afterEach(function () {
      clock.restore();
    });

    it('should pick 4 challenges per area', async function () {
      // given
      // user knowledge elements and answers
      const keFaireDesCoursesLvl3 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 1,
        skillId: 'faireDesCourses3_id',
      });
      const keFaireDesCoursesLvl4 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 2,
        skillId: 'faireDesCourses4_id',
      });
      const keDireBonjourLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 3,
        skillId: 'direBonjour2_id',
      });
      const keConduireUneVoitureLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 4,
        skillId: 'conduireUneVoiture2_id',
      });
      const keLaverLesDentsLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 5,
        skillId: 'laverLesDents2_id',
      });
      const keLaverLesDentsLvl3 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 6,
        skillId: 'laverLesDents3_id',
      });
      const keFaireSonLitLvl4 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 7,
        skillId: 'faireSonLit4_id',
      });
      const keFaireSonLitLvl6 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 8,
        skillId: 'faireSonLit6_id',
      });
      const answerAndChallengeIdsByAnswerId = {
        1: { id: 1, challengeId: 'ch_faireDesCourses3_dec1' },
        2: { id: 2, challengeId: 'ch_faireDesCourses4_dec1' },
        3: { id: 3, challengeId: 'ch_direBonjour2_dec1' },
        4: { id: 4, challengeId: 'ch_conduireUneVoiture2_dec1' },
        5: { id: 5, challengeId: 'ch_laverLesDents2_dec1' },
        6: { id: 6, challengeId: 'ch_laverLesDents3_dec1' },
        7: { id: 7, challengeId: 'ch_faireSonLit4_dec1' },
        8: { id: 8, challengeId: 'ch_faireSonLit6_dec1' },
      };
      const certifiableProfile = domainBuilder.buildCertifiableProfileForLearningContent({
        userId: 456,
        profileDate: now,
        learningContent,
        knowledgeElements: [
          keFaireDesCoursesLvl3,
          keFaireDesCoursesLvl4,
          keDireBonjourLvl2,
          keConduireUneVoitureLvl2,
          keLaverLesDentsLvl2,
          keLaverLesDentsLvl3,
          keFaireSonLitLvl4,
          keFaireSonLitLvl6,
        ],
        answerAndChallengeIdsByAnswerId,
      });
      sinon
        .stub(certifiableProfileForLearningContentRepository, 'get')
        .withArgs({ id: 456, profileDate: now, learningContent })
        .resolves(certifiableProfile);
      // challenges
      let challenges = [];
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireDesCourses3', { id: 'faireDesCourses3_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireDesCourses4', { id: 'faireDesCourses4_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_direBonjour2', { id: 'direBonjour2_id' }, 1));
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_conduireUneVoiture2', { id: 'conduireUneVoiture2_id' }, 1)
      );
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents2', { id: 'laverLesDents2_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents3', { id: 'laverLesDents3_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit4', { id: 'faireSonLit4_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit6', { id: 'faireSonLit6_id' }, 1));
      sinon.stub(challengeRepository, 'findOperativeHavingLocale').withArgs(locale).resolves(challenges);

      // when
      const certificationChallengesForPlus = await certificationChallengesService.pickCertificationChallengesForPixPlus(
        123,
        'BADGE_KEY',
        456,
        locale
      );

      // then
      let expectedCertificationChallenges = [];
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_faireDesCourses3_dec1',
          {
            id: 'faireDesCourses3_id',
            name: '@faireDesCourses3',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_faireDesCourses4_dec1',
          {
            id: 'faireDesCourses4_id',
            name: '@faireDesCourses4',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_direBonjour2_dec1',
          {
            id: 'direBonjour2_id',
            name: '@direBonjour2',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_conduireUneVoiture2_dec1',
          {
            id: 'conduireUneVoiture2_id',
            name: '@conduireUneVoiture2',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_laverLesDents2_dec1',
          {
            id: 'laverLesDents2_id',
            name: '@laverLesDents2',
            competenceId: 'comp_faireBienDedans_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_laverLesDents3_dec1',
          {
            id: 'laverLesDents3_id',
            name: '@laverLesDents3',
            competenceId: 'comp_faireBienDedans_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_faireSonLit4_dec1',
          {
            id: 'faireSonLit4_id',
            name: '@faireSonLit4',
            competenceId: 'comp_faireBienDedans_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_faireSonLit6_dec1',
          {
            id: 'faireSonLit6_id',
            name: '@faireSonLit6',
            competenceId: 'comp_faireBienDedans_id',
          },
          'BADGE_KEY'
        )
      );
      expect(certificationChallengesForPlus).to.deep.include.members(expectedCertificationChallenges);
      expect(certificationChallengesForPlus).to.have.length(8);
    });

    it('should preferably pick non answered challenges', async function () {
      // given
      // user knowledge elements and answers
      const keFaireDesCoursesLvl3 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 1,
        skillId: 'faireDesCourses3_id',
      });
      const keFaireDesCoursesLvl4 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 2,
        skillId: 'faireDesCourses4_id',
      });
      const keDireBonjourLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 3,
        skillId: 'direBonjour2_id',
      });
      const keConduireUneVoitureLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 4,
        skillId: 'conduireUneVoiture2_id',
      });
      const keLaverLesDentsLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 5,
        skillId: 'laverLesDents2_id',
      });
      const keLaverLesDentsLvl3 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 6,
        skillId: 'laverLesDents3_id',
      });
      const keFaireSonLitLvl4 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 7,
        skillId: 'faireSonLit4_id',
      });
      const keFaireSonLitLvl6 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 8,
        skillId: 'faireSonLit6_id',
      });
      const answerAndChallengeIdsByAnswerId = {
        1: { id: 1, challengeId: 'ch_faireDesCourses3_dec1' },
        2: { id: 2, challengeId: 'ch_faireDesCourses4_dec1' },
        3: { id: 3, challengeId: 'ch_direBonjour2_dec1' },
        4: { id: 4, challengeId: 'ch_conduireUneVoiture2_dec1' },
        5: { id: 5, challengeId: 'ch_laverLesDents2_dec1' },
        6: { id: 6, challengeId: 'ch_laverLesDents3_dec1' },
        7: { id: 7, challengeId: 'ch_faireSonLit4_dec1' },
        8: { id: 8, challengeId: 'ch_faireSonLit6_dec1' },
      };
      const certifiableProfile = domainBuilder.buildCertifiableProfileForLearningContent({
        userId: 456,
        profileDate: now,
        learningContent,
        knowledgeElements: [
          keFaireDesCoursesLvl3,
          keFaireDesCoursesLvl4,
          keDireBonjourLvl2,
          keConduireUneVoitureLvl2,
          keLaverLesDentsLvl2,
          keLaverLesDentsLvl3,
          keFaireSonLitLvl4,
          keFaireSonLitLvl6,
        ],
        answerAndChallengeIdsByAnswerId,
      });
      sinon
        .stub(certifiableProfileForLearningContentRepository, 'get')
        .withArgs({ id: 456, profileDate: now, learningContent })
        .resolves(certifiableProfile);
      // challenges
      let challenges = [];
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireDesCourses3', { id: 'faireDesCourses3_id' }, 2));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireDesCourses4', { id: 'faireDesCourses4_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_direBonjour2', { id: 'direBonjour2_id' }, 2));
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_conduireUneVoiture2', { id: 'conduireUneVoiture2_id' }, 1)
      );
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents2', { id: 'laverLesDents2_id' }, 2));
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents3', { id: 'laverLesDents3_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit4', { id: 'faireSonLit4_id' }, 2));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit6', { id: 'faireSonLit6_id' }, 1));
      sinon.stub(challengeRepository, 'findOperativeHavingLocale').withArgs(locale).resolves(challenges);

      // when
      const certificationChallengesForPlus = await certificationChallengesService.pickCertificationChallengesForPixPlus(
        123,
        'BADGE_KEY',
        456,
        locale
      );

      // then
      let expectedCertificationChallenges = [];
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_faireDesCourses3_dec2',
          {
            id: 'faireDesCourses3_id',
            name: '@faireDesCourses3',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_faireDesCourses4_dec1',
          {
            id: 'faireDesCourses4_id',
            name: '@faireDesCourses4',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_direBonjour2_dec2',
          {
            id: 'direBonjour2_id',
            name: '@direBonjour2',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_conduireUneVoiture2_dec1',
          {
            id: 'conduireUneVoiture2_id',
            name: '@conduireUneVoiture2',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_laverLesDents2_dec2',
          {
            id: 'laverLesDents2_id',
            name: '@laverLesDents2',
            competenceId: 'comp_faireBienDedans_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_laverLesDents3_dec1',
          {
            id: 'laverLesDents3_id',
            name: '@laverLesDents3',
            competenceId: 'comp_faireBienDedans_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_faireSonLit4_dec2',
          {
            id: 'faireSonLit4_id',
            name: '@faireSonLit4',
            competenceId: 'comp_faireBienDedans_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_faireSonLit6_dec1',
          {
            id: 'faireSonLit6_id',
            name: '@faireSonLit6',
            competenceId: 'comp_faireBienDedans_id',
          },
          'BADGE_KEY'
        )
      );
      expect(certificationChallengesForPlus).to.deep.include.members(expectedCertificationChallenges);
      expect(certificationChallengesForPlus).to.have.length(8);
    });

    it('should prioritize on hardest skill per area', async function () {
      // given
      // user knowledge elements and answers
      const keFaireDesCoursesLvl3 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 1,
        skillId: 'faireDesCourses3_id',
      });
      const keFaireDesCoursesLvl4 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 2,
        skillId: 'faireDesCourses4_id',
      });
      const keDireBonjourLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 3,
        skillId: 'direBonjour2_id',
      });
      const keConduireUneVoitureLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 4,
        skillId: 'conduireUneVoiture2_id',
      });
      const keLaverLesDentsLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 5,
        skillId: 'laverLesDents2_id',
      });
      const keLaverLesDentsLvl3 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 6,
        skillId: 'laverLesDents3_id',
      });
      const keFaireSonLitLvl4 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 7,
        skillId: 'faireSonLit4_id',
      });
      const keFaireSonLitLvl5 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 8,
        skillId: 'faireSonLit5_id',
      });
      const keFaireSonLitLvl6 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 9,
        skillId: 'faireSonLit6_id',
      });
      const answerAndChallengeIdsByAnswerId = {
        1: { id: 1, challengeId: 'ch_faireDesCourses3_dec1' },
        2: { id: 2, challengeId: 'ch_faireDesCourses4_dec1' },
        3: { id: 3, challengeId: 'ch_direBonjour2_dec1' },
        4: { id: 4, challengeId: 'ch_conduireUneVoiture2_dec1' },
        5: { id: 5, challengeId: 'ch_laverLesDents2_dec1' },
        6: { id: 6, challengeId: 'ch_laverLesDents3_dec1' },
        7: { id: 7, challengeId: 'ch_faireSonLit4_dec1' },
        8: { id: 8, challengeId: 'ch_faireSonLit5_dec1' },
        9: { id: 9, challengeId: 'ch_faireSonLit6_dec1' },
      };
      const certifiableProfile = domainBuilder.buildCertifiableProfileForLearningContent({
        userId: 456,
        profileDate: now,
        learningContent,
        knowledgeElements: [
          keFaireDesCoursesLvl4,
          keFaireDesCoursesLvl3,
          keDireBonjourLvl2,
          keConduireUneVoitureLvl2,
          keLaverLesDentsLvl3,
          keLaverLesDentsLvl2,
          keFaireSonLitLvl4,
          keFaireSonLitLvl5,
          keFaireSonLitLvl6,
        ],
        answerAndChallengeIdsByAnswerId,
      });
      sinon
        .stub(certifiableProfileForLearningContentRepository, 'get')
        .withArgs({ id: 456, profileDate: now, learningContent })
        .resolves(certifiableProfile);
      // challenges
      let challenges = [];
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireDesCourses3', { id: 'faireDesCourses3_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireDesCourses4', { id: 'faireDesCourses4_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_direBonjour2', { id: 'direBonjour2_id' }, 1));
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_conduireUneVoiture2', { id: 'conduireUneVoiture2_id' }, 1)
      );
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents2', { id: 'laverLesDents2_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents3', { id: 'laverLesDents3_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit4', { id: 'faireSonLit4_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit5', { id: 'faireSonLit5_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit6', { id: 'faireSonLit6_id' }, 1));
      sinon.stub(challengeRepository, 'findOperativeHavingLocale').withArgs(locale).resolves(challenges);

      // when
      const certificationChallengesForPlus = await certificationChallengesService.pickCertificationChallengesForPixPlus(
        123,
        'BADGE_KEY',
        456,
        locale
      );

      // then
      let expectedCertificationChallenges = [];
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_faireDesCourses4_dec1',
          {
            id: 'faireDesCourses4_id',
            name: '@faireDesCourses4',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_faireDesCourses3_dec1',
          {
            id: 'faireDesCourses3_id',
            name: '@faireDesCourses3',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_conduireUneVoiture2_dec1',
          {
            id: 'conduireUneVoiture2_id',
            name: '@conduireUneVoiture2',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_direBonjour2_dec1',
          {
            id: 'direBonjour2_id',
            name: '@direBonjour2',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_faireSonLit6_dec1',
          {
            id: 'faireSonLit6_id',
            name: '@faireSonLit6',
            competenceId: 'comp_faireBienDedans_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_faireSonLit5_dec1',
          {
            id: 'faireSonLit5_id',
            name: '@faireSonLit5',
            competenceId: 'comp_faireBienDedans_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_faireSonLit4_dec1',
          {
            id: 'faireSonLit4_id',
            name: '@faireSonLit4',
            competenceId: 'comp_faireBienDedans_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_laverLesDents3_dec1',
          {
            id: 'laverLesDents3_id',
            name: '@laverLesDents3',
            competenceId: 'comp_faireBienDedans_id',
          },
          'BADGE_KEY'
        )
      );

      expect(certificationChallengesForPlus).to.deepEqualArray(expectedCertificationChallenges);
    });

    it('should exclude skill which origin is Pix', async function () {
      // given
      learningContent.findCompetence('comp_faireBienDedans_id').origin = PIX_ORIGIN;
      // user knowledge elements and answers
      const keFaireDesCoursesLvl3 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 1,
        skillId: 'faireDesCourses3_id',
      });
      const keFaireDesCoursesLvl4 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 2,
        skillId: 'faireDesCourses4_id',
      });
      const keDireBonjourLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 3,
        skillId: 'direBonjour2_id',
      });
      const keConduireUneVoitureLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 4,
        skillId: 'conduireUneVoiture2_id',
      });
      const keLaverLesDentsLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 5,
        skillId: 'laverLesDents2_id',
      });
      const keLaverLesDentsLvl3 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 6,
        skillId: 'laverLesDents3_id',
      });
      const keFaireSonLitLvl4 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 7,
        skillId: 'faireSonLit4_id',
      });
      const keFaireSonLitLvl5 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 8,
        skillId: 'faireSonLit5_id',
      });
      const keFaireSonLitLvl6 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 9,
        skillId: 'faireSonLit6_id',
      });
      const answerAndChallengeIdsByAnswerId = {
        1: { id: 1, challengeId: 'ch_faireDesCourses3_dec1' },
        2: { id: 2, challengeId: 'ch_faireDesCourses4_dec1' },
        3: { id: 3, challengeId: 'ch_direBonjour2_dec1' },
        4: { id: 4, challengeId: 'ch_conduireUneVoiture2_dec1' },
        5: { id: 5, challengeId: 'ch_laverLesDents2_dec1' },
        6: { id: 6, challengeId: 'ch_laverLesDents3_dec1' },
        7: { id: 7, challengeId: 'ch_faireSonLit4_dec1' },
        8: { id: 8, challengeId: 'ch_faireSonLit5_dec1' },
        9: { id: 9, challengeId: 'ch_faireSonLit6_dec1' },
      };
      const certifiableProfile = domainBuilder.buildCertifiableProfileForLearningContent({
        userId: 456,
        profileDate: now,
        learningContent,
        knowledgeElements: [
          keFaireDesCoursesLvl3,
          keFaireDesCoursesLvl4,
          keDireBonjourLvl2,
          keConduireUneVoitureLvl2,
          keLaverLesDentsLvl2,
          keLaverLesDentsLvl3,
          keFaireSonLitLvl4,
          keFaireSonLitLvl6,
          keFaireSonLitLvl5,
        ],
        answerAndChallengeIdsByAnswerId,
      });
      sinon
        .stub(certifiableProfileForLearningContentRepository, 'get')
        .withArgs({ id: 456, profileDate: now, learningContent })
        .resolves(certifiableProfile);
      // challenges
      let challenges = [];
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireDesCourses3', { id: 'faireDesCourses3_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireDesCourses4', { id: 'faireDesCourses4_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_direBonjour2', { id: 'direBonjour2_id' }, 1));
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_conduireUneVoiture2', { id: 'conduireUneVoiture2_id' }, 1)
      );
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents2', { id: 'laverLesDents2_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents3', { id: 'laverLesDents3_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit4', { id: 'faireSonLit4_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit5', { id: 'faireSonLit5_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit6', { id: 'faireSonLit6_id' }, 1));
      sinon.stub(challengeRepository, 'findOperativeHavingLocale').withArgs(locale).resolves(challenges);

      // when
      const certificationChallengesForPlus = await certificationChallengesService.pickCertificationChallengesForPixPlus(
        123,
        'BADGE_KEY',
        456,
        locale
      );

      // then
      let expectedCertificationChallenges = [];
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_faireDesCourses3_dec1',
          {
            id: 'faireDesCourses3_id',
            name: '@faireDesCourses3',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_faireDesCourses4_dec1',
          {
            id: 'faireDesCourses4_id',
            name: '@faireDesCourses4',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_direBonjour2_dec1',
          {
            id: 'direBonjour2_id',
            name: '@direBonjour2',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_conduireUneVoiture2_dec1',
          {
            id: 'conduireUneVoiture2_id',
            name: '@conduireUneVoiture2',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expect(certificationChallengesForPlus).to.deep.include.members(expectedCertificationChallenges);
      expect(certificationChallengesForPlus).to.have.length(4);
    });

    it('should return an empty array when there is only challenges from origin Pix', async function () {
      // given
      learningContent.competences.forEach((competence) => (competence.origin = PIX_ORIGIN));

      // user knowledge elements and answers
      const keFaireDesCoursesLvl3 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 1,
        skillId: 'faireDesCourses3_id',
      });
      const keFaireDesCoursesLvl4 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 2,
        skillId: 'faireDesCourses4_id',
      });
      const keDireBonjourLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 3,
        skillId: 'direBonjour2_id',
      });
      const keConduireUneVoitureLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 4,
        skillId: 'conduireUneVoiture2_id',
      });
      const keLaverLesDentsLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 5,
        skillId: 'laverLesDents2_id',
      });
      const keLaverLesDentsLvl3 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 6,
        skillId: 'laverLesDents3_id',
      });
      const keFaireSonLitLvl4 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 7,
        skillId: 'faireSonLit4_id',
      });
      const keFaireSonLitLvl5 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 8,
        skillId: 'faireSonLit5_id',
      });
      const keFaireSonLitLvl6 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 9,
        skillId: 'faireSonLit6_id',
      });
      const answerAndChallengeIdsByAnswerId = {
        1: { id: 1, challengeId: 'ch_faireDesCourses3_dec1' },
        2: { id: 2, challengeId: 'ch_faireDesCourses4_dec1' },
        3: { id: 3, challengeId: 'ch_direBonjour2_dec1' },
        4: { id: 4, challengeId: 'ch_conduireUneVoiture2_dec1' },
        5: { id: 5, challengeId: 'ch_laverLesDents2_dec1' },
        6: { id: 6, challengeId: 'ch_laverLesDents3_dec1' },
        7: { id: 7, challengeId: 'ch_faireSonLit4_dec1' },
        8: { id: 8, challengeId: 'ch_faireSonLit5_dec1' },
        9: { id: 9, challengeId: 'ch_faireSonLit6_dec1' },
      };
      const certifiableProfile = domainBuilder.buildCertifiableProfileForLearningContent({
        userId: 456,
        profileDate: now,
        learningContent,
        knowledgeElements: [
          keFaireDesCoursesLvl3,
          keFaireDesCoursesLvl4,
          keDireBonjourLvl2,
          keConduireUneVoitureLvl2,
          keLaverLesDentsLvl2,
          keLaverLesDentsLvl3,
          keFaireSonLitLvl4,
          keFaireSonLitLvl6,
          keFaireSonLitLvl5,
        ],
        answerAndChallengeIdsByAnswerId,
      });
      sinon
        .stub(certifiableProfileForLearningContentRepository, 'get')
        .withArgs({ id: 456, profileDate: now, learningContent })
        .resolves(certifiableProfile);
      // challenges
      let challenges = [];
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireDesCourses3', { id: 'faireDesCourses3_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireDesCourses4', { id: 'faireDesCourses4_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_direBonjour2', { id: 'direBonjour2_id' }, 1));
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_conduireUneVoiture2', { id: 'conduireUneVoiture2_id' }, 1)
      );
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents2', { id: 'laverLesDents2_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents3', { id: 'laverLesDents3_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit4', { id: 'faireSonLit4_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit5', { id: 'faireSonLit5_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit6', { id: 'faireSonLit6_id' }, 1));
      sinon.stub(challengeRepository, 'findOperativeHavingLocale').withArgs(locale).resolves(challenges);

      // when
      const certificationChallengesForPlus = await certificationChallengesService.pickCertificationChallengesForPixPlus(
        123,
        'BADGE_KEY',
        456,
        locale
      );

      // then
      expect(certificationChallengesForPlus).to.be.empty;
    });

    it('should avoid select the same challenge twice', async function () {
      // given
      // user knowledge elements and answers
      const keFaireDesCoursesLvl3 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 1,
        skillId: 'faireDesCourses3_id',
      });
      const keFaireDesCoursesLvl4 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 2,
        skillId: 'faireDesCourses4_id',
      });
      const keDireBonjourLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 3,
        skillId: 'direBonjour2_id',
      });
      const keConduireUneVoitureLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 4,
        skillId: 'conduireUneVoiture2_id',
      });
      const keLaverLesDentsLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 5,
        skillId: 'laverLesDents2_id',
      });
      const keLaverLesDentsLvl3 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 6,
        skillId: 'laverLesDents3_id',
      });
      const keFaireSonLitLvl4 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 7,
        skillId: 'faireSonLit4_id',
      });
      const keFaireSonLitLvl6 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 8,
        skillId: 'faireSonLit6_id',
      });
      const answerAndChallengeIdsByAnswerId = {
        1: { id: 1, challengeId: 'ch_faireDesCourses3_dec1' },
        2: { id: 2, challengeId: 'ch_faireDesCourses4_dec1' },
        3: { id: 3, challengeId: 'ch_direBonjour2_dec1' },
        4: { id: 4, challengeId: 'ch_conduireUneVoiture2_dec1' },
        5: { id: 5, challengeId: 'ch_laverLesDents2_dec1' },
        6: { id: 6, challengeId: 'ch_laverLesDents3_dec1' },
        7: { id: 7, challengeId: 'ch_faireSonLit4_dec1' },
        8: { id: 8, challengeId: 'ch_faireSonLit6_dec1' },
      };
      const certifiableProfile = domainBuilder.buildCertifiableProfileForLearningContent({
        userId: 456,
        profileDate: now,
        learningContent,
        knowledgeElements: [
          keFaireDesCoursesLvl3,
          keFaireDesCoursesLvl4,
          keDireBonjourLvl2,
          keConduireUneVoitureLvl2,
          keLaverLesDentsLvl2,
          keLaverLesDentsLvl3,
          keFaireSonLitLvl4,
          keFaireSonLitLvl6,
        ],
        answerAndChallengeIdsByAnswerId,
      });
      sinon
        .stub(certifiableProfileForLearningContentRepository, 'get')
        .withArgs({ id: 456, profileDate: now, learningContent })
        .resolves(certifiableProfile);
      // challenges
      let challenges = [];
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireDesCourses3', { id: 'faireDesCourses3_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireDesCourses4', { id: 'faireDesCourses4_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_direBonjour2', { id: 'direBonjour2_id' }, 1));
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_conduireUneVoiture2', { id: 'conduireUneVoiture2_id' }, 1)
      );
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents2', { id: 'laverLesDents2_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents3', { id: 'laverLesDents3_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit', { id: 'faireSonLit6_id' }, 1));
      sinon.stub(challengeRepository, 'findOperativeHavingLocale').withArgs(locale).resolves(challenges);

      // when
      const certificationChallengesForPlus = await certificationChallengesService.pickCertificationChallengesForPixPlus(
        123,
        'BADGE_KEY',
        456,
        locale
      );

      // then
      let expectedCertificationChallenges = [];
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_faireDesCourses3_dec1',
          {
            id: 'faireDesCourses3_id',
            name: '@faireDesCourses3',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_faireDesCourses4_dec1',
          {
            id: 'faireDesCourses4_id',
            name: '@faireDesCourses4',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_direBonjour2_dec1',
          {
            id: 'direBonjour2_id',
            name: '@direBonjour2',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_conduireUneVoiture2_dec1',
          {
            id: 'conduireUneVoiture2_id',
            name: '@conduireUneVoiture2',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_laverLesDents2_dec1',
          {
            id: 'laverLesDents2_id',
            name: '@laverLesDents2',
            competenceId: 'comp_faireBienDedans_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_laverLesDents3_dec1',
          {
            id: 'laverLesDents3_id',
            name: '@laverLesDents3',
            competenceId: 'comp_faireBienDedans_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_faireSonLit_dec1',
          {
            id: 'faireSonLit6_id',
            name: '@faireSonLit6',
            competenceId: 'comp_faireBienDedans_id',
          },
          'BADGE_KEY'
        )
      );
      expect(certificationChallengesForPlus).to.deep.include.members(expectedCertificationChallenges);
      expect(certificationChallengesForPlus).to.have.length(7);
    });

    it('should only consider directly validated skill', async function () {
      // given
      // user knowledge elements and answers
      const keFaireDesCoursesLvl3 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 1,
        skillId: 'faireDesCourses3_id',
      });
      const keFaireDesCoursesLvl4 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 2,
        skillId: 'faireDesCourses4_id',
      });
      const keDireBonjourLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 3,
        skillId: 'direBonjour2_id',
      });
      const keConduireUneVoitureLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 4,
        skillId: 'conduireUneVoiture2_id',
      });
      const keLaverLesDentsLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 5,
        skillId: 'laverLesDents2_id',
      });
      const keLaverLesDentsLvl3 = domainBuilder.buildKnowledgeElement.directlyValidated({
        answerId: 6,
        skillId: 'laverLesDents3_id',
      });
      const keFaireSonLitLvl4 = domainBuilder.buildKnowledgeElement.directlyInvalidated({
        answerId: 7,
        skillId: 'faireSonLit4_id',
      });
      const keFaireSonLitLvl6 = domainBuilder.buildKnowledgeElement.inferredValidated({
        answerId: 8,
        skillId: 'faireSonLit6_id',
      });
      const answerAndChallengeIdsByAnswerId = {
        1: { id: 1, challengeId: 'ch_faireDesCourses3_dec1' },
        2: { id: 2, challengeId: 'ch_faireDesCourses4_dec1' },
        3: { id: 3, challengeId: 'ch_direBonjour2_dec1' },
        4: { id: 4, challengeId: 'ch_conduireUneVoiture2_dec1' },
        5: { id: 5, challengeId: 'ch_laverLesDents2_dec1' },
        6: { id: 6, challengeId: 'ch_laverLesDents3_dec1' },
        7: { id: 7, challengeId: 'ch_faireSonLit4_dec1' },
        8: { id: 8, challengeId: 'ch_faireSonLit6_dec1' },
      };
      const certifiableProfile = domainBuilder.buildCertifiableProfileForLearningContent({
        userId: 456,
        profileDate: now,
        learningContent,
        knowledgeElements: [
          keFaireDesCoursesLvl3,
          keFaireDesCoursesLvl4,
          keDireBonjourLvl2,
          keConduireUneVoitureLvl2,
          keLaverLesDentsLvl2,
          keLaverLesDentsLvl3,
          keFaireSonLitLvl4,
          keFaireSonLitLvl6,
        ],
        answerAndChallengeIdsByAnswerId,
      });
      sinon
        .stub(certifiableProfileForLearningContentRepository, 'get')
        .withArgs({ id: 456, profileDate: now, learningContent })
        .resolves(certifiableProfile);
      // challenges
      let challenges = [];
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireDesCourses3', { id: 'faireDesCourses3_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireDesCourses4', { id: 'faireDesCourses4_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_direBonjour2', { id: 'direBonjour2_id' }, 1));
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_conduireUneVoiture2', { id: 'conduireUneVoiture2_id' }, 1)
      );
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents2', { id: 'laverLesDents2_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents3', { id: 'laverLesDents3_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit4', { id: 'faireSonLit4_id' }, 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit6', { id: 'faireSonLit6_id' }, 1));
      sinon.stub(challengeRepository, 'findOperativeHavingLocale').withArgs(locale).resolves(challenges);

      // when
      const certificationChallengesForPlus = await certificationChallengesService.pickCertificationChallengesForPixPlus(
        123,
        'BADGE_KEY',
        456,
        locale
      );

      // then
      let expectedCertificationChallenges = [];
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_faireDesCourses3_dec1',
          {
            id: 'faireDesCourses3_id',
            name: '@faireDesCourses3',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_faireDesCourses4_dec1',
          {
            id: 'faireDesCourses4_id',
            name: '@faireDesCourses4',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_direBonjour2_dec1',
          {
            id: 'direBonjour2_id',
            name: '@direBonjour2',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_conduireUneVoiture2_dec1',
          {
            id: 'conduireUneVoiture2_id',
            name: '@conduireUneVoiture2',
            competenceId: 'comp_reussirDehors_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_laverLesDents2_dec1',
          {
            id: 'laverLesDents2_id',
            name: '@laverLesDents2',
            competenceId: 'comp_faireBienDedans_id',
          },
          'BADGE_KEY'
        )
      );
      expectedCertificationChallenges = expectedCertificationChallenges.concat(
        _createCertificationChallenge(
          'ch_laverLesDents3_dec1',
          {
            id: 'laverLesDents3_id',
            name: '@laverLesDents3',
            competenceId: 'comp_faireBienDedans_id',
          },
          'BADGE_KEY'
        )
      );
      expect(certificationChallengesForPlus).to.deep.include.members(expectedCertificationChallenges);
      expect(certificationChallengesForPlus).to.have.length(6);
    });

    context('when there is no specific referential', function () {
      it('should return empty array', async function () {
        // given
        // user knowledge elements and answers
        const keFaireDesCoursesLvl3 = domainBuilder.buildKnowledgeElement.directlyValidated({
          answerId: 1,
          skillId: 'faireDesCourses3_id',
        });
        const keFaireDesCoursesLvl4 = domainBuilder.buildKnowledgeElement.directlyValidated({
          answerId: 2,
          skillId: 'faireDesCourses4_id',
        });
        const keDireBonjourLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
          answerId: 3,
          skillId: 'direBonjour2_id',
        });
        const keConduireUneVoitureLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
          answerId: 4,
          skillId: 'conduireUneVoiture2_id',
        });
        const keLaverLesDentsLvl2 = domainBuilder.buildKnowledgeElement.directlyValidated({
          answerId: 5,
          skillId: 'laverLesDents2_id',
        });
        const keLaverLesDentsLvl3 = domainBuilder.buildKnowledgeElement.directlyValidated({
          answerId: 6,
          skillId: 'laverLesDents3_id',
        });
        const keFaireSonLitLvl4 = domainBuilder.buildKnowledgeElement.directlyValidated({
          answerId: 7,
          skillId: 'faireSonLit4_id',
        });
        const keFaireSonLitLvl6 = domainBuilder.buildKnowledgeElement.directlyValidated({
          answerId: 8,
          skillId: 'faireSonLit6_id',
        });
        const answerAndChallengeIdsByAnswerId = {
          1: { id: 1, challengeId: 'ch_faireDesCourses3_dec1' },
          2: { id: 2, challengeId: 'ch_faireDesCourses4_dec1' },
          3: { id: 3, challengeId: 'ch_direBonjour2_dec1' },
          4: { id: 4, challengeId: 'ch_conduireUneVoiture2_dec1' },
          5: { id: 5, challengeId: 'ch_laverLesDents2_dec1' },
          6: { id: 6, challengeId: 'ch_laverLesDents3_dec1' },
          7: { id: 7, challengeId: 'ch_faireSonLit4_dec1' },
          8: { id: 8, challengeId: 'ch_faireSonLit6_dec1' },
        };
        const certifiableProfile = domainBuilder.buildCertifiableProfileForLearningContent({
          userId: 456,
          profileDate: now,
          learningContent,
          knowledgeElements: [
            keFaireDesCoursesLvl3,
            keFaireDesCoursesLvl4,
            keDireBonjourLvl2,
            keConduireUneVoitureLvl2,
            keLaverLesDentsLvl2,
            keLaverLesDentsLvl3,
            keFaireSonLitLvl4,
            keFaireSonLitLvl6,
          ],
          answerAndChallengeIdsByAnswerId,
        });
        sinon
          .stub(certifiableProfileForLearningContentRepository, 'get')
          .withArgs({ id: 456, profileDate: now, learningContent })
          .resolves(certifiableProfile);
        // challenges
        let challenges = [];
        challenges = challenges.concat(
          _createChallengeWithDecl('ch_faireDesCourses3', { id: 'faireDesCourses3_id' }, 1)
        );
        challenges = challenges.concat(
          _createChallengeWithDecl('ch_faireDesCourses4', { id: 'faireDesCourses4_id' }, 1)
        );
        challenges = challenges.concat(_createChallengeWithDecl('ch_direBonjour2', { id: 'direBonjour2_id' }, 1));
        challenges = challenges.concat(
          _createChallengeWithDecl('ch_conduireUneVoiture2', { id: 'conduireUneVoiture2_id' }, 1)
        );
        challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents2', { id: 'laverLesDents2_id' }, 1));
        challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents3', { id: 'laverLesDents3_id' }, 1));
        challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit4', { id: 'faireSonLit4_id' }, 1));
        challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit6', { id: 'faireSonLit6_id' }, 1));
        sinon.stub(challengeRepository, 'findOperativeHavingLocale').withArgs(locale).resolves(challenges);

        // when
        const certificationChallengesForPlus =
          await certificationChallengesService.pickCertificationChallengesForPixPlus(123, 'BADGE_KEY', 456, locale);

        // then
        let expectedCertificationChallenges = [];
        expectedCertificationChallenges = expectedCertificationChallenges.concat(
          _createCertificationChallenge(
            'ch_faireDesCourses3_dec1',
            {
              id: 'faireDesCourses3_id',
              name: '@faireDesCourses3',
              competenceId: 'comp_reussirDehors_id',
            },
            'BADGE_KEY'
          )
        );
        expectedCertificationChallenges = expectedCertificationChallenges.concat(
          _createCertificationChallenge(
            'ch_faireDesCourses4_dec1',
            {
              id: 'faireDesCourses4_id',
              name: '@faireDesCourses4',
              competenceId: 'comp_reussirDehors_id',
            },
            'BADGE_KEY'
          )
        );
        expectedCertificationChallenges = expectedCertificationChallenges.concat(
          _createCertificationChallenge(
            'ch_direBonjour2_dec1',
            {
              id: 'direBonjour2_id',
              name: '@direBonjour2',
              competenceId: 'comp_reussirDehors_id',
            },
            'BADGE_KEY'
          )
        );
        expectedCertificationChallenges = expectedCertificationChallenges.concat(
          _createCertificationChallenge(
            'ch_conduireUneVoiture2_dec1',
            {
              id: 'conduireUneVoiture2_id',
              name: '@conduireUneVoiture2',
              competenceId: 'comp_reussirDehors_id',
            },
            'BADGE_KEY'
          )
        );
        expectedCertificationChallenges = expectedCertificationChallenges.concat(
          _createCertificationChallenge(
            'ch_laverLesDents2_dec1',
            {
              id: 'laverLesDents2_id',
              name: '@laverLesDents2',
              competenceId: 'comp_faireBienDedans_id',
            },
            'BADGE_KEY'
          )
        );
        expectedCertificationChallenges = expectedCertificationChallenges.concat(
          _createCertificationChallenge(
            'ch_laverLesDents3_dec1',
            {
              id: 'laverLesDents3_id',
              name: '@laverLesDents3',
              competenceId: 'comp_faireBienDedans_id',
            },
            'BADGE_KEY'
          )
        );
        expectedCertificationChallenges = expectedCertificationChallenges.concat(
          _createCertificationChallenge(
            'ch_faireSonLit4_dec1',
            {
              id: 'faireSonLit4_id',
              name: '@faireSonLit4',
              competenceId: 'comp_faireBienDedans_id',
            },
            'BADGE_KEY'
          )
        );
        expectedCertificationChallenges = expectedCertificationChallenges.concat(
          _createCertificationChallenge(
            'ch_faireSonLit6_dec1',
            {
              id: 'faireSonLit6_id',
              name: '@faireSonLit6',
              competenceId: 'comp_faireBienDedans_id',
            },
            'BADGE_KEY'
          )
        );
        expect(certificationChallengesForPlus).to.deep.include.members(expectedCertificationChallenges);
        expect(certificationChallengesForPlus).to.have.length(8);
      });
    });
  });
});
