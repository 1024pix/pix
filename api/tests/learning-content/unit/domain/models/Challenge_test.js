import { domainBuilder, expect } from '../../../../test-helper.js';

describe('LearningContent | Unit | Domain | Models | Challenge', function () {
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

  describe('getters', function () {
    it('getters return expected value', function () {
      const challenge = domainBuilder.learningContent.buildChallenge(baseDto);

      expect(challenge.id).to.equal(baseDto.id);
      expect(challenge.instruction).to.equal(baseDto.instruction);
      expect(challenge.alternativeInstruction).to.equal(baseDto.alternativeInstruction);
      expect(challenge.proposals).to.equal(baseDto.proposals);
      expect(challenge.type).to.equal(baseDto.type);
      expect(challenge.solution).to.equal(baseDto.solution);
      expect(challenge.solutionToDisplay).to.equal(baseDto.solutionToDisplay);
      expect(challenge.t1Status).to.equal(baseDto.t1Status);
      expect(challenge.t2Status).to.equal(baseDto.t2Status);
      expect(challenge.t3Status).to.equal(baseDto.t3Status);
      expect(challenge.status).to.equal(baseDto.status);
      expect(challenge.genealogy).to.equal(baseDto.genealogy);
      expect(challenge.accessibility1).to.equal(baseDto.accessibility1);
      expect(challenge.accessibility2).to.equal(baseDto.accessibility2);
      expect(challenge.requireGafamWebsiteAccess).to.equal(baseDto.requireGafamWebsiteAccess);
      expect(challenge.isIncompatibleIpadCertif).to.equal(baseDto.isIncompatibleIpadCertif);
      expect(challenge.deafAndHardOfHearing).to.equal(baseDto.deafAndHardOfHearing);
      expect(challenge.isAwarenessChallenge).to.equal(baseDto.isAwarenessChallenge);
      expect(challenge.toRephrase).to.equal(baseDto.toRephrase);
      expect(challenge.alternativeVersion).to.equal(baseDto.alternativeVersion);
      expect(challenge.shuffled).to.equal(baseDto.shuffled);
      expect(challenge.illustrationAlt).to.equal(baseDto.illustrationAlt);
      expect(challenge.illustrationUrl).to.equal(baseDto.illustrationUrl);
      expect(challenge.attachments).to.deep.include.members(baseDto.attachments);
      expect(challenge.responsive).to.equal(baseDto.responsive);
      expect(challenge.autoReply).to.equal(baseDto.autoReply);
      expect(challenge.focusable).to.equal(baseDto.focusable);
      expect(challenge.format).to.equal(baseDto.format);
      expect(challenge.timer).to.equal(baseDto.timer);
      expect(challenge.embedHeight).to.equal(baseDto.embedHeight);
      expect(challenge.embedUrl).to.equal(baseDto.embedUrl);
      expect(challenge.embedTitle).to.equal(baseDto.embedTitle);
      expect(challenge.locales).to.deep.include.members(baseDto.locales);
      expect(challenge.competenceId).to.equal(baseDto.competenceId);
      expect(challenge.skillId).to.equal(baseDto.skillId);
      expect(challenge.hasEmbedInternalValidation).to.equal(baseDto.hasEmbedInternalValidation);
      expect(challenge.noValidationNeeded).to.equal(baseDto.noValidationNeeded);
    });

    it('returns null for locales when base locales is null', function () {
      const challenge = domainBuilder.learningContent.buildChallenge({
        ...baseDto,
        locales: null,
      });

      expect(challenge.locales).to.be.null;
    });

    it('returns null for attachments when base attachments is null', function () {
      const challenge = domainBuilder.learningContent.buildChallenge({
        ...baseDto,
        attachments: null,
      });

      expect(challenge.attachments).to.be.null;
    });
  });

  describe('proxy behaviour', function () {
    it('cannot set values', function () {
      const challenge = domainBuilder.learningContent.buildChallenge(baseDto);

      const props = [
        'id',
        'instruction',
        'alternativeInstruction',
        'proposals',
        'type',
        'solution',
        'solutionToDisplay',
        't1Status',
        't2Status',
        't3Status',
        'status',
        'genealogy',
        'accessibility1',
        'accessibility2',
        'requireGafamWebsiteAccess',
        'isIncompatibleIpadCertif',
        'deafAndHardOfHearing',
        'isAwarenessChallenge',
        'toRephrase',
        'alternativeVersion',
        'shuffled',
        'illustrationAlt',
        'illustrationUrl',
        'attachments',
        'responsive',
        'autoReply',
        'focusable',
        'format',
        'timer',
        'embedHeight',
        'embedUrl',
        'embedTitle',
        'locales',
        'competenceId',
        'skillId',
        'hasEmbedInternalValidation',
        'noValidationNeeded',
      ];
      props.forEach((prop) => {
        expect(() => {
          challenge[prop] = 'bar';
        }).to.throw(TypeError, new RegExp(`Cannot set property ${prop}`));
      });
    });
  });
});
