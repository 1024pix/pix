import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Shared | Unit | Domain | Models | BaseChallenge', function () {
  const STATUSES = domainBuilder.shared.buildBaseChallenge.STATUSES;

  const baseDto = {
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
    accessibility1: 'accessibility1 challengeId00',
    accessibility2: 'accessibility2 challengeId00',
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
    focusable: true,
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
      const baseChallenge = domainBuilder.shared.buildBaseChallenge.fromDTO(baseDto);

      expect(baseChallenge.id).to.equal(baseDto.id);
      expect(baseChallenge.instruction).to.equal(baseDto.instruction);
      expect(baseChallenge.alternativeInstruction).to.equal(baseDto.alternativeInstruction);
      expect(baseChallenge.proposals).to.equal(baseDto.proposals);
      expect(baseChallenge.type).to.equal(baseDto.type);
      expect(baseChallenge.solution).to.equal(baseDto.solution);
      expect(baseChallenge.solutionToDisplay).to.equal(baseDto.solutionToDisplay);
      expect(baseChallenge.t1Status).to.equal(baseDto.t1Status);
      expect(baseChallenge.t2Status).to.equal(baseDto.t2Status);
      expect(baseChallenge.t3Status).to.equal(baseDto.t3Status);
      expect(baseChallenge.status).to.equal(baseDto.status);
      expect(baseChallenge.genealogy).to.equal(baseDto.genealogy);
      expect(baseChallenge.blindnessCompatibility).to.equal(baseDto.accessibility1);
      expect(baseChallenge.colorBlindnessCompatibility).to.equal(baseDto.accessibility2);
      expect(baseChallenge.requireGafamWebsiteAccess).to.equal(baseDto.requireGafamWebsiteAccess);
      expect(baseChallenge.isIncompatibleIpadCertif).to.equal(baseDto.isIncompatibleIpadCertif);
      expect(baseChallenge.deafAndHardOfHearing).to.equal(baseDto.deafAndHardOfHearing);
      expect(baseChallenge.isAwarenessChallenge).to.equal(baseDto.isAwarenessChallenge);
      expect(baseChallenge.toRephrase).to.equal(baseDto.toRephrase);
      expect(baseChallenge.alternativeVersion).to.equal(baseDto.alternativeVersion);
      expect(baseChallenge.shuffled).to.equal(baseDto.shuffled);
      expect(baseChallenge.illustrationAlt).to.equal(baseDto.illustrationAlt);
      expect(baseChallenge.illustrationUrl).to.equal(baseDto.illustrationUrl);
      expect(baseChallenge.attachments).to.deep.include.members(baseDto.attachments);
      expect(baseChallenge.responsive).to.equal(baseDto.responsive);
      expect(baseChallenge.autoReply).to.equal(baseDto.autoReply);
      expect(baseChallenge.focused).to.equal(baseDto.focusable);
      expect(baseChallenge.format).to.equal(baseDto.format);
      expect(baseChallenge.timer).to.equal(baseDto.timer);
      expect(baseChallenge.embedHeight).to.equal(baseDto.embedHeight);
      expect(baseChallenge.embedUrl).to.equal(baseDto.embedUrl);
      expect(baseChallenge.embedTitle).to.equal(baseDto.embedTitle);
      expect(baseChallenge.locales).to.deep.include.members(baseDto.locales);
      expect(baseChallenge.competenceId).to.equal(baseDto.competenceId);
      expect(baseChallenge.skillId).to.equal(baseDto.skillId);
      expect(baseChallenge.hasEmbedInternalValidation).to.equal(baseDto.hasEmbedInternalValidation);
      expect(baseChallenge.noValidationNeeded).to.equal(baseDto.noValidationNeeded);
    });
  });

  describe('#isTimed', function () {
    it('returns false when timer is null', function () {
      const baseChallenge = domainBuilder.shared.buildBaseChallenge.fromDTO({
        ...baseDto,
        timer: null,
      });

      expect(baseChallenge.isTimed()).to.be.false;
    });

    it('returns true when timer is not null', function () {
      const baseChallenge = domainBuilder.shared.buildBaseChallenge.fromDTO({
        ...baseDto,
        timer: 123,
      });

      expect(baseChallenge.isTimed()).to.be.true;
    });
  });

  describe('#hasIllustration', function () {
    it('returns false when challenge has no illustration', function () {
      const baseChallenge = domainBuilder.shared.buildBaseChallenge.fromDTO({
        ...baseDto,
        illustrationUrl: null,
      });

      expect(baseChallenge.hasIllustration()).to.be.false;
    });

    it('returns true when challenge has an illustration', function () {
      const baseChallenge = domainBuilder.shared.buildBaseChallenge.fromDTO({
        ...baseDto,
        illustrationUrl: 'some illustration url',
      });

      expect(baseChallenge.hasIllustration()).to.be.true;
    });
  });

  describe('#hasEmbed', function () {
    it('returns false when challenge has no embed', function () {
      const baseChallenge = domainBuilder.shared.buildBaseChallenge.fromDTO({
        ...baseDto,
        embedUrl: null,
      });

      expect(baseChallenge.hasEmbed()).to.be.false;
    });

    it('returns true when challenge has an embed', function () {
      const baseChallenge = domainBuilder.shared.buildBaseChallenge.fromDTO({
        ...baseDto,
        embedUrl: 'some embed url',
      });

      expect(baseChallenge.hasEmbed()).to.be.true;
    });
  });

  describe('#hasAtLeastOneAttachment', function () {
    it('returns false when challenge has no attachments', function () {
      const baseChallengeA = domainBuilder.shared.buildBaseChallenge.fromDTO({
        ...baseDto,
        attachments: null,
      });
      const baseChallengeB = domainBuilder.shared.buildBaseChallenge.fromDTO({
        ...baseDto,
        attachments: [],
      });

      expect(baseChallengeA.hasAtLeastOneAttachment()).to.be.false;
      expect(baseChallengeB.hasAtLeastOneAttachment()).to.be.false;
    });

    it('returns true when challenge has at least one attachment', function () {
      const baseChallengeA = domainBuilder.shared.buildBaseChallenge.fromDTO({
        ...baseDto,
        attachments: ['one'],
      });
      const baseChallengeB = domainBuilder.shared.buildBaseChallenge.fromDTO({
        ...baseDto,
        attachments: ['two', 'three'],
      });

      expect(baseChallengeA.hasAtLeastOneAttachment()).to.be.true;
      expect(baseChallengeB.hasAtLeastOneAttachment()).to.be.true;
    });
  });

  describe('#isFocused', function () {
    it('returns false when challenge is not focused', function () {
      const baseChallenge = domainBuilder.shared.buildBaseChallenge.fromDTO({
        ...baseDto,
        focusable: false,
      });

      expect(baseChallenge.isFocused()).to.be.false;
    });

    it('returns true when challenge is focused', function () {
      const baseChallenge = domainBuilder.shared.buildBaseChallenge.fromDTO({
        ...baseDto,
        focusable: true,
      });

      expect(baseChallenge.isFocused()).to.be.true;
    });
  });

  describe('#get isMobileCompliant', function () {
    it('returns false when challenge is not responsive for mobile', function () {
      const baseChallenge = domainBuilder.shared.buildBaseChallenge.fromDTO({
        ...baseDto,
        responsive: 'Tablet,TV',
      });

      expect(baseChallenge.isMobileCompliant).to.be.false;
    });

    it('returns true when challenge is mobile compliant', function () {
      const baseChallenge = domainBuilder.shared.buildBaseChallenge.fromDTO({
        ...baseDto,
        responsive: 'Tamagotchi,Smartphone,TV',
      });

      expect(baseChallenge.isMobileCompliant).to.be.true;
    });
  });

  describe('#get isTabletCompliant', function () {
    it('returns false when challenge is not responsive for tablet', function () {
      const baseChallenge = domainBuilder.shared.buildBaseChallenge.fromDTO({
        ...baseDto,
        responsive: 'Smartphone,TV',
      });

      expect(baseChallenge.isTabletCompliant).to.be.false;
    });

    it('returns true when challenge is tablet compliant', function () {
      const baseChallenge = domainBuilder.shared.buildBaseChallenge.fromDTO({
        ...baseDto,
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
          const baseChallenge = domainBuilder.shared.buildBaseChallenge.fromDTO({
            ...baseDto,
            status,
          });

          expect(baseChallenge.isOperative).to.be.true;
        });
      });

    Object.values(STATUSES)
      .filter((status) => !operative_statuses.includes(status))
      .forEach(function (status) {
        it(`returns false when status is ${status}`, function () {
          const baseChallenge = domainBuilder.shared.buildBaseChallenge.fromDTO({
            ...baseDto,
            status,
          });

          expect(baseChallenge.isOperative).to.be.false;
        });
      });
  });
});
