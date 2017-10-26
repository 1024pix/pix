module.exports = {

  extractChallengeIdAndAssessmentFromEmail(emailRecipient) {
    const emailRegex = new RegExp(/^([a-z0-9]+)-([0-9]+)/, 'i');
    const regexMatches = emailRecipient.match(emailRegex);

    const challengeId = regexMatches[1];
    const assessmentId = regexMatches[2];

    return { challengeId, assessmentId };
  }

};
