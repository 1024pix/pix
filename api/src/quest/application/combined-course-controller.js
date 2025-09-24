import { createReadStream } from 'node:fs';

import { getDataBuffer } from '../../prescription/learner-management/infrastructure/utils/bufferize/get-data-buffer.js';
import { extractUserIdFromRequest } from '../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../domain/usecases/index.js';
import * as combinedCourseDetailsSerializer from '../infrastructure/serializers/combined-course-details-serializer.js';
import * as combinedCourseSerializer from '../infrastructure/serializers/combined-course-serializer.js';

const getByCode = async function (request, _, dependencies = { combinedCourseSerializer }) {
  const { code } = request.query.filter;

  const { userId } = request.auth.credentials;

  const combinedCourse = await usecases.getCombinedCourseByCode({ userId, code });
  return dependencies.combinedCourseSerializer.serialize(combinedCourse);
};

const getById = async (request, _, dependencies = { combinedCourseDetailsSerializer }) => {
  const questId = request.params.questId;
  const combinedCourseDetails = await usecases.getCombinedCourseByQuestId({ questId });

  return dependencies.combinedCourseDetailsSerializer.serialize(combinedCourseDetails);
};

const start = async function (request, h) {
  const userId = extractUserIdFromRequest(request);
  const code = request.params.code;

  await usecases.startCombinedCourse({
    userId,
    code,
  });

  return h.response().code(204);
};

const reassessStatus = async function (request, h) {
  const userId = extractUserIdFromRequest(request);
  const code = request.params.code;

  await usecases.updateCombinedCourse({
    userId,
    code,
  });

  return h.response().code(204);
};

const createCombinedCourses = async function (request, h) {
  const filePath = request.payload.path;
  const stream = createReadStream(filePath);
  const payload = await getDataBuffer(stream);
  await usecases.createCombinedCourses({ payload });
  return h.response(null).code(204);
};

const combinedCourseController = {
  getByCode,
  getById,
  start,
  reassessStatus,
  createCombinedCourses,
};

export { combinedCourseController };
