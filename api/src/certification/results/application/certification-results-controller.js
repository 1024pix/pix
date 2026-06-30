import dayjs from 'dayjs';

import { getI18nFromRequest } from '../../../shared/infrastructure/i18n/i18n.js';
import { CertificationResultsLinkByEmailToken } from '../domain/models/tokens/CertificationResultsLinkByEmailToken.js';
import { CertificationResultsLinkToken } from '../domain/models/tokens/CertificationResultsLinkToken.js';
import * as sessionResultsLinkService from '../domain/services/session-results-link-service.js';
import { usecases } from '../domain/usecases/index.js';
import * as certifiedProfileRepository from '../infrastructure/repositories/certified-profile-repository.js';
import * as certifiedProfileSerializer from '../infrastructure/serializers/certified-profile-serializer.js';
import { getCleaCertifiedCandidateCsv } from '../infrastructure/utils/csv/certification-results/get-clea-certified-candidate-csv.js';
const getCleaCertifiedCandidateDataCsv = async function (request, h, dependencies = { getCleaCertifiedCandidateCsv }) {
  const sessionId = request.params.sessionId;
  const { session, cleaCertifiedCandidateData } = await usecases.getCleaCertifiedCandidateBySession({ sessionId });
  const csvResult = await dependencies.getCleaCertifiedCandidateCsv({
    cleaCertifiedCandidates: cleaCertifiedCandidateData,
  });

  const dateWithTime = dayjs(session.date + ' ' + session.time)
    .locale('fr')
    .format('YYYYMMDD_HHmm');
  const fileName = `${dateWithTime}_candidats_certifies_clea_${sessionId}.csv`;

  return h
    .response(csvResult)
    .header('Content-Type', 'text/csv;charset=utf-8')
    .header('Content-Disposition', `attachment; filename=${fileName}`);
};

const getSessionResultsByRecipientEmail = async function (request, h) {
  const i18n = getI18nFromRequest(request);

  const token = request.params.token;

  const { resultRecipientEmail, sessionId } = CertificationResultsLinkByEmailToken.decode(token);
  const certificationResults = await usecases.getSessionResultsByResultRecipientEmail({
    sessionId,
    resultRecipientEmail,
  });

  const csvResult = await usecases.getSessionCertificationResultsCsv({
    sessionId,
    certificationResults,
    i18n,
  });

  return h
    .response(csvResult.content)
    .header('Content-Type', 'text/csv;charset=utf-8')
    .header('Content-Disposition', `attachment; filename=${csvResult.filename}`);
};

const postSessionResultsToDownload = async function (request, h) {
  const i18n = getI18nFromRequest(request);

  const { sessionId } = CertificationResultsLinkToken.decode(request.payload.token);
  const certificationResults = await usecases.getSessionResults({ sessionId });

  const csvResult = await usecases.getSessionCertificationResultsCsv({
    sessionId,
    certificationResults,
    i18n,
  });

  return h
    .response(csvResult.content)
    .header('Content-Type', 'text/csv;charset=utf-8')
    .header('Content-Disposition', `attachment; filename=${csvResult.filename}`);
};

const getCertifiedProfile = async function (
  request,
  h,
  dependencies = { certifiedProfileRepository, certifiedProfileSerializer },
) {
  const certificationCourseId = request.params.id;
  //TODO add passthrough usecase to remove link between application and infrastructure
  const certifiedProfile = await dependencies.certifiedProfileRepository.get(certificationCourseId);
  return dependencies.certifiedProfileSerializer.serialize(certifiedProfile);
};

const generateSessionResultsDownloadLink = function (request, h, dependencies = { sessionResultsLinkService }) {
  const i18n = getI18nFromRequest(request);

  const sessionId = request.params.sessionId;
  const sessionResultsLink = dependencies.sessionResultsLinkService.generateResultsLink({ sessionId, i18n });

  return h.response({ sessionResultsLink });
};

const certificationResultsController = {
  getCleaCertifiedCandidateDataCsv,
  getSessionResultsByRecipientEmail,
  postSessionResultsToDownload,
  getCertifiedProfile,
  generateSessionResultsDownloadLink,
};

export { certificationResultsController };
