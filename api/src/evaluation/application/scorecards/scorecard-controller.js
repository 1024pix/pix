import * as scorecardSerializer from '../../infrastructure/serializers/jsonapi/scorecard-serializer.js';
import * as tutorialSerializer from '../../../../lib/infrastructure/serializers/jsonapi/tutorial-serializer.js';
import * as requestResponseUtils from '../../../../lib/infrastructure/utils/request-response-utils.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { evaluationUsecases } from '../../../evaluation/domain/usecases/index.js';

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

const findTutorials = function (request, h, dependencies = { requestResponseUtils, tutorialSerializer }) {
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);
  const authenticatedUserId = request.auth.credentials.userId;
  const scorecardId = request.params.id;

  return usecases
    .findTutorials({
      authenticatedUserId,
      scorecardId,
      locale,
    })
    .then(dependencies.tutorialSerializer.serialize);
};

const scorecardController = { getScorecard, findTutorials };
export { scorecardController };
