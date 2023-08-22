export function getLastAnswerStatus(answers) {
  if (answers.length < 1) {
    return undefined;
  }
  const lastAnswerResult = answers[answers.length - 1].result;
  return lastAnswerResult.status;
}
