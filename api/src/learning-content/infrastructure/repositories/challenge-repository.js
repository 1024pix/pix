import { clearCache } from '../../../shared/infrastructure/repositories/challenge-repository.js';
import { LearningContentRepository } from './learning-content-repository.js';

class ChallengeRepository extends LearningContentRepository {
  constructor() {
    super({
      tableName: 'learningcontent.challenges',
      chunkSize: 500,
      rawFields: [ "tStatus" ],
    });
  }

  toDto({
    id,
    instruction,
    alternativeInstruction,
    proposals,
    type,
    solution,
    solutionToDisplay,
    status,
    genealogy,
    accessibility1,
    accessibility2,
    requireGafamWebsiteAccess,
    isIncompatibleIpadCertif,
    deafAndHardOfHearing,
    isAwarenessChallenge,
    toRephrase,
    alternativeVersion,
    shuffled,
    illustrationAlt,
    illustrationUrl,
    attachments,
    responsive,
    alpha,
    delta,
    autoReply,
    focusable,
    format,
    timer,
    embedHeight,
    embedUrl,
    embedTitle,
    locales,
    competenceId,
    skillId,
    hasEmbedInternalValidation,
    noValidationNeeded,
    ...restObj
  }) {
    const resDto = {
      id,
      instruction,
      alternativeInstruction,
      proposals,
      type,
      solution,
      solutionToDisplay,
      status,
      genealogy,
      accessibility1,
      accessibility2,
      requireGafamWebsiteAccess,
      isIncompatibleIpadCertif,
      deafAndHardOfHearing,
      isAwarenessChallenge,
      toRephrase,
      alternativeVersion,
      shuffled,
      illustrationAlt,
      illustrationUrl,
      attachments,
      responsive,
      alpha,
      delta,
      autoReply,
      focusable,
      format,
      timer,
      embedHeight,
      embedUrl,
      embedTitle,
      locales,
      competenceId,
      skillId,
      hasEmbedInternalValidation,
      noValidationNeeded,
    };

    let tStatus = 0b0;

    for(let i=0; i<32;i++) {
      const tName = `t${i+1}Status`;
      if (tName in restObj && restObj[tName]) {
        tStatus = tStatus | (0b1 << i)
      }
    }

    return {...resDto, tStatus: `B'${tStatus.toString(2).padStart(32,'0')}'`,};
  }

  clearCache(id) {
    clearCache(id);
  }
}

export const challengeRepository = new ChallengeRepository();
