import { expect } from 'chai';
import sinon from 'sinon';

import { importCertificationCandidatesFromCandidatesImportSheet } from '../../../../../../src/certification/enrolment/domain/usecases/import-certification-candidates-from-candidates-import-sheet.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { CERTIFICATION_CENTER_TYPES } from '../../../../../../src/shared/constants.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { CandidateAlreadyLinkedToUserError } from '../../../../../../src/shared/domain/errors.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';
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
  let sessionAuthorizationAdapter;
  let dependencies;

  beforeEach(function () {
    candidateRepository = {
      deleteBySessionId: sinon.stub(),
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
    sessionAuthorizationAdapter = {
      find: sinon.stub(),
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
      sessionAuthorizationAdapter,
    };
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('#importCertificationCandidatesFromCandidatesImportSheet', function () {
    context('when session cannot enrolled candidates', function () {
      it('should throw a BadRequestError', async function () {
        // given
        const sessionId = 'sessionId';
        const odsBuffer = 'buffer';
        sessionAuthorizationAdapter.find
          .withArgs({ sessionId })
          .resolves(
            domainBuilder.certification.enrolment.sessionAuthorizationBuilder().cannotEnrollODSCandidate().build(),
          );

        // when
        const result = await catchErr(importCertificationCandidatesFromCandidatesImportSheet)({
          i18n,
          sessionId,
          odsBuffer,
          ...dependencies,
        });

        // then
        expect(result).to.be.an.instanceOf(CandidateAlreadyLinkedToUserError);
        sinon.assert.notCalled(candidateRepository.save);
        sinon.assert.notCalled(eventAdapter.onCandidatesEnrolledWithImportSheet);
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
        sessionAuthorizationAdapter.find
          .withArgs({ sessionId })
          .resolves(
            domainBuilder.certification.enrolment.sessionAuthorizationBuilder().canEnrollODSCandidate().build(),
          );
        sessionRepository.get.withArgs({ id: sessionId }).resolves(session);
      });

      context('when cpf birth information validation has succeed', function () {
        it('should add the certification candidates', async function () {
          // given
          const odsBuffer = 'buffer';
          const candidate = domainBuilder.certification.enrolment
            .candidateBuilder()
            .withSubscription(Frameworks.DROIT)
            .build();
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
          sinon.assert.calledWithExactly(candidateRepository.deleteBySessionId, {
            sessionId,
          });
          sinon.assert.calledWithExactly(candidateRepository.save, { candidates });
          sinon.assert.calledWithExactly(eventAdapter.onCandidatesEnrolledWithImportSheet, { candidates });
        });
      });
    });
  });
});
