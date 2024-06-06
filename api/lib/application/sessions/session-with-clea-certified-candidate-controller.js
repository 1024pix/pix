import dayjs from 'dayjs';

import { getCleaCertifiedCandidateCsv } from '../../../src/certification/course/infrastructure/utils/csv/certification-results/get-clea-certified-candidate-csv.js';
import { usecases } from '../../domain/usecases/index.js';

const getCleaCertifiedCandidateDataCsv = async function (request, h, dependencies = { getCleaCertifiedCandidateCsv }) {
  const sessionId = request.params.id;
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

const sessionWithCleaCertifiedCandidateController = { getCleaCertifiedCandidateDataCsv };

export { sessionWithCleaCertifiedCandidateController };
