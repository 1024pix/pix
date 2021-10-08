const CertificationIssueReportResolutionAttempt = require('./CertificationIssueReportResolutionAttempt');
const { CertificationIssueReportSubcategories } = require('./CertificationIssueReportCategory');

async function neutralizeIfTimedChallengeStrategy({
  certificationIssueReport,
  certificationAssessment,
  certificationIssueReportRepository,
  challengeRepository,
}) {
  const questionNumber = certificationIssueReport.questionNumber;
  const recId = certificationAssessment.getChallengeRecIdByQuestionNumber(questionNumber);

  if (!recId) {
    return _resolveWithNoQuestionFoundWithQuestionNumber(
      certificationIssueReportRepository,
      certificationIssueReport,
      questionNumber
    );
  }

  const challenge = await challengeRepository.get(recId);

  if (!challenge.isTimed()) {
    return _resolveWithChallengeNotTimed(certificationIssueReportRepository, certificationIssueReport);
  }
  return _neutralizeAndResolve(certificationAssessment, certificationIssueReportRepository, certificationIssueReport);
}

async function neutralizeIfEmbedStrategy({
  certificationIssueReport,
  certificationAssessment,
  certificationIssueReportRepository,
  challengeRepository,
}) {
  const questionNumber = certificationIssueReport.questionNumber;
  const recId = certificationAssessment.getChallengeRecIdByQuestionNumber(questionNumber);

  if (!recId) {
    return _resolveWithNoQuestionFoundWithQuestionNumber(
      certificationIssueReportRepository,
      certificationIssueReport,
      questionNumber
    );
  }

  const challenge = await challengeRepository.get(recId);

  if (!challenge.hasEmbed()) {
    return _resolveWithNoEmbedInChallenge(certificationIssueReportRepository, certificationIssueReport);
  }

  return _neutralizeAndResolve(certificationAssessment, certificationIssueReportRepository, certificationIssueReport);
}

async function neutralizeIfImageStrategy({
  certificationIssueReport,
  certificationAssessment,
  certificationIssueReportRepository,
  challengeRepository,
}) {
  const questionNumber = certificationIssueReport.questionNumber;
  const recId = certificationAssessment.getChallengeRecIdByQuestionNumber(questionNumber);

  if (!recId) {
    return _resolveWithNoQuestionFoundWithQuestionNumber(
      certificationIssueReportRepository,
      certificationIssueReport,
      questionNumber
    );
  }

  const challenge = await challengeRepository.get(recId);

  if (!challenge.hasIllustration()) {
    return _resolveWithNoImageInChallenge(certificationIssueReportRepository, certificationIssueReport);
  }

  return _neutralizeAndResolve(certificationAssessment, certificationIssueReportRepository, certificationIssueReport);
}

async function neutralizeIfAttachmentStrategy({
  certificationIssueReport,
  certificationAssessment,
  certificationIssueReportRepository,
  challengeRepository,
}) {
  const questionNumber = certificationIssueReport.questionNumber;
  const recId = certificationAssessment.getChallengeRecIdByQuestionNumber(questionNumber);

  if (!recId) {
    return _resolveWithNoQuestionFoundWithQuestionNumber(
      certificationIssueReportRepository,
      certificationIssueReport,
      questionNumber
    );
  }

  const challenge = await challengeRepository.get(recId);

  if (!challenge.hasAtLeastOneAttachment()) {
    return _resolveWithNoAttachmentInChallenge(certificationIssueReportRepository, certificationIssueReport);
  }

  return _neutralizeAndResolve(certificationAssessment, certificationIssueReportRepository, certificationIssueReport);
}

async function neutralizeWithoutCheckingStrategy({
  certificationIssueReport,
  certificationAssessment,
  certificationIssueReportRepository,
}) {
  return _neutralizeAndResolve(certificationAssessment, certificationIssueReportRepository, certificationIssueReport);
}

async function doNotResolveStrategy() {
  return CertificationIssueReportResolutionAttempt.unresolved();
}

class CertificationIssueReportResolutionStrategies {
  constructor({
    neutralizeWithoutChecking = neutralizeWithoutCheckingStrategy,
    neutralizeIfImage = neutralizeIfImageStrategy,
    neutralizeIfEmbed = neutralizeIfEmbedStrategy,
    neutralizeIfAttachment = neutralizeIfAttachmentStrategy,
    doNotResolve = doNotResolveStrategy,
    neutralizeIfTimedChallenge = neutralizeIfTimedChallengeStrategy,
    certificationIssueReportRepository,
    challengeRepository,
  }) {
    this._neutralizeWithoutChecking = neutralizeWithoutChecking;
    this._neutralizeIfImage = neutralizeIfImage;
    this._neutralizeIfEmbed = neutralizeIfEmbed;
    this._neutralizeIfAttachment = neutralizeIfAttachment;
    this._doNotResolve = doNotResolve;
    this._neutralizeIfTimedChallenge = neutralizeIfTimedChallenge;
    this._certificationIssueReportRepository = certificationIssueReportRepository;
    this._challengeRepository = challengeRepository;
  }

