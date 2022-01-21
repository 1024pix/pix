const _ = require('lodash');

const { expect, sinon, domainBuilder } = require('../../../test-helper');
const { PIX_ORIGIN } = require('../../../../lib/domain/constants');

const CertificationChallenge = require('../../../../lib/domain/models/CertificationChallenge');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Competence = require('../../../../lib/domain/models/Competence');
const PlacementProfile = require('../../../../lib/domain/models/PlacementProfile');
const Skill = require('../../../../lib/domain/models/Skill');
const UserCompetence = require('../../../../lib/domain/models/UserCompetence');

const certificationChallengesService = require('../../../../lib/domain/services/certification-challenges-service');

const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');
const challengeRepository = require('../../../../lib/infrastructure/repositories/challenge-repository');
const knowledgeElementRepository = require('../../../../lib/infrastructure/repositories/knowledge-element-repository');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
const targetProfileWithLearningContentRepository = require('../../../../lib/infrastructure/repositories/target-profile-with-learning-content-repository');
const certifiableProfileForLearningContentRepository = require('../../../../lib/infrastructure/repositories/certifiable-profile-for-learning-content-repository');

describe('Unit | Service | Certification Challenge Service', function () {
  const userId = 63731;
  const locale = 'fr-fr';

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

  function _createCertificationChallenge(challengeId, skill, certifiableBadgeKey = null) {
    return new CertificationChallenge({
      challengeId,
      associatedSkillName: skill.name,
      associatedSkillId: skill.id,
      competenceId: skill.competenceId,
      isNeutralized: false,
      certifiableBadgeKey,
    });
  }

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const competenceFlipper = _createCompetence('competenceRecordIdOne', '1.1', '1.1 Construire un flipper', '1');
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const competenceRemplir = _createCompetence('competenceRecordIdTwo', '1.2', '1.2 Adopter un dauphin', '1');
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const competenceRequin = _createCompetence(
    'competenceRecordIdThree',
    '1.3',
    '1.3 Se faire manger par un requin',
    '1'
  );
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const competenceKoala = _createCompetence('competenceRecordIdKoala', '1.3', '1.3 Se faire manger par un koala', '1');

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const skillCitation4 = new Skill({ id: 10, name: '@citation4', competenceId: competenceFlipper.id });
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const skillCollaborer4 = new Skill({ id: 20, name: '@collaborer4', competenceId: competenceFlipper.id });
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const skillMoteur3 = new Skill({ id: 30, name: '@moteur3', competenceId: competenceFlipper.id });
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const skillRecherche4 = new Skill({ id: 40, name: '@recherche4', competenceId: competenceFlipper.id });
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const skillRemplir2 = new Skill({ id: 50, name: '@remplir2', competenceId: competenceRemplir.id, version: 1 });
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const skillRemplir2Focus = new Skill({ id: 1789, name: '@remplir2', competenceId: competenceRemplir.id, version: 2 });
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const skillRemplir4 = new Skill({ id: 60, name: '@remplir4', competenceId: competenceRemplir.id });
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const skillUrl3 = new Skill({ id: 70, name: '@url3', competenceId: competenceRemplir.id });
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const skillWeb1 = new Skill({ id: 80, name: '@web1', competenceId: competenceRemplir.id });
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const skillRequin5 = new Skill({ id: 110, name: '@requin5', competenceId: competenceRequin.id });
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const skillRequin8 = new Skill({ id: 120, name: '@requin8', competenceId: competenceRequin.id });
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const skillKoala1 = new Skill({ id: 110, name: '@koala1', competenceId: competenceKoala.id });
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const skillKoala2 = new Skill({ id: 120, name: '@koala2', competenceId: competenceKoala.id });

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

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const challengeForSkillCollaborer4 = _createChallenge(
    'challengeRecordIdThree',
    'competenceRecordIdThatDoesNotExistAnymore',
    [skillCollaborer4],
    '@collaborer4'
  );

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const challengeForSkillCitation4 = _createChallenge(
    'challengeRecordIdOne',
    // eslint-disable-next-line mocha/no-setup-in-describe
    competenceFlipper.id,
    [skillCitation4],
    '@citation4'
  );
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const challengeForSkillCitation4AndMoteur3 = _createChallenge(
    'challengeRecordIdTwo',
    // eslint-disable-next-line mocha/no-setup-in-describe
    competenceFlipper.id,
    [skillCitation4, skillMoteur3],
    '@citation4'
  );
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const challengeForSkillRecherche4 = _createChallenge(
    'challengeRecordIdFour',
    // eslint-disable-next-line mocha/no-setup-in-describe
    competenceFlipper.id,
    [skillRecherche4],
    '@recherche4'
  );
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const challengeRecordWithoutSkills = _createChallenge('challengeRecordIdNine', competenceFlipper.id, [], null);
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const anotherChallengeForSkillCitation4 = _createChallenge(
    'challengeRecordIdTen',
    // eslint-disable-next-line mocha/no-setup-in-describe
    competenceFlipper.id,
    [skillCitation4],
    '@citation4'
  );
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const challengeForSkillKoala1 = _createChallenge(
    'challengeRecordIdKoala1',
    // eslint-disable-next-line mocha/no-setup-in-describe
    competenceKoala.id,
    [skillKoala1],
    // eslint-disable-next-line mocha/no-setup-in-describe
    skillKoala1.name
  );
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const challengeForSkillKoala2 = _createChallenge(
    'challengeRecordIdKoala2',
    // eslint-disable-next-line mocha/no-setup-in-describe
    competenceKoala.id,
    [skillKoala2],
    // eslint-disable-next-line mocha/no-setup-in-describe
    skillKoala2.name
  );

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const challengeForSkillRemplir2 = _createChallenge(
    'challengeRecordIdFive',
    // eslint-disable-next-line mocha/no-setup-in-describe
    competenceRemplir.id,
    [skillRemplir2],
    '@remplir2'
  );
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const challengeForSkillRemplir2Focus = _createChallenge(
    'challengeRecordIdFiveFocus',
    // eslint-disable-next-line mocha/no-setup-in-describe
    competenceRemplir.id,
    [skillRemplir2Focus],
    '@remplir2'
  );
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  _createChallenge('anotherChallengeForSkillRemplir2', competenceRemplir.id, [skillRemplir2], '@remplir2');
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const challengeForSkillRemplir4 = _createChallenge(
    'challengeRecordIdSix',
    // eslint-disable-next-line mocha/no-setup-in-describe
    competenceRemplir.id,
    [skillRemplir4],
    '@remplir4'
  );
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const challengeForSkillUrl3 = _createChallenge('challengeRecordIdSeven', competenceRemplir.id, [skillUrl3], '@url3');
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const challengeForSkillWeb1 = _createChallenge('challengeRecordIdEight', competenceRemplir.id, [skillWeb1], '@web1');

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const challengeForSkillRequin5 = _createChallenge(
    'challengeRecordIdNine',
    // eslint-disable-next-line mocha/no-setup-in-describe
    competenceRequin.id,
    [skillRequin5],
    '@requin5'
  );
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const challengeForSkillRequin8 = _createChallenge(
    'challengeRecordIdTen',
    // eslint-disable-next-line mocha/no-setup-in-describe
    competenceRequin.id,
    [skillRequin8],
    '@requin8'
  );

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
          challengeForSkillCitation4AndMoteur3,
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
      userCompetence1 = new UserCompetence({
        id: 'competenceRecordIdOne',
        index: '1.1',
        area: { code: '1' },
        name: '1.1 Construire un flipper',
        pixScore: 12,
        estimatedLevel: 1,
      });
      userCompetence2 = new UserCompetence({
        id: 'competenceRecordIdTwo',
        index: '1.2',
        area: { code: '1' },
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
        new UserCompetence({
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
          new UserCompetence({
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
              skillId: challengeForSkillCitation4.skills[0].id,
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
          new UserCompetence({
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
              skillId: challengeForSkillRecherche4.skills[0].id,
            }),
            domainBuilder.buildKnowledgeElement({
              answerId: 456,
              competenceId: competenceFlipper.id,
              skillId: challengeForSkillCitation4AndMoteur3.skills[0].id,
            }),
            domainBuilder.buildKnowledgeElement({
              answerId: 456,
              competenceId: competenceFlipper.id,
              skillId: challengeForSkillCitation4AndMoteur3.skills[1].id,
            }),
          ]);
        answerRepository.findChallengeIdsFromAnswerIds
          .withArgs([123, 456, 456])
          .resolves(['challengeRecordIdFour', 'challengeRecordIdTwo']);
        const expectedSkills = [skillCitation4.name, skillRecherche4.name, skillMoteur3.name];

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
          new UserCompetence({
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
              skillId: challengeForSkillRecherche4.skills[0].id,
            }),
            domainBuilder.buildKnowledgeElement({
              answerId: 456,
              competenceId: competenceFlipper.id,
              skillId: challengeForSkillCitation4AndMoteur3.skills[0].id,
            }),
            domainBuilder.buildKnowledgeElement({
              answerId: 456,
              competenceId: competenceFlipper.id,
              skillId: challengeForSkillCitation4AndMoteur3.skills[1].id,
            }),
          ]);
        answerRepository.findChallengeIdsFromAnswerIds
          .withArgs([123, 456, 456])
          .resolves(['challengeRecordIdFour', 'challengeRecordIdTwo']);
        const expectedSkills = [skillCitation4, skillRecherche4, skillMoteur3];

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
        new UserCompetence({
          ...userCompetence1,
          skills: [skillRecherche4],
        }),
        new UserCompetence({
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
            skillId: challengeForSkillRecherche4.skills[0].id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 456,
            competenceId: competenceRemplir.id,
            skillId: challengeForSkillUrl3.skills[0].id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 789,
            competenceId: competenceRemplir.id,
            skillId: challengeForSkillRemplir2.skills[0].id,
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
        new UserCompetence({
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
        new UserCompetence({
          ...userCompetence1,
        }),
        new UserCompetence({
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
            skillId: challengeForSkillRemplir4.skills[0].id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 2,
            competenceId: competenceRemplir.id,
            skillId: challengeForSkillRemplir2.skills[0].id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 3,
            competenceId: competenceRemplir.id,
            skillId: challengeForSkillUrl3.skills[0].id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 4,
            competenceId: competenceRemplir.id,
            skillId: challengeForSkillWeb1.skills[0].id,
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
        new UserCompetence({
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
        new UserCompetence({
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

    it('should not add a challenge twice', async function () {
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
      challengeRepository.findOperativeHavingLocale.withArgs(locale).resolves(onlyOneChallengeForCitation4AndMoteur3);
      placementProfile.userCompetences = [
        new UserCompetence({
          ...userCompetence1,
          skills: [skillCitation4, skillMoteur3],
        }),
      ];
      knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId
        .withArgs({ userId, limitDate: 'limitDate' })
        .resolves([
          domainBuilder.buildKnowledgeElement({
            answerId: 1,
            competenceId: competenceFlipper.id,
            skillId: challengeForSkillCitation4AndMoteur3.skills[0].id,
          }),
          domainBuilder.buildKnowledgeElement({
            answerId: 1,
            competenceId: competenceFlipper.id,
            skillId: challengeForSkillCitation4AndMoteur3.skills[1].id,
          }),
        ]);
      answerRepository.findChallengeIdsFromAnswerIds.withArgs([1, 1]).resolves(['challengeRecordIdTwo']);
      // when
      const certificationChallenges = await certificationChallengesService.pickCertificationChallenges(
        placementProfile,
        locale
      );

      // then
      expect(_.map(certificationChallenges, 'challengeId')).to.deep.equal(['challengeRecordIdTwo']);
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
        tubeId: 'totoId',
        competenceId: 'competenceId',
      });
      const toto5 = domainBuilder.buildSkill({
        id: 'toto5',
        name: '@toto5',
        tubeId: 'totoId',
        competenceId: 'competenceId',
      });
      const toto4 = domainBuilder.buildSkill({
        id: 'toto4',
        name: '@toto4',
        tubeId: 'totoId',
        competenceId: 'competenceId',
      });
      const zaza4 = domainBuilder.buildSkill({
        id: 'zaza4',
        name: '@zaza4',
        tubeId: 'zazaId',
        competenceId: 'competenceId',
      });
      const userCompetence = new UserCompetence({
        id: 'competenceId',
        index: '1.2',
        area: { code: '1' },
        name: '1.2 Adopter un dauphin',
        pixScore: 23,
        estimatedLevel: 2,
      });
      placementProfile.userCompetences = [
        new UserCompetence({
          ...userCompetence,
          skills: [toto6, toto5, toto4, zaza4],
        }),
      ];

      challengeRepository.findOperativeHavingLocale
        .withArgs(locale)
        .resolves([
          _createChallenge('challengeToto6', 'competenceId', [toto6], '@toto6'),
          _createChallenge('challengeToto5', 'competenceId', [toto5], '@toto5'),
          _createChallenge('challengeToto4', 'competenceId', [toto4], '@toto4'),
          _createChallenge('challengeZaza4', 'competenceId', [zaza4], '@zaza4'),
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
        tubeId: 'totoId',
        competenceId: 'competenceId',
      });
      const toto5 = domainBuilder.buildSkill({
        id: 'toto5',
        name: '@toto5',
        tubeId: 'totoId',
        competenceId: 'competenceId',
      });
      const mama5 = domainBuilder.buildSkill({
        id: 'mama5',
        name: '@mama5',
        tubeId: 'mamaId',
        competenceId: 'competenceId',
      });
      const toto4 = domainBuilder.buildSkill({
        id: 'toto4',
        name: '@toto4',
        tubeId: 'totoId',
        competenceId: 'competenceId',
      });
      const zaza4 = domainBuilder.buildSkill({
        id: 'zaza4',
        name: '@zaza4',
        tubeId: 'zazaId',
        competenceId: 'competenceId',
      });

      const userCompetence = new UserCompetence({
        id: 'competenceId',
        index: '1.2',
        area: { code: '1' },
        name: '1.2 Adopter un dauphin',
        pixScore: 23,
        estimatedLevel: 2,
      });
      placementProfile.userCompetences = [
        new UserCompetence({
          ...userCompetence,
          skills: [toto6, toto5, toto4, mama5, zaza4],
        }),
      ];

      challengeRepository.findOperativeHavingLocale
        .withArgs(locale)
        .resolves([
          _createChallenge('challengeToto6', 'competenceId', [toto6], '@toto6'),
          _createChallenge('challengeToto5', 'competenceId', [toto5], '@toto5'),
          _createChallenge('challengeToto4', 'competenceId', [toto4], '@toto4'),
          _createChallenge('challengeZaza4', 'competenceId', [zaza4], '@zaza4'),
          _createChallenge('challengeMama5', 'competenceId', [mama5], '@mama5'),
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
    let targetProfileWithLearningContent;
    let clock;
    const now = new Date('2019-01-01T05:06:07Z');
    function _createTargetedTubeWithSkills({ maxLevel, tubeName, tubeId, areaName }) {
      const targetedSkills = [];
      for (let i = 1; i <= maxLevel; ++i) {
        targetedSkills.push(
          domainBuilder.buildTargetedSkill({
            id: `${tubeName}${i}_id`,
            name: `@${tubeName}${i}`,
            tubeId,
          })
        );
      }

      return domainBuilder.buildTargetedTube({
        id: tubeId,
        name: tubeName,
        competenceId: `comp_${areaName}_id`,
        skills: targetedSkills,
      });
    }
    function _createTargetedAreaForTubes({ tubes, areaName, areaId, origin }) {
      const targetedCompetence = domainBuilder.buildTargetedCompetence({
        id: `comp_${areaName}_id`,
        name: `comp_${areaName}`,
        areaId,
        tubes,
        origin,
      });

      return domainBuilder.buildTargetedArea({
        id: areaId,
        name: areaName,
        competences: [targetedCompetence],
      });
    }
    function _createChallengeWithDecl(challengeBaseId, skills, countDecl) {
      const challenges = [];

      for (let i = 1; i <= countDecl; ++i) {
        challenges.push(
          domainBuilder.buildChallenge({
            id: `${challengeBaseId}_dec${i}`,
            name: `${challengeBaseId}_dec${i}`,
            skills,
          })
        );
      }
      return challenges;
    }

    beforeEach(function () {
      clock = sinon.useFakeTimers(now);
      const targetedTube1Area1 = _createTargetedTubeWithSkills({
        maxLevel: 5,
        tubeName: 'faireDesCourses',
        tubeId: 'faireDesCourses_id',
        areaName: 'reussirDehors',
      });
      const targetedTube2Area1 = _createTargetedTubeWithSkills({
        maxLevel: 4,
        tubeName: 'direBonjour',
        tubeId: 'direBonjour_id',
        areaName: 'reussirDehors',
      });
      const targetedTube3Area1 = _createTargetedTubeWithSkills({
        maxLevel: 5,
        tubeName: 'conduireUneVoiture',
        tubeId: 'conduireUneVoiture_id',
        areaName: 'reussirDehors',
      });
      const targetedTube1Area2 = _createTargetedTubeWithSkills({
        maxLevel: 3,
        tubeName: 'laverLesDents',
        tubeId: 'laverLesDents_id',
        areaName: 'faireBienDedans',
      });
      const targetedTube2Area2 = _createTargetedTubeWithSkills({
        maxLevel: 6,
        tubeName: 'faireSonLit',
        tubeId: 'faireSonLit_id',
        areaName: 'faireBienDedans',
      });
      const targetedArea1 = _createTargetedAreaForTubes({
        tubes: [targetedTube1Area1, targetedTube2Area1, targetedTube3Area1],
        areaId: 'reussirDehors_id',
        areaName: 'reussirDehors',
        origin: 'PixPlusEpreuvesDeLaVie',
      });
      const targetedArea2 = _createTargetedAreaForTubes({
        tubes: [targetedTube1Area2, targetedTube2Area2],
        areaId: 'faireBienDedans_id',
        areaName: 'faireBienDedans',
        origin: 'PixPlusEpreuvesDeLaVie',
      });

      targetProfileWithLearningContent = domainBuilder.buildTargetProfileWithLearningContent({
        skills: _.flatMap(
          [targetedTube1Area1, targetedTube2Area1, targetedTube3Area1, targetedTube1Area2, targetedTube2Area2],
          'skills'
        ),
        tubes: [targetedTube1Area1, targetedTube2Area1, targetedTube3Area1, targetedTube1Area2, targetedTube2Area2],
        competences: _.flatMap([targetedArea1, targetedArea2], 'competences'),
        areas: [targetedArea1, targetedArea2],
      });
      sinon
        .stub(targetProfileWithLearningContentRepository, 'get')
        .withArgs({ id: 123 })
        .resolves(targetProfileWithLearningContent);
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
        targetProfileWithLearningContent,
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
        .withArgs({ id: 456, profileDate: now, targetProfileWithLearningContent })
        .resolves(certifiableProfile);
      // challenges
      let challenges = [];
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_faireDesCourses3', [{ id: 'faireDesCourses3_id' }], 1)
      );
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_faireDesCourses4', [{ id: 'faireDesCourses4_id' }], 1)
      );
      challenges = challenges.concat(_createChallengeWithDecl('ch_direBonjour2', [{ id: 'direBonjour2_id' }], 1));
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_conduireUneVoiture2', [{ id: 'conduireUneVoiture2_id' }], 1)
      );
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents2', [{ id: 'laverLesDents2_id' }], 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents3', [{ id: 'laverLesDents3_id' }], 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit4', [{ id: 'faireSonLit4_id' }], 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit6', [{ id: 'faireSonLit6_id' }], 1));
      sinon.stub(challengeRepository, 'findOperativeHavingLocale').withArgs(locale).resolves(challenges);
      const certifiableBadge = domainBuilder.buildBadge({ key: 'BADGE_KEY', targetProfileId: 123 });

      // when
      const certificationChallengesForPlus = await certificationChallengesService.pickCertificationChallengesForPixPlus(
        certifiableBadge,
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
        targetProfileWithLearningContent,
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
        .withArgs({ id: 456, profileDate: now, targetProfileWithLearningContent })
        .resolves(certifiableProfile);
      // challenges
      let challenges = [];
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_faireDesCourses3', [{ id: 'faireDesCourses3_id' }], 2)
      );
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_faireDesCourses4', [{ id: 'faireDesCourses4_id' }], 1)
      );
      challenges = challenges.concat(_createChallengeWithDecl('ch_direBonjour2', [{ id: 'direBonjour2_id' }], 2));
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_conduireUneVoiture2', [{ id: 'conduireUneVoiture2_id' }], 1)
      );
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents2', [{ id: 'laverLesDents2_id' }], 2));
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents3', [{ id: 'laverLesDents3_id' }], 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit4', [{ id: 'faireSonLit4_id' }], 2));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit6', [{ id: 'faireSonLit6_id' }], 1));
      sinon.stub(challengeRepository, 'findOperativeHavingLocale').withArgs(locale).resolves(challenges);
      const certifiableBadge = domainBuilder.buildBadge({ key: 'BADGE_KEY', targetProfileId: 123 });

      // when
      const certificationChallengesForPlus = await certificationChallengesService.pickCertificationChallengesForPixPlus(
        certifiableBadge,
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
        targetProfileWithLearningContent,
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
        .withArgs({ id: 456, profileDate: now, targetProfileWithLearningContent })
        .resolves(certifiableProfile);
      // challenges
      let challenges = [];
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_faireDesCourses3', [{ id: 'faireDesCourses3_id' }], 1)
      );
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_faireDesCourses4', [{ id: 'faireDesCourses4_id' }], 1)
      );
      challenges = challenges.concat(_createChallengeWithDecl('ch_direBonjour2', [{ id: 'direBonjour2_id' }], 1));
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_conduireUneVoiture2', [{ id: 'conduireUneVoiture2_id' }], 1)
      );
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents2', [{ id: 'laverLesDents2_id' }], 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents3', [{ id: 'laverLesDents3_id' }], 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit4', [{ id: 'faireSonLit4_id' }], 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit5', [{ id: 'faireSonLit5_id' }], 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit6', [{ id: 'faireSonLit6_id' }], 1));
      sinon.stub(challengeRepository, 'findOperativeHavingLocale').withArgs(locale).resolves(challenges);
      const certifiableBadge = domainBuilder.buildBadge({ key: 'BADGE_KEY', targetProfileId: 123 });

      // when
      const certificationChallengesForPlus = await certificationChallengesService.pickCertificationChallengesForPixPlus(
        certifiableBadge,
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

    it('should exclude skill which origin is Pix', async function () {
      // given
      targetProfileWithLearningContent.getCompetence('comp_faireBienDedans_id').origin = PIX_ORIGIN;
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
        targetProfileWithLearningContent,
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
        .withArgs({ id: 456, profileDate: now, targetProfileWithLearningContent })
        .resolves(certifiableProfile);
      // challenges
      let challenges = [];
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_faireDesCourses3', [{ id: 'faireDesCourses3_id' }], 1)
      );
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_faireDesCourses4', [{ id: 'faireDesCourses4_id' }], 1)
      );
      challenges = challenges.concat(_createChallengeWithDecl('ch_direBonjour2', [{ id: 'direBonjour2_id' }], 1));
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_conduireUneVoiture2', [{ id: 'conduireUneVoiture2_id' }], 1)
      );
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents2', [{ id: 'laverLesDents2_id' }], 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents3', [{ id: 'laverLesDents3_id' }], 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit4', [{ id: 'faireSonLit4_id' }], 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit5', [{ id: 'faireSonLit5_id' }], 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit6', [{ id: 'faireSonLit6_id' }], 1));
      sinon.stub(challengeRepository, 'findOperativeHavingLocale').withArgs(locale).resolves(challenges);
      const certifiableBadge = domainBuilder.buildBadge({ key: 'BADGE_KEY', targetProfileId: 123 });

      // when
      const certificationChallengesForPlus = await certificationChallengesService.pickCertificationChallengesForPixPlus(
        certifiableBadge,
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
        targetProfileWithLearningContent,
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
        .withArgs({ id: 456, profileDate: now, targetProfileWithLearningContent })
        .resolves(certifiableProfile);
      // challenges
      let challenges = [];
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_faireDesCourses3', [{ id: 'faireDesCourses3_id' }], 1)
      );
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_faireDesCourses4', [{ id: 'faireDesCourses4_id' }], 1)
      );
      challenges = challenges.concat(_createChallengeWithDecl('ch_direBonjour2', [{ id: 'direBonjour2_id' }], 1));
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_conduireUneVoiture2', [{ id: 'conduireUneVoiture2_id' }], 1)
      );
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents2', [{ id: 'laverLesDents2_id' }], 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents3', [{ id: 'laverLesDents3_id' }], 1));
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_faireSonLit', [{ id: 'faireSonLit6_id' }, { id: 'faireSonLit4_id' }], 1)
      );
      sinon.stub(challengeRepository, 'findOperativeHavingLocale').withArgs(locale).resolves(challenges);
      const certifiableBadge = domainBuilder.buildBadge({ key: 'BADGE_KEY', targetProfileId: 123 });

      // when
      const certificationChallengesForPlus = await certificationChallengesService.pickCertificationChallengesForPixPlus(
        certifiableBadge,
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
        targetProfileWithLearningContent,
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
        .withArgs({ id: 456, profileDate: now, targetProfileWithLearningContent })
        .resolves(certifiableProfile);
      // challenges
      let challenges = [];
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_faireDesCourses3', [{ id: 'faireDesCourses3_id' }], 1)
      );
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_faireDesCourses4', [{ id: 'faireDesCourses4_id' }], 1)
      );
      challenges = challenges.concat(_createChallengeWithDecl('ch_direBonjour2', [{ id: 'direBonjour2_id' }], 1));
      challenges = challenges.concat(
        _createChallengeWithDecl('ch_conduireUneVoiture2', [{ id: 'conduireUneVoiture2_id' }], 1)
      );
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents2', [{ id: 'laverLesDents2_id' }], 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_laverLesDents3', [{ id: 'laverLesDents3_id' }], 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit4', [{ id: 'faireSonLit4_id' }], 1));
      challenges = challenges.concat(_createChallengeWithDecl('ch_faireSonLit6', [{ id: 'faireSonLit6_id' }], 1));
      sinon.stub(challengeRepository, 'findOperativeHavingLocale').withArgs(locale).resolves(challenges);
      const certifiableBadge = domainBuilder.buildBadge({ key: 'BADGE_KEY', targetProfileId: 123 });

      // when
      const certificationChallengesForPlus = await certificationChallengesService.pickCertificationChallengesForPixPlus(
        certifiableBadge,
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
  });
});
