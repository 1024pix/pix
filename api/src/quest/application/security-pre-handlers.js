import JSONApi from 'jsonapi-serializer';

import { NotFoundError } from '../../shared/domain/errors.js';
import { featureToggles } from '../../shared/infrastructure/feature-toggles/index.js';
import { usecases } from '../domain/usecases/index.js';

export async function checkAuthorizationToAccessCombinedCourse(request, h) {
  const userId = request.auth.credentials.userId;
  const code = request.query?.filter?.code || request.params.code;

  const canAccessCombinedCourse = await usecases.hasAccessToCombinedCourse({ userId, code });
  if (canAccessCombinedCourse) return h.response(true);

  return _replyForbiddenError(h);
}

export async function checkUserCanManageCombinedCourse(request, h) {
  const userId = request.auth.credentials.userId;
  const combinedCourseId = request.params.combinedCourseId;

  try {
    const canManageCombinedCourse = await usecases.canManageCombinedCourse({
      userId,
      combinedCourseId,
    });
    if (canManageCombinedCourse) {
      return h.response(true);
    }
    return _replyForbiddenError(h);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return _replyForbiddenError(h);
    }
    throw error;
  }
}

export async function checkParticipationBelongsToCombinedCourse(request, h) {
  const { participationId, combinedCourseId } = request.params;
  try {
    const isParticipationRelatedToCombinedCourse = await usecases.isParticipationOnCombinedCourse({
      participationId,
      combinedCourseId,
    });
    if (isParticipationRelatedToCombinedCourse) {
      return h.response(true);
    }
    return _replyForbiddenError(h);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return _replyForbiddenError(h);
    }
    throw error;
  }
}

export async function checkCombinedCourseBlueprintBelongsToOrganization(request, h) {
  const { organizationId, blueprintId } = request.params;
  try {
    const isCombinedCourseBlueprintInOrganization = await usecases.isCombinedCourseBlueprintInOrganization({
      combinedCourseBlueprintId: blueprintId,
      organizationId,
    });
    if (isCombinedCourseBlueprintInOrganization) {
      return h.response(true);
    }
    return _replyForbiddenError(h);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return _replyForbiddenError(h);
    }
    throw error;
  }
}

function _replyForbiddenError(h) {
  const errorHttpStatusCode = 403;
  const jsonApiError = new JSONApi.Error({
    code: errorHttpStatusCode,
    title: 'Forbidden access',
    detail: 'Missing or insufficient permissions.',
  });
  return h.response(jsonApiError).code(errorHttpStatusCode).takeover();
}

export async function checkCombinedCoursesFeatureIsEnabled(request, h) {
  const areCombinedCoursesEnabled = await featureToggles.get('areCombinedCoursesEnabled');
  if (!areCombinedCoursesEnabled) {
    return h.response('Combined courses feature is disabled').code(422).takeover();
  }
  return h.response(true);
}

export default {
  checkAuthorizationToAccessCombinedCourse,
  checkUserCanManageCombinedCourse,
  checkParticipationBelongsToCombinedCourse,
  checkCombinedCoursesFeatureIsEnabled,
  checkCombinedCourseBlueprintBelongsToOrganization,
};
