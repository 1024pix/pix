import * as scorecardSerializer from '../../../src/evaluation/infrastructure/serializers/jsonapi/scorecard-serializer.js';
import * as tutorialSerializer from '../../infrastructure/serializers/jsonapi/tutorial-serializer.js';
import * as requestResponseUtils from '../../infrastructure/utils/request-response-utils.js';
import { usecases } from '../../domain/usecases/index.js';

const getScorecard = function (request, h, dependencies = { requestResponseUtils, scorecardSerializer }) {
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);
  const authenticatedUserId = request.auth.credentials.userId;
  const scorecardId = request.params.id;

  return usecases
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
