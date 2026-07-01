import sinon from 'sinon';

import { importCertificationCandidatesFromCandidatesImportSheet } from '../../../../../../src/certification/enrolment/domain/usecases/import-certification-candidates-from-candidates-import-sheet.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/constants.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { CandidateAlreadyLinkedToUserError } from '../../../../../../src/shared/domain/errors.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

const i18n = getI18n();

describe('Unit | UseCase | import-certification-candidates-from-attendance-sheet', function () {
  let candidateRepository;
  let certificationCandidatesOdsService;
  let certificationCpfService;
  let certificationCpfCityRepository;
  let certificationCpfCountryRepository;
  let centerRepository;
  let sessionRepository;
  let eventAdapter;
  let dependencies;

  beforeEach(function () {
    candidateRepository = {
      deleteBySessionId: sinon.stub(),
      findBySessionId: sinon.stub(),
      save: sinon.stub(),
    };
    sessionRepository = {
      get: sinon.stub(),
    };
    certificationCandidatesOdsService = {
      extractCertificationCandidatesFromCandidatesImportSheet: sinon.stub(),
    };
    certificationCpfService = {
      getBirthInformation: sinon.stub(),
    };
    eventAdapter = {
      onCandidatesEnrolledWithImportSheet: sinon.stub(),
    };
    certificationCpfCountryRepository = Symbol('certificationCpfCountryRepository');
    certificationCpfCityRepository = Symbol('certificationCpfCityRepository');
    centerRepository = Symbol('centerRepository');
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => {
      return lambda();
    });

    dependencies = {
      certificationCandidatesOdsService,
      candidateRepository,
      certificationCpfService,
      certificationCpfCountryRepository,
      certificationCpfCityRepository,
      centerRepository,
      sessionRepository,
      eventAdapter,
    };
  });

  describe('#importCertificationCandidatesFromCandidatesImportSheet', function () {
    context('when session contains already linked certification candidates', function () {
      it('should throw a BadRequestError', async function () {
        // given
        const sessionId = 'sessionId';
        const session = domainBuilder.certification.enrolment.buildSession({ sessionId });
        const odsBuffer = 'buffer';

        candidateRepository.findBySessionId
          .withArgs({ sessionId })
          .resolves([
            domainBuilder.certification.enrolment.buildCandidate({ userId: 123, reconciledAt: new Date('2024-09-25') }),
          ]);
        sessionRepository.get.withArgs({ id: sessionId }).resolves(session);

        // when
        const result = await catchErr(importCertificationCandidatesFromCandidatesImportSheet)({
          i18n,
          sessionId,
          odsBuffer,
          ...dependencies,
        });

        // then
        expect(result).to.be.an.instanceOf(CandidateAlreadyLinkedToUserError);
        expect(candidateRepository.save).not.to.have.been.called;
        expect(eventAdapter.onCandidatesEnrolledWithImportSheet).not.to.have.been.called;
      });
    });

    context('when session contains zero linked certification candidates', function () {
      const sessionId = 'sessionId';
      let session;

      beforeEach(function () {
        session = domainBuilder.certification.enrolment.buildSession({
          id: sessionId,
          certificationCenterType: CERTIFICATION_CENTER_TYPES.PRO,
        });
        candidateRepository.findBySessionId
          .withArgs({ sessionId })
          .resolves([domainBuilder.certification.enrolment.buildCandidate({ userId: null })]);
        sessionRepository.get.withArgs({ id: sessionId }).resolves(session);
      });

      context('when cpf birth information validation has succeed', function () {
        it('should add the certification candidates', async function () {
          // given
          const odsBuffer = 'buffer';
          const complementaryCertification = domainBuilder.certification.shared.buildComplementaryCertification();
          const candidate = domainBuilder.certification.enrolment.buildCandidate({
            subscriptions: [
              domainBuilder.certification.enrolment.buildCoreSubscription(),
              domainBuilder.certification.shared.buildComplementaryCertification({ ...complementaryCertification }),
            ],
          });
          const candidates = [candidate];

          certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet
            .withArgs({
              i18n,
              session,
              isSco: false,
              odsBuffer,
              certificationCpfService,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
              centerRepository,
            })
            .resolves(candidates);
          candidateRepository.save.resolves(candidates);

          // when
          await importCertificationCandidatesFromCandidatesImportSheet({
            sessionId,
            odsBuffer,
            i18n,
            ...dependencies,
          });

          // then
          expect(candidateRepository.deleteBySessionId).to.have.been.calledWithExactly({
            sessionId,
          });
          expect(candidateRepository.save).to.have.been.calledWithExactly({ candidates });
          expect(candidateRepository.deleteBySessionId.calledBefore(candidateRepository.save)).to.be.true;
          expect(eventAdapter.onCandidatesEnrolledWithImportSheet).to.to.have.been.calledWithExactly({ candidates });
        });
      });
    });
  });
});
