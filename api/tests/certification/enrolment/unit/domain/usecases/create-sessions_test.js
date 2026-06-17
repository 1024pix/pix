import sinon from 'sinon';

import { SessionEnrolment } from '../../../../../../src/certification/enrolment/domain/models/SessionEnrolment.js';
import { createSessions } from '../../../../../../src/certification/enrolment/domain/usecases/create-sessions.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | sessions-mass-import | create-sessions', function () {
  let centerRepository;
  let candidateRepository;
  let sessionRepository;
  let eventAdapter;
  let dependencies;
  let temporarySessionsStorageForMassImportService;
  let candidateData;

  beforeEach(function () {
    centerRepository = { getById: sinon.stub() };
    candidateRepository = { deleteBySessionId: sinon.stub(), save: sinon.stub() };
    sessionRepository = { save: sinon.stub() };
    eventAdapter = { onCandidatesEnrolledWithMassSessionsImport: sinon.stub() };
    temporarySessionsStorageForMassImportService = {
      getByKeyAndUserId: sinon.stub(),
      remove: sinon.stub(),
    };

    dependencies = {
      centerRepository,
      candidateRepository,
      sessionRepository,
      eventAdapter,
      temporarySessionsStorageForMassImportService,
    };

    candidateData = {
      sessionId: undefined,
      subscription: Frameworks.DROIT,
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
      expect(candidateRepository.save).not.to.have.been.called;
      expect(eventAdapter.onCandidatesEnrolledWithMassSessionsImport).not.to.have.been.called;
    });
  });

  context('when there are cached sessions matching the key', function () {
    context('when at least one of the sessions does NOT exist', function () {
      context('when session has no candidate', function () {
        it('should only save the session', async function () {
          // given
          const center = domainBuilder.certification.enrolment.buildCenter();
          centerRepository.getById.withArgs({ id: center.id }).resolves(center);
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
              invigilatorPassword: 'Y722GA',
              accessCode: 'accessCode',
              certificationCandidates: [],
            },
          ];
          temporarySessionsStorageForMassImportService.getByKeyAndUserId.resolves(temporaryCachedSessions);
          const sessionCreatorId = 1234;
          const cachedValidatedSessionsKey = 'uuid';
          sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
          sessionRepository.save.resolves({ id: 1234 });

          // when
          await createSessions({
            cachedValidatedSessionsKey,
            userId: sessionCreatorId,
            certificationCenterId: center.id,
            ...dependencies,
          });

          // then
          const expectedSession = new SessionEnrolment({ ...temporaryCachedSessions[0], createdBy: sessionCreatorId });
          expect(sessionRepository.save).to.have.been.calledOnceWith({ session: expectedSession });
          expect(candidateRepository.save).not.to.have.been.called;
          expect(eventAdapter.onCandidatesEnrolledWithMassSessionsImport).not.to.have.been.called;
        });
      });

      context('when session has at least one candidate', function () {
        it('should save the session and the candidates', async function () {
          // given
          const center = domainBuilder.certification.enrolment.buildCenter({ id: 567 });
          centerRepository.getById.withArgs({ id: center.id }).resolves(center);
          const candidate = domainBuilder.certification.enrolment.buildCandidate(candidateData);
          const sessionCreatorId = 1234;
          const temporaryCachedSessions = [
            {
              id: undefined,
              certificationCenter: 'Centre de Certifix',
              certificationCenterId: center.id,
              address: 'Site 1',
              room: 'Salle 1',
              date: '2023-03-12',
              time: '01:00',
              examiner: 'Pierre',
              description: 'desc',
              invigilatorPassword: 'Y722GA',
              accessCode: 'accessCode',
              certificationCandidates: [candidate],
              createdBy: sessionCreatorId,
            },
          ];
          temporarySessionsStorageForMassImportService.getByKeyAndUserId.resolves(temporaryCachedSessions);
          const cachedValidatedSessionsKey = 'uuid';
          sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
          sessionRepository.save.resolves({ id: 1234 });
          const savedCandidate = domainBuilder.certification.enrolment.buildCandidate({
            ...candidate,
            sessionId: 1234,
            subscription: Frameworks.DROIT,
          });
          candidateRepository.save.resolves([savedCandidate]);

          // when
          await createSessions({
            cachedValidatedSessionsKey,
            userId: sessionCreatorId,
            certificationCenterId: center.id,
            ...dependencies,
          });

          // then
          const expectedSession = new SessionEnrolment({ ...temporaryCachedSessions[0], createdBy: sessionCreatorId });
          expect(sessionRepository.save).to.have.been.calledOnceWith({ session: expectedSession });
          expect(candidateRepository.save).to.have.been.calledOnceWith({
            candidates: [savedCandidate],
          });
          expect(eventAdapter.onCandidatesEnrolledWithMassSessionsImport).to.to.have.been.calledWithExactly({
            candidates: [savedCandidate],
          });
        });
      });
    });

    context('when at least one of the sessions already exists', function () {
      it('should delete previous candidates and save the new candidates', async function () {
        // given
        const center = domainBuilder.certification.enrolment.buildCenter();
        centerRepository.getById.withArgs({ id: center.id }).resolves(center);
        const candidate = domainBuilder.certification.enrolment.buildCandidate(candidateData);
        const temporaryCachedSessions = [
          {
            id: 1234,
            certificationCandidates: [{ ...candidate }],
          },
        ];
        temporarySessionsStorageForMassImportService.getByKeyAndUserId.resolves(temporaryCachedSessions);
        const sessionCreatorId = 1234;
        const cachedValidatedSessionsKey = 'uuid';
        sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
        const savedCandidate = domainBuilder.certification.enrolment.buildCandidate({
          ...candidate,
          sessionId: 1234,
          subscription: Frameworks.DROIT,
        });
        candidateRepository.save.resolves([savedCandidate]);

        // when
        await createSessions({
          cachedValidatedSessionsKey,
          userId: sessionCreatorId,
          certificationCenterId: center.id,
          ...dependencies,
        });

        // then
        expect(candidateRepository.deleteBySessionId).to.have.been.calledOnceWith({
          sessionId: 1234,
        });
        expect(candidateRepository.save).to.have.been.calledOnceWith({
          candidates: [savedCandidate],
        });
        expect(eventAdapter.onCandidatesEnrolledWithMassSessionsImport).to.to.have.been.calledWithExactly({
          candidates: [savedCandidate],
        });
      });
    });

    it('should delete cached sessions', async function () {
      // given
      const center = domainBuilder.certification.enrolment.buildCenter();
      centerRepository.getById.withArgs({ id: center.id }).resolves(center);
      const certificationCandidate = domainBuilder.certification.enrolment.buildCandidate(candidateData);
      const temporaryCachedSessions = [
        {
          id: 1234,
          certificationCandidates: [{ ...certificationCandidate }],
        },
      ];
      temporarySessionsStorageForMassImportService.getByKeyAndUserId.resolves(temporaryCachedSessions);
      const sessionCreatorId = 1234;
      const cachedValidatedSessionsKey = 'uuid';
      sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
      candidateRepository.save.resolves([]);

      // when
      await createSessions({
        cachedValidatedSessionsKey,
        userId: sessionCreatorId,
        certificationCenterId: center.id,
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
