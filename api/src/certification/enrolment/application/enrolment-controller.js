import * as requestResponseUtils from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../domain/usecases/index.js';
import { fillCandidatesImportSheet } from '../infrastructure/files/candidates-import/fill-candidates-import-sheet.js';
import * as enrolledCandidateSerializer from '../infrastructure/serializers/enrolled-candidate-serializer.js';

// TODO LAURA ICI
const enrolStudentsToSession = async function (
  request,
  h,
  dependencies = { enrolledCandidateSerializer, requestResponseUtils },
) {
  const referentId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const sessionId = request.params.id;
  const studentIds = request.deserializedPayload.organizationLearnerIds;

  await usecases.enrolStudentsToSession({ sessionId, referentId, studentIds });
  const enrolledCandidates = await usecases.getEnrolledCandidatesInSession({ sessionId });
  const enrolledCandidatesSerialized = dependencies.enrolledCandidateSerializer.serialize(enrolledCandidates);
  return h.response(enrolledCandidatesSerialized).created();
};

// TODO LAURA ICI
const getCandidatesImportSheet = async function (request, h, dependencies = { fillCandidatesImportSheet }) {
  const translate = request.i18n.__;
  const sessionId = request.params.id;
  const { userId } = request.auth.credentials;
  const filename = translate('candidate-list-template.filename');

  const { session, certificationCenterHabilitations, isScoCertificationCenter } =
    await usecases.getCandidateImportSheetData({
      sessionId,
      userId,
    });
  const candidateImportSheet = await dependencies.fillCandidatesImportSheet({
    session,
    certificationCenterHabilitations,
    isScoCertificationCenter,
    i18n: request.i18n,
  });

  return h
    .response(candidateImportSheet)
    .header('Content-Type', 'application/vnd.oasis.opendocument.spreadsheet')
    .header('Content-Disposition', `attachment; filename=${filename + sessionId}.ods`);
};

const importCertificationCandidatesFromCandidatesImportSheet = async function (request) {
  const sessionId = request.params.id;
  const odsBuffer = request.payload;
  const i18n = request.i18n;

  await usecases.importCertificationCandidatesFromCandidatesImportSheet({ sessionId, odsBuffer, i18n });

  return null;
};

const enrolmentController = {
  enrolStudentsToSession,
  getCandidatesImportSheet,
  importCertificationCandidatesFromCandidatesImportSheet,
};

export { enrolmentController };
