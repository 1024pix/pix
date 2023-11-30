import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';
import { usecases } from '../../../../../lib/domain/usecases/index.js';
import { usecases as sessionUsecases } from '../../../../../src/certification/shared/domain/usecases/index.js';
import { sessionMassImportController } from '../../../../../src/certification/session/application/session-mass-import-controller.js';

describe('Unit | Controller | mass-import-controller', function () {
  describe('#validateSessions', function () {
    it('should call the usecase to validate sessions', async function () {
      // given
      const i18n = Symbol('i18n');
      const request = {
        payload: { file: { path: 'csv-path' } },
        params: { certificationCenterId: 123 },
        auth: { credentials: { userId: 2 } },
        i18n,
      };
      const cachedValidatedSessionsKey = 'uuid';

      const csvHelpersStub = {
        parseCsvWithHeader: sinon.stub().resolves(['result data']),
      };
      const csvSerializerStub = {
        deserializeForSessionsImport: sinon.stub().returns(['session']),
      };

      sinon.stub(sessionUsecases, 'validateSessions');
      sinon.stub(usecases, 'getCertificationCenter');

      sessionUsecases.validateSessions.resolves({ cachedValidatedSessionsKey });
      usecases.getCertificationCenter.resolves(domainBuilder.buildCertificationCenter());
      // when
      await sessionMassImportController.validateSessions(request, hFake, {
        csvHelpers: csvHelpersStub,
        csvSerializer: csvSerializerStub,
      });

      // then
      expect(sessionUsecases.validateSessions).to.have.been.calledWithExactly({
        sessions: ['session'],
        certificationCenterId: 123,
        userId: 2,
        i18n,
      });
    });

    it('should return a cachedValidatedSessionsKey', async function () {
      // given
      const request = {
        payload: { file: { path: 'csv-path' } },
        params: { certificationCenterId: 123 },
        auth: { credentials: { userId: 2 } },
      };
      const cachedValidatedSessionsKey = 'uuid';
      const sessionsCount = 2;
      const sessionsWithoutCandidatesCount = 1;
      const candidatesCount = 12;

      const csvHelpersStub = {
        parseCsvWithHeader: sinon.stub().resolves(['result data']),
      };
      const csvSerializerStub = {
        deserializeForSessionsImport: sinon.stub().returns(['session']),
      };

      sinon.stub(sessionUsecases, 'validateSessions');
      sinon.stub(usecases, 'getCertificationCenter');

      sessionUsecases.validateSessions.resolves({
        cachedValidatedSessionsKey,
        sessionsCount,
        sessionsWithoutCandidatesCount,
        candidatesCount,
      });
      usecases.getCertificationCenter.resolves(domainBuilder.buildCertificationCenter());

      // when
      const result = await sessionMassImportController.validateSessions(request, hFake, {
        csvHelpers: csvHelpersStub,
        csvSerializer: csvSerializerStub,
      });

      // then
      expect(result.source).to.deep.equal({
        cachedValidatedSessionsKey,
        sessionsCount,
        sessionsWithoutCandidatesCount,
        candidatesCount,
      });
    });
  });

  describe('#createSessions', function () {
    it('should call the usecase to create sessions', async function () {
      // given
      const request = {
        payload: { data: { attributes: { cachedValidatedSessionsKey: 'uuid' } } },
        params: { certificationCenterId: 123 },
        auth: { credentials: { userId: 2 } },
      };

      sinon.stub(sessionUsecases, 'createSessions');

      sessionUsecases.createSessions.resolves();

      // when
      await sessionMassImportController.createSessions(request, hFake);

      // then
      expect(sessionUsecases.createSessions).to.have.been.calledWithExactly({
        cachedValidatedSessionsKey: 'uuid',
        certificationCenterId: 123,
        userId: 2,
      });
    });
  });
});
