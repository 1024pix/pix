import sinon from 'sinon';

import { finalizeController } from '../../../../../src/certification/session-management/application/finalize-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Certification | Session Management | Unit | Application | Controller | Finalize', function () {
  describe('#finalize', function () {
    it('should call the finalizeSession usecase with correct values', async function () {
      // given
      const sessionId = 1;
      const aCertificationReport = Symbol('a certification report');
      const session = Symbol('a session being finalized');
      const examinerGlobalComment = 'It was a fine session my dear';
      const hasIncident = true;
      const hasJoiningIssue = true;
      const certificationReports = [
        {
          type: 'certification-reports',
        },
      ];
      const request = {
        params: {
          sessionId,
        },
        payload: {
          data: {
            attributes: {
              'examiner-global-comment': examinerGlobalComment,
              'has-incident': hasIncident,
              'has-joining-issue': hasJoiningIssue,
            },
            included: certificationReports,
          },
        },
      };
      const certificationReportSerializer = { deserialize: sinon.stub() };
      certificationReportSerializer.deserialize.resolves(aCertificationReport);
      sinon.stub(usecases, 'finalizeSession').resolves(session);
      sinon.stub(usecases, 'processAutoJury').resolves();
      sinon.stub(usecases, 'registerPublishableSession').resolves();
      sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
        return callback();
      });

      // when
      await finalizeController.finalize(request, hFake, { certificationReportSerializer });

      // then
      expect(usecases.finalizeSession).to.have.been.calledWithExactly({
        sessionId,
        examinerGlobalComment,
        hasIncident,
        hasJoiningIssue,
        certificationReports: [aCertificationReport],
      });
      expect(usecases.processAutoJury).to.have.been.calledWithExactly({
        session,
      });
      expect(usecases.registerPublishableSession).to.have.been.calledWithExactly({ session });
    });
  });
});
