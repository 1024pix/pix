import { expect, domainBuilder } from '../../../test-helper.js';
import { Challenge } from '../../../../src/shared/domain/models/Challenge.js';
import { Skill } from '../../../../lib/domain/models/Skill.js';
import { Validator } from '../../../../lib/domain/models/Validator.js';
import { ValidatorQCM } from '../../../../lib/domain/models/ValidatorQCM.js';
import { ValidatorQCU } from '../../../../lib/domain/models/ValidatorQCU.js';
import { ValidatorQROC } from '../../../../lib/domain/models/ValidatorQROC.js';
import { ValidatorQROCMDep } from '../../../../lib/domain/models/ValidatorQROCMDep.js';
import { ValidatorQROCMInd } from '../../../../lib/domain/models/ValidatorQROCMInd.js';

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
        successProbabilityThreshold: 0.85,
        responsive: 'Smartphone',
        shuffled: false,
        alternativeVersion: 1,
      };

      const expectedChallengeDataObject = {
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
        minimumCapability: 2.0828014071841414,
        responsive: 'Smartphone',
        shuffled: false,
        alternativeVersion: 1,
      };

      // when
      const challengeDataObject = new Challenge(challengeRawData);

      // then
      expect(challengeDataObject).to.be.an.instanceof(Challenge);
      expect(challengeDataObject).to.deep.include(expectedChallengeDataObject);
    });
  });

  describe('#successProbabilityThreshold', function () {
    describe('when there is no discriminant or difficulty', function () {
      it('should return early', function () {
        // given
        const challengeRawData = {
          discriminant: 1,
          difficulty: null,
        };
        const challengeDataObject = new Challenge(challengeRawData);

        // when
        challengeDataObject.successProbabilityThreshold = 0.95;

        // then
        expect(challengeDataObject.minimumCapability).to.be.undefined;
      });
    });

    describe('when successProbabilityThreshold is undefined', function () {
      it('should return early', function () {
        // given
        const challengeRawData = {
          discriminant: 1,
          difficulty: 2,
        };
        const challengeDataObject = new Challenge(challengeRawData);

        // when
        challengeDataObject.successProbabilityThreshold = undefined;

        // then
        expect(challengeDataObject.minimumCapability).to.be.undefined;
      });
    });

    describe('when there is a discriminant and a difficulty', function () {
      it('should compute and set minimum capability ', function () {
        // given
        const challengeRawData = {
          discriminant: 0.75,
          difficulty: 2,
        };
        const challengeDataObject = new Challenge(challengeRawData);

        // when
        challengeDataObject.successProbabilityThreshold = 0.95;

        // then
        expect(challengeDataObject.minimumCapability).to.equal(5.925918638888589);
      });
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

    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
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

  describe('#isFocused', function () {
    it('returns true when focused is true', function () {
      // given
      const challenge = domainBuilder.buildChallenge({ focused: true });

      // when then
      expect(challenge.isFocused()).to.be.true;
    });

    it('returns false when focused is false', function () {
      // given
      const challenge = domainBuilder.buildChallenge({ focused: false });

      // when then
      expect(challenge.isFocused()).to.be.false;
    });
  });
});
