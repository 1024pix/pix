import { createReadStream } from 'node:fs';

import { getDataBuffer } from '../../prescription/learner-management/infrastructure/utils/bufferize/get-data-buffer.js';
import { getChallengeLocale } from '../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../domain/usecases/index.js';
import { campaignTypeCombinedCourseSerializer } from '../infrastructure/serializers/campaign-type-combined-course-serializer.js';
import { combinedCourseDetailsSerializer } from '../infrastructure/serializers/combined-course-details-serializer.js';
import { combinedCourseForCreationSerializer } from '../infrastructure/serializers/combined-course-for-creation-serializer.js';
import { combinedCourseListSerializer } from '../infrastructure/serializers/combined-course-list-serializer.js';
import { combinedCourseParticipationDetailSerializer } from '../infrastructure/serializers/combined-course-participation-detail-serializer.js';
import { combinedCourseParticipationSerializer } from '../infrastructure/serializers/combined-course-participation-serializer.js';
import { combinedCourseSerializer } from '../infrastructure/serializers/combined-course-serializer.js';
import { combinedCourseStatisticsSerializer } from '../infrastructure/serializers/combined-course-statistics-serializer.js';
import { courseSerializer } from '../infrastructure/serializers/course-serializer.js';

const getByCode = async function (request, _, dependencies = { combinedCourseSerializer }) {
  const { code } = request.query.filter;

  const { userId } = request.auth.credentials;

  const combinedCourse = await usecases.getCombinedCourseByCode({ userId, code });
  return dependencies.combinedCourseSerializer.serialize(combinedCourse);
};

const getById = async (request, _, dependencies = { combinedCourseDetailsSerializer }) => {
  const combinedCourseId = request.params.combinedCourseId;
  const combinedCourseDetails = await usecases.getCombinedCourseById({ combinedCourseId });

  return dependencies.combinedCourseDetailsSerializer.serialize(combinedCourseDetails);
};

const getByOrganizationId = async (request, _, dependencies = { combinedCourseListSerializer }) => {
  const organizationId = request.params.organizationId;
  const page = request.query.page;
  const { combinedCourses, meta } = await usecases.getCombinedCoursesByOrganizationId({ organizationId, page });

  return dependencies.combinedCourseListSerializer.serialize(combinedCourses, meta);
};

const getStatistics = async (request, _, dependencies = { combinedCourseStatisticsSerializer }) => {
  const combinedCourseId = request.params.combinedCourseId;
  const combinedCourseStatistics = await usecases.getCombinedCourseStatistics({ combinedCourseId });
  return dependencies.combinedCourseStatisticsSerializer.serialize(combinedCourseStatistics);
};

const getCombinedCourseParticipationById = async function (
  request,
  _,
  dependencies = { combinedCourseParticipationDetailSerializer },
) {
  const participationId = request.params.participationId;
  const combinedCourseId = request.params.combinedCourseId;
  const combinedCourseDetails = await usecases.getCombinedCourseParticipationById({
    participationId,
    combinedCourseId,
  });
  return dependencies.combinedCourseParticipationDetailSerializer.serialize(combinedCourseDetails);
};

const findParticipations = async (request, _, dependencies = { combinedCourseParticipationSerializer }) => {
  const combinedCourseId = request.params.combinedCourseId;
  const page = request.query.page;
  const filters = request.query.filters;
  const { combinedCourseParticipations, meta } = await usecases.findCombinedCourseParticipations({
    combinedCourseId,
    page,
    filters,
  });
  return dependencies.combinedCourseParticipationSerializer.serialize(combinedCourseParticipations, meta);
};

const start = async function (request, h) {
  const { userId } = request.auth.credentials;
  const code = request.params.code;

  await usecases.startCombinedCourse({
    userId,
    code,
  });

  return h.response().code(204);
};

const reassessStatus = async function (request, h) {
  const { userId } = request.auth.credentials;
  const code = request.params.code;

  await usecases.updateCombinedCourseProgress({
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

const createCombinedCourse = async function (
  request,
  h,
  dependencies = { campaignTypeCombinedCourseSerializer, combinedCourseForCreationSerializer },
) {
  const { userId } = request.auth.credentials;

  const combinedCourseForCreation = dependencies.combinedCourseForCreationSerializer.deserialize(request.payload);

  const createdCombinedCourse = await usecases.createCombinedCourse({
    combinedCourseForCreation,
    creatorId: userId,
  });
  return h
    .response(
      dependencies.campaignTypeCombinedCourseSerializer.serialize({
        ...createdCombinedCourse,
        type: 'COMBINED_COURSE',
      }),
    )
    .created();
};

const getCourseByOrganizationId = async (request, _, dependencies = { courseSerializer }) => {
  const { organizationId } = request.params;
  const locale = getChallengeLocale(request);
  const courseItems = await usecases.getCourseByOrganizationId({ organizationId, locale });

  return dependencies.courseSerializer.serialize(courseItems);
};

const combinedCourseController = {
  getByCode,
  getById,
  getByOrganizationId,
  getStatistics,
  getCombinedCourseParticipationById,
  findParticipations,
  start,
  reassessStatus,
  createCombinedCourses,
  createCombinedCourse,
  getCourseByOrganizationId,
};

export { combinedCourseController };
