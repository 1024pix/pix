const { expect, sinon, catchErr, domainBuilder } = require('../../../../test-helper');
const { NotFoundError } = require('../../../../../lib/domain/errors');
const createSessions = require('../../../../../lib/domain/usecases/sessions-mass-import/create-sessions');
const temporarySessionsStorageForMassImportService = require('../../../../../lib/domain/services/sessions-mass-import/temporary-sessions-storage-for-mass-import-service');
const DomainTransaction = require('../../../../../lib/infrastructure/DomainTransaction');
const Session = require('../../../../../lib/domain/models/Session');

describe('Unit | UseCase | sessions-mass-import | create-sessions', function () {
  let certificationCandidateRepository;
  let sessionRepository;
  let dependencies;

  beforeEach(function () {
    certificationCandidateRepository = { saveInSession: sinon.stub(), deleteBySessionId: sinon.stub() };
    sessionRepository = { save: sinon.stub() };
    dependencies = {
      certificationCandidateRepository,
      sessionRepository,
    };
  });

  context('when there are no cached sessions matching the key', function () {
    it('should throw a NotFound error', async function () {
      // given
      temporarySessionsStorageForMassImportService.getByKeyAndUserId = sinon.stub();
      temporarySessionsStorageForMassImportService.getByKeyAndUserId.resolves(undefined);
      const userId = 1234;
      const cachedValidatedSessionsKey = 'uuid';

      // when
      const error = await catchErr(createSessions)({
        cachedValidatedSessionsKey,
        userId,
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
          temporarySessionsStorageForMassImportService.getByKeyAndUserId = sinon
            .stub()
            .resolves(temporaryCachedSessions);
          const userId = 1234;
          const cachedValidatedSessionsKey = 'uuid';
          const domainTransaction = Symbol('trx');
          sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));
          sessionRepository.save.resolves({ id: 1234 });

          // when
          await createSessions({
            cachedValidatedSessionsKey,
            userId,
            ...dependencies,
          });

          // then
          const expectedSession = new Session({ ...temporaryCachedSessions[0] });
          expect(sessionRepository.save).to.have.been.calledOnceWith(expectedSession, domainTransaction);
          expect(certificationCandidateRepository.saveInSession).to.not.have.been.called;
        });
      });

      context('when session has at least one candidate', function () {
        it('should save the session and the candidates', async function () {
          // given
          const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: undefined });
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
              certificationCandidates: [certificationCandidate],
            },
          ];
          temporarySessionsStorageForMassImportService.getByKeyAndUserId = sinon
            .stub()
            .resolves(temporaryCachedSessions);
          const userId = 1234;
          const cachedValidatedSessionsKey = 'uuid';
          const domainTransaction = Symbol('trx');
          sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));
          sessionRepository.save.resolves({ id: 1234 });

          // when
          await createSessions({
            cachedValidatedSessionsKey,
            userId,
            ...dependencies,
          });

          // then
          const expectedSession = new Session({ ...temporaryCachedSessions[0] });
          expect(sessionRepository.save).to.have.been.calledOnceWith(expectedSession, domainTransaction);
          expect(certificationCandidateRepository.saveInSession).to.have.been.calledOnceWith({
            sessionId: 1234,
            certificationCandidate,
            domainTransaction,
          });
        });
      });
    });

    context('when at least one of the sessions already exists', function () {
      it('should delete previous candidates and save the new candidates', async function () {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: undefined });
        const temporaryCachedSessions = [
          {
            id: 1234,
            certificationCandidates: [{ ...certificationCandidate }],
          },
        ];
        temporarySessionsStorageForMassImportService.getByKeyAndUserId = sinon.stub().resolves(temporaryCachedSessions);
        const userId = 1234;
        const cachedValidatedSessionsKey = 'uuid';
        const domainTransaction = Symbol('trx');
        sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));

        // when
        await createSessions({
          cachedValidatedSessionsKey,
          userId,
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
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: undefined });
      const temporaryCachedSessions = [
        {
          id: 1234,
          certificationCandidates: [{ ...certificationCandidate }],
        },
      ];
      temporarySessionsStorageForMassImportService.getByKeyAndUserId = sinon.stub().resolves(temporaryCachedSessions);
      temporarySessionsStorageForMassImportService.delete = sinon.stub();
      const userId = 1234;
      const cachedValidatedSessionsKey = 'uuid';
      const domainTransaction = Symbol('trx');
      sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda(domainTransaction));

      // when
      await createSessions({
        cachedValidatedSessionsKey,
        userId,
        ...dependencies,
      });

      // then
      expect(temporarySessionsStorageForMassImportService.delete).to.have.been.calledOnceWith({
        cachedValidatedSessionsKey,
        userId,
      });
    });
  });
});
