const { expect, domainBuilder } = require('../../../test-helper');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Skill = require('../../../../lib/domain/models/Skill');
const Validator = require('../../../../lib/domain/models/Validator');
const ValidatorQCM = require('../../../../lib/domain/models/ValidatorQCM');
const ValidatorQCU = require('../../../../lib/domain/models/ValidatorQCU');
const ValidatorQROC = require('../../../../lib/domain/models/ValidatorQROC');
const ValidatorQROCMDep = require('../../../../lib/domain/models/ValidatorQROCMDep');
const ValidatorQROCMInd = require('../../../../lib/domain/models/ValidatorQROCMInd');

describe('Unit | Domain | Models | Challenge', function () {
  describe('#constructor', function () {
    it('should construct a model Challenge from attributes', function () {
      // given
      const challengeRawData = {
        id: 'recwWzTquPlvIl4So',
        type: 'QCM',
        instruction:
          "Les moteurs de recherche affichent certains liens en raison d'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?",
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
        skill: new Skill('recUDrCWD76fp5MsE'),
        validator: undefined,
        competenceId: 'recsvLz0W2ShyfD63',
        illustrationAlt: "Texte alternatif à l'image",
        format: 'phrase',
        locales: ['fr'],
        autoReply: true,
        alternativeInstruction: 'Pour aider les personnes ne pouvant voir ou afficher les instructions',
        focused: false,
        discriminant: 0.75,
        difficulty: -0.23,
        responsive: 'Smartphone',
        genealogy: 'Prototype 1',
      };

      // when
      const challengeDataObject = new Challenge(challengeRawData);

      // then
      expect(challengeDataObject).to.be.an.instanceof(Challenge);
      expect(challengeDataObject).to.deep.equal(challengeRawData);
    });
  });

  describe('static#createValidatorForChallengeType', function () {
    const challengeTypeAndValidators = {
      QCM: ValidatorQCM,
      QCU: ValidatorQCU,
      QROC: ValidatorQROC,
      'QROCM-dep': ValidatorQROCMDep,
      'QROCM-ind': ValidatorQROCMInd,
      other: Validator,
    };

    // eslint-disable-next-line mocha/no-setup-in-describe
    Object.entries(challengeTypeAndValidators).forEach(([challengeType, associatedValidatorClass]) => {
      context(`when challenge of type: ${challengeType} exists`, function () {
        it('should return the associated validator class', function () {
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

  describe('#hasIllustration', function () {
    it('returns true when has illustration', function () {
      // given
      const challenge = domainBuilder.buildChallenge({ illustrationUrl: 'A_LINK' });

      // when then
      expect(challenge.hasIllustration()).to.be.true;
    });

    it('returns false when does not have illustration', function () {
      // given
      const challenge = domainBuilder.buildChallenge({ illustrationUrl: null });

      // when then
      expect(challenge.hasIllustration()).to.be.false;
    });
  });

  describe('#hasEmbed', function () {
    it('returns true when has embed', function () {
      // given
      const challenge = domainBuilder.buildChallenge({ embedUrl: 'A_LINK' });

      // when then
      expect(challenge.hasEmbed()).to.be.true;
    });

    it('returns false when does not have embed', function () {
      // given
      const challenge = domainBuilder.buildChallenge({ embedUrl: null });

      // when then
      expect(challenge.hasEmbed()).to.be.false;
    });
  });

  describe('#hasAtLeastOneAttachment', function () {
    it('returns true when attachments is not empty', function () {
      // given
      const challenge = domainBuilder.buildChallenge({
        attachments: ['some/attachment/url'],
      });

      // when then
      expect(challenge.hasAtLeastOneAttachment()).to.be.true;
    });

    it('returns false when attachment is empty', function () {
      // given
      const challenge = domainBuilder.buildChallenge({
        attachments: [],
      });
      // when then
      expect(challenge.hasAtLeastOneAttachment()).to.be.false;
    });

    it('returns false when attachment is not an array (null, undefined, ...)', function () {
      // given
      const challenge = domainBuilder.buildChallenge({
        attachments: 'not an array',
      });
      // when then
      expect(challenge.hasAtLeastOneAttachment()).to.be.false;
    });
  });
});
