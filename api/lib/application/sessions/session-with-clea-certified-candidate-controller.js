const usecases = require('../../domain/usecases/index.js');
const certificationResultUtils = require('../../infrastructure/utils/csv/certification-results');
const dayjs = require('dayjs');

module.exports = {
  async getCleaCertifiedCandidateDataCsv(request, h) {
    const sessionId = request.params.id;
    const { session, cleaCertifiedCandidateData } = await usecases.getCleaCertifiedCandidateBySession({ sessionId });
    const csvResult = await certificationResultUtils.getCleaCertifiedCandidateCsv(cleaCertifiedCandidateData);

    const dateWithTime = dayjs(session.date + ' ' + session.time)
      .locale('fr')
      .format('YYYYMMDD_HHmm');
    const fileName = `${dateWithTime}_candidats_certifies_clea_${sessionId}.csv`;

    return h
      .response(csvResult)
      .header('Content-Type', 'text/csv;charset=utf-8')
      .header('Content-Disposition', `attachment; filename=${fileName}`);
  },
};
