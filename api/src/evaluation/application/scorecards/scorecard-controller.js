// TODO Bounded context violation
import { usecases as devCompUsecases } from '../../../devcomp/domain/usecases/index.js';
// TODO Bounded context violation
import * as tutorialSerializer from '../../../devcomp/infrastructure/serializers/jsonapi/tutorial-serializer.js';
import { UserNotAuthorizedToAccessEntityError } from '../../../shared/domain/errors.js';
import * as requestResponseUtils from '../../../shared/infrastructure/utils/request-response-utils.js';
import { Scorecard } from '../../domain/models/Scorecard.js';
import { evaluationUsecases } from '../../domain/usecases/index.js';
import * as scorecardSerializer from '../../infrastructure/serializers/jsonapi/scorecard-serializer.js';

const getScorecard = function (request, h, dependencies = { requestResponseUtils, scorecardSerializer }) {
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);
  const authenticatedUserId = request.auth.credentials.userId;
  const scorecardId = request.params.id;

  return evaluationUsecases
    .getScorecard({
      authenticatedUserId,
      scorecardId,
      locale,
    })
    .then(dependencies.scorecardSerializer.serialize);
};

const findTutorials = async function (request, h, dependencies = { requestResponseUtils, tutorialSerializer }) {
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);
  const authenticatedUserId = request.auth.credentials.userId;
  const scorecardId = request.params.id;

  const { userId, competenceId } = await Scorecard.parseId(scorecardId);
  if (parseInt(authenticatedUserId) !== parseInt(userId)) {
    throw new UserNotAuthorizedToAccessEntityError();
  }
  const tutorials = await devCompUsecases.findTutorials({
    userId,
    competenceId,
    locale,
  });
  return dependencies.tutorialSerializer.serialize(tutorials);
};

const resetScorecard = function (request, h, dependencies = { scorecardSerializer, requestResponseUtils }) {
  const authenticatedUserId = request.auth.credentials.userId;
  const competenceId = request.params.competenceId;
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  return evaluationUsecases
    .resetScorecard({ userId: authenticatedUserId, competenceId, locale })
    .then(dependencies.scorecardSerializer.serialize);
};

const scorecardController = { getScorecard, findTutorials, resetScorecard };
export { scorecardController };
