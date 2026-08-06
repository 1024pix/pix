import { expect } from 'chai';

import { BaseChallenge } from '../../../../../src/evaluation/domain/models/BaseChallenge.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Evaluation | Unit | Domain | Models | BaseChallenge', function () {
  const STATUSES = domainBuilder.evaluation.buildBaseChallenge.STATUSES;

  const baseData = {
    id: 'challengeId00',
    instruction: 'instruction challengeId00',
    alternativeInstruction: 'alternativeInstruction challengeId00',
    proposals: 'proposals challengeId00',
    type: domainBuilder.learningContent.buildChallenge.TYPES.QROC,
    solution: 'solution challengeId00',
    solutionToDisplay: 'solutionToDisplay challengeId00',
    t1Status: true,
    t2Status: false,
    t3Status: true,
    status: domainBuilder.learningContent.buildChallenge.STATUSES.ARCHIVED,
    genealogy: 'genealogy challengeId00',
    blindnessCompatibility: 'blindnessCompatibility challengeId00',
    colorBlindnessCompatibility: 'colorBlindnessCompatibility challengeId00',
    requireGafamWebsiteAccess: true,
    isIncompatibleIpadCertif: false,
    deafAndHardOfHearing: 'deafAndHardOfHearing challengeId00',
    isAwarenessChallenge: true,
    toRephrase: false,
    alternativeVersion: 10,
    shuffled: true,
    illustrationAlt: 'illustrationAlt challengeId00',
    illustrationUrl: 'illustrationUrl challengeId00',
    attachments: ['attachment1', 'attachment2'],
    responsive: 'responsive challengeId00',
    autoReply: true,
    focused: true,
    format: 'format challengeId00',
    timer: 180,
    embedHeight: 800,
    embedUrl: 'embedUrl challengeId00',
    embedTitle: 'embedTitle challengeId00',
    locales: ['fr', 'nl'],
    competenceId: 'competenceId00',
    skillId: 'skillId00',
    hasEmbedInternalValidation: true,
    noValidationNeeded: true,
  };

  describe('base props getters', function () {
    it('getters return expected value', function () {
      const baseChallenge = new BaseChallenge({
        ...baseData,
        focusable: baseData.focused,
        accessibility1: baseData.blindnessCompatibility,
        accessibility2: baseData.colorBlindnessCompatibility,
      });

      expect(baseChallenge.id).to.equal(baseData.id);
      expect(baseChallenge.instruction).to.equal(baseData.instruction);
      expect(baseChallenge.alternativeInstruction).to.equal(baseData.alternativeInstruction);
      expect(baseChallenge.proposals).to.equal(baseData.proposals);
      expect(baseChallenge.type).to.equal(baseData.type);
      expect(baseChallenge.solution).to.equal(baseData.solution);
      expect(baseChallenge.solutionToDisplay).to.equal(baseData.solutionToDisplay);
      expect(baseChallenge.t1Status).to.equal(baseData.t1Status);
      expect(baseChallenge.t2Status).to.equal(baseData.t2Status);
      expect(baseChallenge.t3Status).to.equal(baseData.t3Status);
      expect(baseChallenge.status).to.equal(baseData.status);
      expect(baseChallenge.genealogy).to.equal(baseData.genealogy);
      expect(baseChallenge.blindnessCompatibility).to.equal(baseData.blindnessCompatibility);
      expect(baseChallenge.colorBlindnessCompatibility).to.equal(baseData.colorBlindnessCompatibility);
      expect(baseChallenge.requireGafamWebsiteAccess).to.equal(baseData.requireGafamWebsiteAccess);
      expect(baseChallenge.isIncompatibleIpadCertif).to.equal(baseData.isIncompatibleIpadCertif);
      expect(baseChallenge.deafAndHardOfHearing).to.equal(baseData.deafAndHardOfHearing);
      expect(baseChallenge.isAwarenessChallenge).to.equal(baseData.isAwarenessChallenge);
      expect(baseChallenge.toRephrase).to.equal(baseData.toRephrase);
      expect(baseChallenge.alternativeVersion).to.equal(baseData.alternativeVersion);
      expect(baseChallenge.shuffled).to.equal(baseData.shuffled);
      expect(baseChallenge.illustrationAlt).to.equal(baseData.illustrationAlt);
      expect(baseChallenge.illustrationUrl).to.equal(baseData.illustrationUrl);
      expect(baseChallenge.attachments).to.deep.include.members(baseData.attachments);
      expect(baseChallenge.responsive).to.equal(baseData.responsive);
      expect(baseChallenge.autoReply).to.equal(baseData.autoReply);
      expect(baseChallenge.focused).to.equal(baseData.focused);
      expect(baseChallenge.format).to.equal(baseData.format);
      expect(baseChallenge.timer).to.equal(baseData.timer);
      expect(baseChallenge.embedHeight).to.equal(baseData.embedHeight);
      expect(baseChallenge.embedUrl).to.equal(baseData.embedUrl);
      expect(baseChallenge.embedTitle).to.equal(baseData.embedTitle);
      expect(baseChallenge.locales).to.deep.include.members(baseData.locales);
      expect(baseChallenge.competenceId).to.equal(baseData.competenceId);
      expect(baseChallenge.skillId).to.equal(baseData.skillId);
      expect(baseChallenge.hasEmbedInternalValidation).to.equal(baseData.hasEmbedInternalValidation);
      expect(baseChallenge.noValidationNeeded).to.equal(baseData.noValidationNeeded);
    });
  });

  describe('#isTimed', function () {
    it('returns false when timer is null', function () {
      const baseChallenge = domainBuilder.evaluation.buildBaseChallenge({
        ...baseData,
        timer: null,
      });

      expect(baseChallenge.isTimed()).to.be.false;
    });

    it('returns true when timer is not null', function () {
      const baseChallenge = domainBuilder.evaluation.buildBaseChallenge({
        ...baseData,
        timer: 123,
      });

      expect(baseChallenge.isTimed()).to.be.true;
    });
  });

  describe('#hasIllustration', function () {
    it('returns false when challenge has no illustration', function () {
      const baseChallenge = domainBuilder.evaluation.buildBaseChallenge({
        ...baseData,
        illustrationUrl: null,
      });

      expect(baseChallenge.hasIllustration()).to.be.false;
    });

    it('returns true when challenge has an illustration', function () {
      const baseChallenge = domainBuilder.evaluation.buildBaseChallenge({
        ...baseData,
        illustrationUrl: 'some illustration url',
      });

      expect(baseChallenge.hasIllustration()).to.be.true;
    });
  });

  describe('#hasEmbed', function () {
    it('returns false when challenge has no embed', function () {
      const baseChallenge = domainBuilder.evaluation.buildBaseChallenge({
        ...baseData,
        embedUrl: null,
      });

      expect(baseChallenge.hasEmbed()).to.be.false;
    });

    it('returns true when challenge has an embed', function () {
      const baseChallenge = domainBuilder.evaluation.buildBaseChallenge({
        ...baseData,
        embedUrl: 'some embed url',
      });

      expect(baseChallenge.hasEmbed()).to.be.true;
    });
  });

  describe('#hasAtLeastOneAttachment', function () {
    it('returns false when challenge has no attachments', function () {
      const baseChallengeA = domainBuilder.evaluation.buildBaseChallenge({
        ...baseData,
        attachments: null,
      });
      const baseChallengeB = domainBuilder.evaluation.buildBaseChallenge({
        ...baseData,
        attachments: [],
      });

      expect(baseChallengeA.hasAtLeastOneAttachment()).to.be.false;
      expect(baseChallengeB.hasAtLeastOneAttachment()).to.be.false;
    });

    it('returns true when challenge has at least one attachment', function () {
      const baseChallengeA = domainBuilder.evaluation.buildBaseChallenge({
        ...baseData,
        attachments: ['one'],
      });
      const baseChallengeB = domainBuilder.evaluation.buildBaseChallenge({
        ...baseData,
        attachments: ['two', 'three'],
      });

      expect(baseChallengeA.hasAtLeastOneAttachment()).to.be.true;
      expect(baseChallengeB.hasAtLeastOneAttachment()).to.be.true;
    });
  });

  describe('#isFocused', function () {
    it('returns false when challenge is not focused', function () {
      const baseChallenge = domainBuilder.evaluation.buildBaseChallenge({
        ...baseData,
        focused: false,
      });

      expect(baseChallenge.isFocused()).to.be.false;
    });

    it('returns true when challenge is focused', function () {
      const baseChallenge = domainBuilder.evaluation.buildBaseChallenge({
        ...baseData,
        focused: true,
      });

      expect(baseChallenge.isFocused()).to.be.true;
    });
  });

  describe('#get isMobileCompliant', function () {
    it('returns false when challenge is not responsive for mobile', function () {
      const baseChallenge = domainBuilder.evaluation.buildBaseChallenge({
        ...baseData,
        responsive: 'Tablet,TV',
      });

      expect(baseChallenge.isMobileCompliant).to.be.false;
    });

    it('returns true when challenge is mobile compliant', function () {
      const baseChallenge = domainBuilder.evaluation.buildBaseChallenge({
        ...baseData,
        responsive: 'Tamagotchi,Smartphone,TV',
      });

      expect(baseChallenge.isMobileCompliant).to.be.true;
    });
  });

  describe('#get isTabletCompliant', function () {
    it('returns false when challenge is not responsive for tablet', function () {
      const baseChallenge = domainBuilder.evaluation.buildBaseChallenge({
        ...baseData,
        responsive: 'Smartphone,TV',
      });

      expect(baseChallenge.isTabletCompliant).to.be.false;
    });

    it('returns true when challenge is tablet compliant', function () {
      const baseChallenge = domainBuilder.evaluation.buildBaseChallenge({
        ...baseData,
        responsive: 'Tamagotchi,Tablet,TV',
      });

      expect(baseChallenge.isTabletCompliant).to.be.true;
    });
  });

  describe('#get isOperative', function () {
    const operative_statuses = [STATUSES.VALIDATED, STATUSES.ARCHIVED];
    Object.values(STATUSES)
      .filter((status) => operative_statuses.includes(status))
      .forEach(function (status) {
        it(`returns true when status is ${status}`, function () {
          const baseChallenge = domainBuilder.evaluation.buildBaseChallenge({
            ...baseData,
            status,
          });

          expect(baseChallenge.isOperative).to.be.true;
        });
      });

    Object.values(STATUSES)
      .filter((status) => !operative_statuses.includes(status))
      .forEach(function (status) {
        it(`returns false when status is ${status}`, function () {
          const baseChallenge = domainBuilder.evaluation.buildBaseChallenge({
            ...baseData,
            status,
          });

          expect(baseChallenge.isOperative).to.be.false;
        });
      });
  });
});
