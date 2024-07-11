import { certificationReportsController } from '../../../../../src/certification/results/application/certification-reports-controller.js';
import { usecases } from '../../../../../src/certification/results/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Controller | certification-reports-controller', function () {
  describe('#getCertificationReports', function () {
    it('should return certification candidates', async function () {
      // given
      const sessionId = 1;
      const serializedCertificationReports = Symbol('some serialized certification reports');
      const certificationReports = Symbol('some certification reports');

      const request = {
        params: { id: sessionId },
      };
      sinon.stub(usecases, 'getSessionCertificationReports').withArgs({ sessionId }).resolves(certificationReports);

      const certificationReportSerializer = {
        serialize: sinon.stub(),
      };
      certificationReportSerializer.serialize.withArgs(certificationReports).returns(serializedCertificationReports);

      // when
      const response = await certificationReportsController.getCertificationReports(request, hFake, {
        certificationReportSerializer,
      });

      // then
      expect(response).to.deep.equal(serializedCertificationReports);
    });
  });
});
