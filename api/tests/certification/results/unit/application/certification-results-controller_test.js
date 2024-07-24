import { certificationResultsController } from '../../../../../src/certification/results/application/certification-results-controller.js';
import { usecases } from '../../../../../src/certification/results/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';
import { getI18n } from '../../../../tooling/i18n/i18n.js';

describe('Certification | Results | Unit | Controller | certification results', function () {
  describe('#getCleaCertifiedCandidateDataCsv', function () {
    it('should return a response with CSV results', async function () {
      // given
      const request = {
        params: {
          id: 1,
        },
      };
      const session = domainBuilder.certification.sessionManagement.buildSession({
        id: 1,
        date: '2021-01-01',
        time: '14:30',
      });
      const cleaCertifiedCandidates = [
        domainBuilder.buildCleaCertifiedCandidate({ createdAt: new Date('2021-01-01') }),
      ];
      const dependencies = {
        getCleaCertifiedCandidateCsv: sinon.stub(),
      };

      sinon
        .stub(usecases, 'getCleaCertifiedCandidateBySession')
        .withArgs({ sessionId: 1 })
        .resolves({ session, cleaCertifiedCandidateData: cleaCertifiedCandidates });

      dependencies.getCleaCertifiedCandidateCsv.withArgs({ cleaCertifiedCandidates }).resolves('csv-string');

      // when
      const response = await certificationResultsController.getCleaCertifiedCandidateDataCsv(
        request,
        hFake,
        dependencies,
      );

      // then
      expect(response.source).to.equal('csv-string');
      expect(response.headers['Content-Type']).to.equal('text/csv;charset=utf-8');
      expect(response.headers['Content-Disposition']).to.equal(
        'attachment; filename=20210101_1430_candidats_certifies_clea_1.csv',
      );
    });
  });

  describe('#getSessionResultsByRecipientEmail ', function () {
    it('should return csv content and fileName', async function () {
      // given
      const i18n = getI18n();
      const session = { id: 1, date: '2020/01/01', time: '12:00' };
      const dependencies = {
        getSessionCertificationResultsCsv: sinon.stub(),
        tokenService: {
          extractCertificationResultsByRecipientEmailLink: sinon.stub(),
        },
      };
      dependencies.tokenService.extractCertificationResultsByRecipientEmailLink
        .withArgs('abcd1234')
        .returns({ sessionId: 1, resultRecipientEmail: 'user@example.net' });

      sinon
        .stub(usecases, 'getSessionResultsByResultRecipientEmail')
        .withArgs({ sessionId: session.id, resultRecipientEmail: 'user@example.net' })
        .resolves({
          session,
          certificationResults: [],
        });

      dependencies.getSessionCertificationResultsCsv
        .withArgs({ session, certificationResults: [], i18n })
        .resolves({ content: 'csv content', filename: '20200101_1200_resultats_session_1.csv' });

      // when
      const response = await certificationResultsController.getSessionResultsByRecipientEmail(
        { i18n, params: { token: 'abcd1234' } },
        hFake,
        dependencies,
      );

      // then
      expect(response.source).to.deep.equal('csv content');
      expect(response.headers['Content-Disposition']).to.equal(
        'attachment; filename=20200101_1200_resultats_session_1.csv',
      );
    });
  });

  describe('#getSessionResultsToDownload ', function () {
    it('should return results to download', async function () {
      // given
      const userId = 274939274;
      const i18n = getI18n();
      const session = { id: 1, date: '2020/01/01', time: '12:00' };
      const sessionId = session.id;
      const fileName = `20200101_1200_resultats_session_${sessionId}.csv`;
      const certificationResults = [];
      const token = Symbol('a beautiful token');
      const request = {
        i18n,
        params: { id: sessionId, token },
        auth: {
          credentials: { userId },
        },
      };
      const dependencies = {
        getSessionCertificationResultsCsv: sinon.stub(),
        tokenService: {
          extractCertificationResultsLink: sinon.stub(),
        },
      };
      dependencies.tokenService.extractCertificationResultsLink.withArgs(token).returns({ sessionId });
      dependencies.getSessionCertificationResultsCsv
        .withArgs({
          session,
          certificationResults,
          i18n: request.i18n,
        })
        .returns({ content: 'csv-string', filename: fileName });
      sinon.stub(usecases, 'getSessionResults').withArgs({ sessionId }).resolves({ session, certificationResults });

      // when
      const response = await certificationResultsController.getSessionResultsToDownload(request, hFake, dependencies);

      // then
      expect(response.source).to.deep.equal('csv-string');
      expect(response.headers['Content-Disposition']).to.equal(`attachment; filename=${fileName}`);
    });
  });
});
