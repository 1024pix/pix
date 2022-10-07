const { domainBuilder, sinon, hFake, expect } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const certificationResultUtils = require('../../../../lib/infrastructure/utils/csv/certification-results');
const sessionWithCleaCertifiedCandidateController = require('../../../../lib/application/sessions/session-with-clea-certified-candidate-controller');

describe('Unit | Controller | session-with-clea-certified-candidate', function () {
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers(new Date('2021-01-01T14:30:00Z'));
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#getCleaCertifiedCandidateDataCsv', function () {
    it('should return a response with CSV results', async function () {
      // given
      const request = {
        params: {
          id: 1,
        },
      };
      const session = domainBuilder.buildSession({ id: 1, date: new Date('2021-01-01'), time: '14:30' });
      const cleaCertifiedCandidates = [
        domainBuilder.buildCleaCertifiedCandidate({ createdAt: new Date('2021-01-01') }),
      ];

      // sinon.stub(momentProto, 'format');
      // momentProto.format.withArgs('YYYYMMDD_HHmm').returns('20210101_1430');

      sinon
        .stub(usecases, 'getCleaCertifiedCandidateBySession')
        .withArgs({ sessionId: 1 })
        .resolves({ session, cleaCertifiedCandidateData: cleaCertifiedCandidates });

      sinon
        .stub(certificationResultUtils, 'getCleaCertifiedCandidateCsv')
        .withArgs(cleaCertifiedCandidates)
        .resolves('csv-string');

      // when
      const response = await sessionWithCleaCertifiedCandidateController.getCleaCertifiedCandidateDataCsv(
        request,
        hFake
      );

      // then
      expect(response.source).to.equal('csv-string');
      expect(response.headers['Content-Type']).to.equal('text/csv;charset=utf-8');
      expect(response.headers['Content-Disposition']).to.equal(
        'attachment; filename=20210101_1430_candidats_certifies_clea_1.csv'
      );
    });
  });
});
