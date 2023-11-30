import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';
import { NotFoundError } from '../../../../../../lib/domain/errors.js';
import { createSessions } from '../../../../../../src/certification/session/domain/usecases/create-sessions.js';
import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import { Session } from '../../../../../../src/certification/session/domain/models/Session.js';
import { CertificationCenter } from '../../../../../../lib/domain/models/CertificationCenter.js';
import { CertificationVersion } from '../../../../../../src/shared/domain/models/CertificationVersion.js';

describe('Unit | UseCase | sessions-mass-import | create-sessions', function () {
  let certificationCenterRepository;
  let certificationCandidateRepository;
  let sessionRepository;
  let dependencies;
  let temporarySessionsStorageForMassImportService;

  beforeEach(function () {
    certificationCenterRepository = { get: sinon.stub() };
    certificationCandidateRepository = { saveInSession: sinon.stub(), deleteBySessionId: sinon.stub() };
    sessionRepository = { save: sinon.stub() };
    temporarySessionsStorageForMassImportService = {
      getByKeyAndUserId: sinon.stub(),
      remove: sinon.stub(),
    };

    dependencies = {
      certificationCenterRepository,
      certificationCandidateRepository,
      sessionRepository,
      temporarySessionsStorageForMassImportService,
    };
  });

  context('when there are no cached sessions matching the key', function () {
    it('should throw a NotFound error', async function () {
      // given
      temporarySessionsStorageForMassImportService.getByKeyAndUserId.resolves(undefined);
      const sessionCreatorId = 1234;
      const cachedValidatedSessionsKey = 'uuid';

      // when
      const error = await catchErr(createSessions)({
        cachedValidatedSessionsKey,
        userId: sessionCreatorId,
        ...dependencies,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when there are cached sessions matching the key', function () {
    context('when at least one of the sessions does NOT exist', function () {
      context('when session has no candidate', function () {
        it('should should only save the session', async function () {
          // given
          const certificationCenter = new CertificationCenter();
          certificationCenterRepository.get.withArgs(certificationCenter.id).resolves(certificationCenter);
          const temporaryCachedSessions = [
            {
              id: undefined,
              certificationCenter: 'Centre de Certifix',
              certificationCenterId: 567,
              address: 'Site 1',
              room: 'Salle 1',
              date: '2023-03-12',
              time: '01:00',
              examiner: 'Pierre',
              description: 'desc',
              supervisorPassword: 'Y722G',
              accessCode: 'accessCode',
              certificationCandidates: [],
            },
          ];
          temporarySessionsStorageForMassImportService.getByKeyAndUserId.resolves(temporaryCachedSessions);
          const sessionCreatorId = 1234;
          const cachedValidatedSessionsKey = 'uuid';
          const domainTransaction = Symbol('trx');
          sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));
          sessionRepository.save.resolves({ id: 1234 });

          // when
          await createSessions({
            cachedValidatedSessionsKey,
            userId: sessionCreatorId,
            certificationCenterId: certificationCenter.id,
            ...dependencies,
          });

          // then
          const expectedSession = new Session({ ...temporaryCachedSessions[0], createdBy: sessionCreatorId });
          expect(sessionRepository.save).to.have.been.calledOnceWith(expectedSession, domainTransaction);
          expect(certificationCandidateRepository.saveInSession).to.not.have.been.called;
        });
      });

      context('when session has at least one candidate', function () {
        it('should save the session and the candidates', async function () {
          // given
          const certificationCenter = new CertificationCenter({ id: 567 });
          certificationCenterRepository.get.withArgs(certificationCenter.id).resolves(certificationCenter);
          const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: undefined });
          const sessionCreatorId = 1234;
          const temporaryCachedSessions = [
            {
              id: undefined,
              certificationCenter: 'Centre de Certifix',
              certificationCenterId: certificationCenter.id,
              address: 'Site 1',
              room: 'Salle 1',
              date: '2023-03-12',
              time: '01:00',
              examiner: 'Pierre',
              description: 'desc',
              supervisorPassword: 'Y722G',
              accessCode: 'accessCode',
              certificationCandidates: [certificationCandidate],
              createdBy: sessionCreatorId,
            },
          ];
          temporarySessionsStorageForMassImportService.getByKeyAndUserId.resolves(temporaryCachedSessions);
          const cachedValidatedSessionsKey = 'uuid';
          const domainTransaction = Symbol('trx');
          sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));
          sessionRepository.save.resolves({ id: 1234 });

          // when
          await createSessions({
            cachedValidatedSessionsKey,
            userId: sessionCreatorId,
            certificationCenterId: certificationCenter.id,
            ...dependencies,
          });

          // then
          const expectedSession = new Session({ ...temporaryCachedSessions[0], createdBy: sessionCreatorId });
          expect(sessionRepository.save).to.have.been.calledOnceWith(expectedSession, domainTransaction);
          expect(certificationCandidateRepository.saveInSession).to.have.been.calledOnceWith({
            sessionId: 1234,
            certificationCandidate,
            domainTransaction,
          });
        });
      });

      context('when certification center is V3 Pilot', function () {
        it('should save the session with the V3 version', async function () {
          // given
          const certificationCenter = new CertificationCenter({ id: 567, isV3Pilot: true });
          certificationCenterRepository.get.withArgs(certificationCenter.id).resolves(certificationCenter);
          const sessionCreatorId = 1234;
          const temporaryCachedSessions = [
            {
              id: undefined,
              certificationCenter: 'Centre de Certifix',
              certificationCenterId: certificationCenter.id,
              address: 'Site 1',
              room: 'Salle 1',
              date: '2023-03-12',
              time: '01:00',
              examiner: 'Pierre',
              description: 'desc',
              supervisorPassword: 'Y722G',
              accessCode: 'accessCode',
              certificationCandidates: [],
              createdBy: sessionCreatorId,
            },
          ];
          temporarySessionsStorageForMassImportService.getByKeyAndUserId.resolves(temporaryCachedSessions);
          const cachedValidatedSessionsKey = 'uuid';
          const domainTransaction = Symbol('trx');
          sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));
          sessionRepository.save.resolves({ id: 1234 });

          // when
          await createSessions({
            cachedValidatedSessionsKey,
            userId: sessionCreatorId,
            certificationCenterId: certificationCenter.id,
            ...dependencies,
          });

          // then
          const expectedSession = new Session({
            ...temporaryCachedSessions[0],
            version: CertificationVersion.V3,
            createdBy: sessionCreatorId,
          });
          expect(sessionRepository.save).to.have.been.calledOnceWith(expectedSession, domainTransaction);
        });
      });

      context('when certification center is not V3 Pilot', function () {
        it('should save the session with the V2 version', async function () {
          // given
          const sessionCreatorId = 1234;
          const certificationCenter = new CertificationCenter({ id: 567, isV3Pilot: false });
          certificationCenterRepository.get.withArgs(certificationCenter.id).resolves(certificationCenter);
          const temporaryCachedSessions = [
            {
              id: undefined,
              certificationCenter: 'Centre de Certifix',
              certificationCenterId: certificationCenter.id,
              address: 'Site 1',
              room: 'Salle 1',
              date: '2023-03-12',
              time: '01:00',
              examiner: 'Pierre',
              description: 'desc',
              supervisorPassword: 'Y722G',
              accessCode: 'accessCode',
              certificationCandidates: [],
              createdBy: sessionCreatorId,
            },
          ];
          temporarySessionsStorageForMassImportService.getByKeyAndUserId.resolves(temporaryCachedSessions);

          const cachedValidatedSessionsKey = 'uuid';
          const domainTransaction = Symbol('trx');
          sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));
          sessionRepository.save.resolves({ id: 1234 });

          // when
          await createSessions({
            cachedValidatedSessionsKey,
            userId: sessionCreatorId,
            certificationCenterId: certificationCenter.id,
            ...dependencies,
          });

          // then
          const expectedSession = new Session({
            ...temporaryCachedSessions[0],
            version: CertificationVersion.V2,
            createdBy: sessionCreatorId,
          });
          expect(sessionRepository.save).to.have.been.calledOnceWith(expectedSession, domainTransaction);
        });
      });
    });

    context('when at least one of the sessions already exists', function () {
      it('should delete previous candidates and save the new candidates', async function () {
        // given
        const certificationCenter = new CertificationCenter();
        certificationCenterRepository.get.withArgs(certificationCenter.id).resolves(certificationCenter);
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: undefined });
        const temporaryCachedSessions = [
          {
            id: 1234,
            certificationCandidates: [{ ...certificationCandidate }],
          },
        ];
        temporarySessionsStorageForMassImportService.getByKeyAndUserId.resolves(temporaryCachedSessions);
        const sessionCreatorId = 1234;
        const cachedValidatedSessionsKey = 'uuid';
        const domainTransaction = Symbol('trx');
        sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));

        // when
        await createSessions({
          cachedValidatedSessionsKey,
          userId: sessionCreatorId,
          certificationCenterId: certificationCenter.id,
          ...dependencies,
        });

        // then
        expect(certificationCandidateRepository.deleteBySessionId).to.have.been.calledOnceWith({
          sessionId: 1234,
          domainTransaction,
        });
        expect(certificationCandidateRepository.saveInSession).to.have.been.calledOnceWith({
          sessionId: 1234,
          certificationCandidate,
          domainTransaction,
        });
      });
    });

    it('should delete cached sessions', async function () {
      // given
      const certificationCenter = new CertificationCenter();
      certificationCenterRepository.get.withArgs(certificationCenter.id).resolves(certificationCenter);
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: undefined });
      const temporaryCachedSessions = [
        {
          id: 1234,
          certificationCandidates: [{ ...certificationCandidate }],
        },
      ];
      temporarySessionsStorageForMassImportService.getByKeyAndUserId.resolves(temporaryCachedSessions);
      const sessionCreatorId = 1234;
      const cachedValidatedSessionsKey = 'uuid';
      const domainTransaction = Symbol('trx');
      sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));

      // when
      await createSessions({
        cachedValidatedSessionsKey,
        userId: sessionCreatorId,
        certificationCenterId: certificationCenter.id,
        ...dependencies,
      });

      // then
      expect(temporarySessionsStorageForMassImportService.remove).to.have.been.calledOnceWith({
        cachedValidatedSessionsKey,
        userId: sessionCreatorId,
      });
    });
  });
});
