const Boom = require('boom');

const AnswerStatus = require('../../domain/models/AnswerStatus');
const AnswerStatusDatabaseAdapter = require('../../interfaces/storage/database/AnswerStatusDatabaseAdapter');

const AnswerRepository = require('../../infrastructure/repositories/answer-repository');
const SolutionRepository = require('../../infrastructure/repositories/solution-repository');
const qmailService = require('../../domain/services/qmail-service');
const qmailValidationService = require('../../domain/services/qmail-validation-service');
const { NotFoundError, NotElligibleToQmailError } = require('../../domain/errors');

function _checkThatChallengeIsQMAIL(challengeSolution) {
  if(challengeSolution.type !== 'QMAIL') {
    throw new NotElligibleToQmailError();
  }
}

function _updateAnswerResult(bookshelfAnswer, mail, challengeSolution) {
  const isEmailValidated = qmailValidationService.validateEmail(mail, challengeSolution);

  const answerNewResult = isEmailValidated ? AnswerStatus.OK : AnswerStatus.KO;
  bookshelfAnswer.set('result', AnswerStatusDatabaseAdapter.adapt(answerNewResult));

  return bookshelfAnswer.save();
}

module.exports = {

  validate(request, reply) {

    let challengeSolution;
    const emailRecipient = request.payload.mail.to.text;
    const { challengeId, assessmentId } = qmailService.extractChallengeIdAndAssessmentFromEmail(emailRecipient);

    return SolutionRepository
      .get(challengeId)
      .then((foundSolution) => challengeSolution = foundSolution)
      .then(_checkThatChallengeIsQMAIL)
      .then(() => AnswerRepository.findByChallengeAndAssessment(challengeId, assessmentId))
      .then((answer) => answer ? _updateAnswerResult(answer, request.payload, challengeSolution.value) : null)
      .then(reply)
      .catch((err) => {
        if(err instanceof NotFoundError) {
          reply(Boom.badRequest(`Le challenge ${challengeId} n'existe pas.`));
        } else if(err instanceof NotElligibleToQmailError) {
          reply(Boom.badRequest(`Le challenge ${challengeId} n'est pas elligible à une validation QMAIL`));
        } else {
          reply(Boom.badImplementation(err));
        }
      });
  }
};