  async resolve({ certificationIssueReport, certificationAssessment }) {
    const strategyParameters = {
      certificationIssueReport,
      certificationAssessment,
      certificationIssueReportRepository: this._certificationIssueReportRepository,
      challengeRepository: this._challengeRepository,
    };

    switch (certificationIssueReport.subcategory) {
      case CertificationIssueReportSubcategories.WEBSITE_BLOCKED:
      case CertificationIssueReportSubcategories.WEBSITE_UNAVAILABLE:
      case CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING:
        return await this._neutralizeWithoutChecking(strategyParameters);
      case CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING:
        return await this._neutralizeIfImage(strategyParameters);
      case CertificationIssueReportSubcategories.EMBED_NOT_WORKING:
        return await this._neutralizeIfEmbed(strategyParameters);
      case CertificationIssueReportSubcategories.FILE_NOT_OPENING:
        return await this._neutralizeIfAttachment(strategyParameters);
      case CertificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED:
        return await this._neutralizeIfTimedChallenge(strategyParameters);
      default:
        return await this._doNotResolve(strategyParameters);
    }
  }
}

module.exports = {
  neutralizeWithoutCheckingStrategy,
  neutralizeIfImageStrategy,
  neutralizeIfEmbedStrategy,
  neutralizeIfAttachmentStrategy,
  doNotResolveStrategy,
  neutralizeIfTimedChallengeStrategy,
  CertificationIssueReportResolutionStrategies,
};

function _neutralizeAndResolve(certificationAssessment, certificationIssueReportRepository, certificationIssueReport) {
  const questionNumber = certificationIssueReport.questionNumber;
  const neutralizationAttempt =
    certificationAssessment.neutralizeChallengeByNumberIfKoOrSkippedOrPartially(questionNumber);
  if (neutralizationAttempt.hasSucceeded()) {
    return _resolveWithQuestionNeutralized(certificationIssueReportRepository, certificationIssueReport);
  } else if (neutralizationAttempt.wasSkipped()) {
    return _resolveWithAnswerIsCorrect(certificationIssueReportRepository, certificationIssueReport);
  } else {
    return _resolveWithNoQuestionFoundWithQuestionNumber(
      certificationIssueReportRepository,
      certificationIssueReport,
      questionNumber
    );
  }
}

async function _resolveWithNoQuestionFoundWithQuestionNumber(
  certificationIssueReportRepository,
  certificationIssueReport,
  questionNumber
) {
  certificationIssueReport.resolve(`Aucune question ne correspond au numéro ${questionNumber}`);
  await certificationIssueReportRepository.save(certificationIssueReport);
  return CertificationIssueReportResolutionAttempt.resolvedWithoutEffect();
}

async function _resolveWithQuestionNeutralized(certificationIssueReportRepository, certificationIssueReport) {
  certificationIssueReport.resolve('Cette question a été neutralisée automatiquement');
  await certificationIssueReportRepository.save(certificationIssueReport);
  return CertificationIssueReportResolutionAttempt.resolvedWithEffect();
}

async function _resolveWithNoImageInChallenge(certificationIssueReportRepository, certificationIssueReport) {
  certificationIssueReport.resolve("Cette question n' a pas été neutralisée car elle ne contient pas d'image");
  await certificationIssueReportRepository.save(certificationIssueReport);
  return CertificationIssueReportResolutionAttempt.resolvedWithoutEffect();
}

async function _resolveWithNoAttachmentInChallenge(certificationIssueReportRepository, certificationIssueReport) {
  certificationIssueReport.resolve(
    "Cette question n' a pas été neutralisée car elle ne contient pas de fichier à télécharger"
  );
  await certificationIssueReportRepository.save(certificationIssueReport);
  return CertificationIssueReportResolutionAttempt.resolvedWithoutEffect();
}

async function _resolveWithNoEmbedInChallenge(certificationIssueReportRepository, certificationIssueReport) {
  certificationIssueReport.resolve(
    "Cette question n' a pas été neutralisée car elle ne contient pas d'application/simulateur"
  );
  await certificationIssueReportRepository.save(certificationIssueReport);
  return CertificationIssueReportResolutionAttempt.resolvedWithoutEffect();
}

async function _resolveWithChallengeNotTimed(certificationIssueReportRepository, certificationIssueReport) {
  certificationIssueReport.resolve("Cette question n' a pas été neutralisée car elle n'est pas chronométrée");
  await certificationIssueReportRepository.save(certificationIssueReport);
  return CertificationIssueReportResolutionAttempt.resolvedWithoutEffect();
}

async function _resolveWithAnswerIsCorrect(certificationIssueReportRepository, certificationIssueReport) {
  certificationIssueReport.resolve("Cette question n'a pas été neutralisée car la réponse est correcte");
  await certificationIssueReportRepository.save(certificationIssueReport);
  return CertificationIssueReportResolutionAttempt.resolvedWithoutEffect();
}
