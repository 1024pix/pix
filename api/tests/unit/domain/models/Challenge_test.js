const { expect, domainBuilder } = require('../../../test-helper');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Skill = require('../../../../lib/domain/models/Skill');
const Validator = require('../../../../lib/domain/models/Validator');
const ValidatorQCM = require('../../../../lib/domain/models/ValidatorQCM');
const ValidatorQCU = require('../../../../lib/domain/models/ValidatorQCU');
const ValidatorQROC = require('../../../../lib/domain/models/ValidatorQROC');
const ValidatorQROCMDep = require('../../../../lib/domain/models/ValidatorQROCMDep');
const ValidatorQROCMInd = require('../../../../lib/domain/models/ValidatorQROCMInd');

describe('Unit | Domain | Models | Challenge', function() {

  describe('#constructor', function() {

    it('should construct a model Challenge from attributes', function() {
      // given
      const challengeRawData = {
        id: 'recwWzTquPlvIl4So',
        type: 'QCM',
        instruction: 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
        proposals: '- 1\n- 2\n- 3\n- 4\n- 5',
        timer: 1234,
        illustrationUrl: 'https://dl.airtable.com/2MGErxGTQl2g2KiqlYgV_venise4.png',
        attachments: [
          'https://dl.airtable.com/nHWKNZZ7SQeOKsOvVykV_navigationdiaporama5.pptx',
          'https://dl.airtable.com/rsXNJrSPuepuJQDByFVA_navigationdiaporama5.odp',
        ],
        embedUrl: 'https://github.page.io/pages/mon-epreuve.html',
        embedTitle: 'Epreuve de selection d’imprimante',
        embedHeight: 400,
        status: 'validé',
        answer: [],
        skills: [new Skill('recUDrCWD76fp5MsE')],
        validator: undefined,
        competenceId: 'recsvLz0W2ShyfD63',
        illustrationAlt: 'Texte alternatif à l\'image',
        format: 'phrase',
        locales: ['fr'],
        autoReply: true,
        alternativeInstruction: 'Pour aider les personnes ne pouvant voir ou afficher les instructions',
      };

      // when
      const challengeDataObject = new Challenge(challengeRawData);

      // then
      expect(challengeDataObject).to.be.an.instanceof(Challenge);
      expect(challengeDataObject).to.deep.equal(challengeRawData);
    });
  });

  describe('#hasSkill', function() {

    it('should return false when the skill is not known', function() {
      // given
      const challenge = new Challenge();

      // when
      const result = challenge.hasSkill(new Skill('@recherche1'));

      // then
      expect(result).to.be.false;
    });

    it('should return true when the skill is known', function() {
      // given
      const challenge = new Challenge();
      challenge.skills.push(new Skill('@recherche1'));

      // when
      const result = challenge.hasSkill(new Skill('@recherche1'));

      // then
      expect(result).to.be.true;
    });
  });

  describe('#addSkill', function() {

    it('should add a skill', function() {
      // given
      const skill = new Skill('@web3');
      const challenge = new Challenge();

      // when
      challenge.addSkill(skill);

      // then
      expect(challenge.skills).to.have.lengthOf(1);
      expect(challenge.skills[0]).to.equal(skill);
    });

  });

  describe('#hardestSkill', function() {
    it('should exist', function() {
      // given
      const url1 = new Skill({ name: '@url1' });
      const challenge = new Challenge();
      challenge.addSkill(url1);

      // then
      expect(challenge.hardestSkill).to.exist;
    });

    it('should be web5 if challenge requires url1 and web5', function() {
      // given
      const web5 = new Skill({ name: '@web5' });
      const url1 = new Skill({ name: '@url1' });
      const challenge = new Challenge();
      challenge.addSkill(url1);
      challenge.addSkill(web5);

      // then
      expect(challenge.hardestSkill).to.equal(web5);
    });
  });

  describe('#testsAtLeastOneNewSkill', function() {

    it('returns true if the challenge is not already assessed', function() {
      // given
      const [s1] = domainBuilder.buildSkillCollection();
      const challenge = domainBuilder.buildChallenge({ skills: [s1] });
      const assessedSkills = [];
      // whe
      const response = challenge.testsAtLeastOneNewSkill(assessedSkills);
      // then
      expect(response).to.be.true;
    });

    it('should return false if the challenge\'s skill is already assessed', function() {
      // given
      const [s1] = domainBuilder.buildSkillCollection();
      const challenge = domainBuilder.buildChallenge({ skills: [s1] });
      const assessedSkills = [s1];
      // when
      const response = challenge.testsAtLeastOneNewSkill(assessedSkills);
      // then
      expect(response).to.be.false;
    });

    it('should return true if the challenge has a unique skill not assessed', function() {
      // given
      const [s1, s2, s3] = domainBuilder.buildSkillCollection({ minLevel: 1, maxLevel: 3 });
      const challenge = domainBuilder.buildChallenge({ skills: [s3] });
      const assessedSkills = [s1, s2];
      // when
      const response = challenge.testsAtLeastOneNewSkill(assessedSkills);
      // then
      expect(response).to.be.true;
    });

    it('should return true if the challenge has at least a skill not assessed', function() {
      // given
      const [s1, s2, s3] = domainBuilder.buildSkillCollection({ minLevel: 1, maxLevel: 3 });
      const challenge = domainBuilder.buildChallenge({ skills: [s2, s3] });
      const assessedSkills = [s1, s2];
      // when
      const response = challenge.testsAtLeastOneNewSkill(assessedSkills);
      // then
      expect(response).to.be.true;
    });

    it('should return false if the challenge has a skill assessed of the same name (but different object)', function() {
      // given
      const skill = domainBuilder.buildSkill({ name: '@skill1' });
      const sameSkill = domainBuilder.buildSkill({ name: '@skill1' });
      const challenge = domainBuilder.buildChallenge({ skills: [skill] });
      // when
      const response = challenge.testsAtLeastOneNewSkill([sameSkill]);
      // then
      expect(response).to.be.false;
    });

    it('should return false if the challenge has only one skill and is already assessed', function() {
      // given
      const [s1, s2] = domainBuilder.buildSkillCollection({ minLevel: 1, maxLevel: 3 });
      const challenge = domainBuilder.buildChallenge({ skills: [s2] });
      const assessedSkills = [s1, s2];
      // when
      const response = challenge.testsAtLeastOneNewSkill(assessedSkills);
      // then
      expect(response).to.be.false;
    });
  });

  describe('static#createValidatorForChallengeType', function() {

    const challengeTypeAndValidators = {
      'QCM': ValidatorQCM,
      'QCU': ValidatorQCU,
      'QROC': ValidatorQROC,
      'QROCM-dep': ValidatorQROCMDep,
      'QROCM-ind': ValidatorQROCMInd,
      'other': Validator,
    };

    Object.entries(challengeTypeAndValidators).forEach(([challengeType, associatedValidatorClass]) => {

      context(`when challenge of type: ${challengeType} exists`, function() {

        it('should return the associated validator class', function() {
          // when
          const solution = 'some solution';
          const validator = Challenge.createValidatorForChallengeType({ challengeType, solution });

          // then
          expect(validator).to.be.instanceOf(associatedValidatorClass);
          expect(validator.solution).to.equal(solution);
        });
      });
    });
  });
});
