import * as challengeForCorrectionRepository from '../../../../../src/evaluation/infrastructure/repositories/challenge-for-correction-repository.js';
import { databaseBuilder, domainBuilder, expect } from '../../../../test-helper.js';

describe('Evaluation | Integration | Infrastructure| Repository | challenge-for-correction', function () {
  const challengeData = {
    id: 'challengeId00',
    instruction: 'instruction challengeId00',
    alternativeInstruction: 'alternativeInstruction challengeId00',
    proposals: 'proposals challengeId00',
    type: 'QCU',
    solution: 'solution challengeId00',
    solutionToDisplay: 'solutionToDisplay challengeId00',
    t1Status: true,
    t2Status: false,
    t3Status: true,
    status: 'validé',
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
    alpha: 1.1,
    delta: 3.3,
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

  beforeEach(async function () {
    databaseBuilder.factory.learningContent.build({
      challenges: [challengeData],
    });
    await databaseBuilder.commit();
  });

  describe('#get', function () {
    it('returns the challenge for correction', async function () {
      // when
      const challengeForCorrection = await challengeForCorrectionRepository.get('challengeId00');

      // then
      expect(challengeForCorrection).to.deepEqualInstance(
        domainBuilder.evaluation.buildChallengeForCorrection({
          ...challengeData,
          focused: challengeData.focusable,
          solutionAlgo: domainBuilder.buildSolution({
            id: challengeData.id,
            type: challengeData.type,
            value: challengeData.solution,
            isT1Enabled: challengeData.t1Status,
            isT2Enabled: challengeData.t2Status,
            isT3Enabled: challengeData.t3Status,
            qrocBlocksTypes: {},
          }),
        }),
      );
    });
  });
});
