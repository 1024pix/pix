import scorecardSerializer from '../../infrastructure/serializers/jsonapi/scorecard-serializer';
import tutorialSerializer from '../../infrastructure/serializers/jsonapi/tutorial-serializer';
import { extractLocaleFromRequest } from '../../infrastructure/utils/request-response-utils';
import usecases from '../../domain/usecases';

export default {
  getScorecard(request) {
    const locale = extractLocaleFromRequest(request);
    const authenticatedUserId = request.auth.credentials.userId;
    const scorecardId = request.params.id;

    return usecases.getScorecard({ authenticatedUserId, scorecardId, locale }).then(scorecardSerializer.serialize);
  },

  findTutorials(request) {
    const locale = extractLocaleFromRequest(request);
    const authenticatedUserId = request.auth.credentials.userId;
    const scorecardId = request.params.id;

    return usecases.findTutorials({ authenticatedUserId, scorecardId, locale }).then(tutorialSerializer.serialize);
  },
};
