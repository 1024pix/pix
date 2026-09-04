import { expect } from 'chai';
import sinon from 'sinon';

import { createSessions } from '../../../../../../src/certification/enrolment/domain/usecases/create-sessions.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | sessions-mass-import | create-sessions', function () {
  let candidateRepository;
  let sessionRepository;
  let sessionCodeService;
  let eventAdapter;
  let dependencies;
  let temporarySessionsStorageForMassImportService;

  beforeEach(function () {
    candidateRepository = { deleteBySessionId: sinon.stub(), save: sinon.stub() };
    sessionRepository = { create: sinon.stub() };
    sessionCodeService = { generateInvigilatorPassword: sinon.stub().returns('Y722GA') };
    eventAdapter = { onCandidatesEnrolledWithMassSessionsImport: sinon.stub() };
    temporarySessionsStorageForMassImportService = {
      getByKeyAndUserId: sinon.stub(),
      remove: sinon.stub(),
    };

    dependencies = {
      candidateRepository,
      sessionRepository,
      sessionCodeService,
      eventAdapter,
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
      expect(candidateRepository.save).not.to.have.been.called;
      expect(eventAdapter.onCandidatesEnrolledWithMassSessionsImport).not.to.have.been.called;
    });
  });

  context('when there are cached sessions matching the key', function () {
    context('when at least one of the sessions does NOT exist', function () {
      context('when session has no candidate', function () {
        it('should only create the session, with a freshly generated invigilator password', async function () {
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
              accessCode: 'accessCode',
              certificationCandidates: [],
            },
          ];
          temporarySessionsStorageForMassImportService.getByKeyAndUserId.resolves(temporaryCachedSessions);
          const sessionCreatorId = 1234;
          const cachedValidatedSessionsKey = 'uuid';
          sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
          sessionRepository.create.resolves(1234);

          // when
          await createSessions({
            cachedValidatedSessionsKey,
            userId: sessionCreatorId,
            ...dependencies,
          });

          // then
          expect(sessionRepository.create).to.have.been.calledOnceWithExactly({
            userId: sessionCreatorId,
            certificationCenterId: 567,
            address: 'Site 1',
            room: 'Salle 1',
            examiner: 'Pierre',
            date: '2023-03-12',
            time: '01:00',
            description: 'desc',
            accessCode: 'accessCode',
            invigilatorPassword: 'Y722GA',
          });
          expect(candidateRepository.save).not.to.have.been.called;
          expect(eventAdapter.onCandidatesEnrolledWithMassSessionsImport).not.to.have.been.called;
        });
      });

      context('when session has at least one candidate', function () {
        it('should create the session and the candidates', async function () {
          // given
          const candidate = domainBuilder.certification.enrolment
            .candidateBuilder()
            .withSubscription(Frameworks.DROIT)
            .build();
          const sessionCreatorId = 1234;
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
              accessCode: 'accessCode',
              certificationCandidates: [candidate],
            },
          ];
          temporarySessionsStorageForMassImportService.getByKeyAndUserId.resolves(temporaryCachedSessions);
          const cachedValidatedSessionsKey = 'uuid';
          sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
          sessionRepository.create.resolves(1234);
          const savedCandidate = domainBuilder.certification.enrolment
            .candidateBuilder()
            .withSubscription(Frameworks.DROIT)
            .withParameters({
              ...candidate,
              sessionId: 1234,
            })
            .build();
          candidateRepository.save.resolves([savedCandidate]);

          // when
          await createSessions({
            cachedValidatedSessionsKey,
            userId: sessionCreatorId,
            ...dependencies,
          });

          // then
          expect(sessionRepository.create).to.have.been.calledOnceWithExactly({
            userId: sessionCreatorId,
            certificationCenterId: 567,
            address: 'Site 1',
            room: 'Salle 1',
            examiner: 'Pierre',
            date: '2023-03-12',
            time: '01:00',
            description: 'desc',
            accessCode: 'accessCode',
            invigilatorPassword: 'Y722GA',
          });
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
      it('should delete previous candidates and save the new candidates, without touching the session', async function () {
        // given
        const candidate = domainBuilder.certification.enrolment
          .candidateBuilder()
          .withSubscription(Frameworks.DROIT)
          .build();
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
        const savedCandidate = domainBuilder.certification.enrolment
          .candidateBuilder()
          .withSubscription(Frameworks.DROIT)
          .withParameters({
            ...candidate,
            sessionId: 1234,
          })
          .build();
        candidateRepository.save.resolves([savedCandidate]);

        // when
        await createSessions({
          cachedValidatedSessionsKey,
          userId: sessionCreatorId,
          ...dependencies,
        });

        // then
        expect(sessionRepository.create).not.to.have.been.called;
        expect(sessionCodeService.generateInvigilatorPassword).not.to.have.been.called;
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
      const certificationCandidate = domainBuilder.certification.enrolment
        .candidateBuilder()
        .withSubscription(Frameworks.DROIT)
        .build();
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
