import { getI18nFromRequest } from '../../../shared/infrastructure/i18n/i18n.js';
import { usecases } from '../domain/usecases/index.js';
import { fillCandidatesImportSheet } from '../infrastructure/candidates-import/fill-candidates-import-sheet.js';
import { candidateSerializer } from '../infrastructure/serializers/candidate-serializer.js';

const enrolStudentsToSession = async function (request, h, dependencies = { candidateSerializer }) {
  const sessionId = request.params.sessionId;
  const studentIds = request.deserializedPayload.organizationLearnerIds;

  await usecases.enrolStudentsToSession({ sessionId, studentIds });
  const enrolledCandidates = await usecases.getEnrolledCandidatesInSession({ sessionId });
  const enrolledCandidatesSerialized = dependencies.candidateSerializer.serialize(enrolledCandidates);
  return h.response(enrolledCandidatesSerialized).created();
};

const getCandidatesImportSheet = async function (request, h, dependencies = { fillCandidatesImportSheet }) {
  const i18n = getI18nFromRequest(request);

  const sessionId = request.params.sessionId;
  const { userId } = request.auth.credentials;
  const filename = i18n.__('candidate-list-template.filename');

  const { session, enrolledCandidates, certificationCenterHabilitations, isScoCertificationCenter } =
    await usecases.getCandidateImportSheetData({
      sessionId,
      userId,
    });
  const candidateImportSheet = await dependencies.fillCandidatesImportSheet({
    session,
    enrolledCandidates,
    certificationCenterHabilitations,
    isScoCertificationCenter,
    i18n,
  });

  return h
    .response(candidateImportSheet)
    .header('Content-Type', 'application/vnd.oasis.opendocument.spreadsheet')
    .header('Content-Disposition', `attachment; filename=${filename + sessionId}.ods`);
};

const importCertificationCandidatesFromCandidatesImportSheet = async function (request) {
  const i18n = getI18nFromRequest(request);

  const sessionId = request.params.sessionId;
  const odsBuffer = request.payload;

  await usecases.importCertificationCandidatesFromCandidatesImportSheet({
    sessionId,
    odsBuffer,
    i18n,
  });

  return null;
};

const enrolmentController = {
  enrolStudentsToSession,
  getCandidatesImportSheet,
  importCertificationCandidatesFromCandidatesImportSheet,
};

export { enrolmentController };
