import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import { importCertificationCandidatesFromCandidatesImportSheet } from '../../../../../../src/certification/enrolment/domain/usecases/import-certification-candidates-from-candidates-import-sheet.js';
import { CandidateAlreadyLinkedToUserError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';
const i18n = getI18n();

describe('Unit | UseCase | import-certification-candidates-from-attendance-sheet', function () {
  let candidateRepository;
  let certificationCandidatesOdsService;
  let certificationCpfService;
  let certificationCpfCityRepository;
  let certificationCpfCountryRepository;
  let complementaryCertificationRepository;
  let certificationCenterRepository;
  let sessionRepository;

  beforeEach(function () {
    candidateRepository = {
      deleteBySessionId: sinon.stub(),
      findBySessionId: sinon.stub(),
      saveInSession: sinon.stub(),
    };
    sessionRepository = {
      isSco: sinon.stub(),
      get: sinon.stub(),
    };
    certificationCandidatesOdsService = {
      extractCertificationCandidatesFromCandidatesImportSheet: sinon.stub(),
    };
    certificationCpfService = {
      getBirthInformation: sinon.stub(),
    };
    certificationCpfCountryRepository = Symbol('certificationCpfCountryRepository');
    certificationCpfCityRepository = Symbol('certificationCpfCityRepository');
    complementaryCertificationRepository = Symbol('complementaryCertificationRepository');
    certificationCenterRepository = Symbol('certificationCenterRepository');
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => {
      return lambda();
    });
  });

  describe('#importCertificationCandidatesFromCandidatesImportSheet', function () {
    context('when session contains already linked certification candidates', function () {
      it('should throw a BadRequestError', async function () {
        // given
        const sessionId = 'sessionId';
        const odsBuffer = 'buffer';

        candidateRepository.findBySessionId
          .withArgs({ sessionId })
          .resolves([domainBuilder.certification.enrolment.buildCandidate({ userId: 123 })]);
        sessionRepository.get
          .withArgs({ id: sessionId })
          .resolves(domainBuilder.certification.enrolment.buildSession());

        // when
        const result = await catchErr(importCertificationCandidatesFromCandidatesImportSheet)({
          i18n,
          sessionId,
          odsBuffer,
          certificationCandidatesOdsService,
          candidateRepository,
          certificationCpfService,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
          complementaryCertificationRepository,
          certificationCenterRepository,
          sessionRepository,
        });

        // then
        expect(result).to.be.an.instanceOf(CandidateAlreadyLinkedToUserError);
      });
    });

    context('when session contains zero linked certification candidates', function () {
      const sessionId = 'sessionId';

      beforeEach(function () {
        candidateRepository.findBySessionId
          .withArgs({ sessionId })
          .resolves([domainBuilder.certification.enrolment.buildCandidate({ userId: null })]);
        sessionRepository.get
          .withArgs({ id: sessionId })
          .resolves(domainBuilder.certification.enrolment.buildSession());
      });

      context('when cpf birth information validation has succeed', function () {
        it('should add the certification candidates', async function () {
          // given
          const odsBuffer = 'buffer';
          const complementaryCertification = domainBuilder.buildComplementaryCertification();
          const candidate = domainBuilder.certification.enrolment.buildCandidate({
            subscriptions: [
              domainBuilder.buildCoreSubscription(),
              domainBuilder.buildComplementaryCertification({ ...complementaryCertification }),
            ],
            // complementaryCertification,
          });
          const candidates = [candidate];

          sessionRepository.isSco.resolves(false);

          certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet
            .withArgs({
              i18n,
              sessionId,
              isSco: false,
              odsBuffer,
              certificationCpfService,
              certificationCpfCountryRepository,
              certificationCpfCityRepository,
              complementaryCertificationRepository,
              certificationCenterRepository,
            })
            .resolves(candidates);

          // when
          await importCertificationCandidatesFromCandidatesImportSheet({
            sessionId,
            odsBuffer,
            i18n,
            certificationCandidatesOdsService,
            candidateRepository,
            certificationCpfService,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
            complementaryCertificationRepository,
            certificationCenterRepository,
            sessionRepository,
          });

          // then
          expect(candidateRepository.deleteBySessionId).to.have.been.calledWithExactly({
            sessionId,
          });
          expect(candidateRepository.saveInSession).to.have.been.calledWithExactly({
            candidate,
            sessionId,
          });
          expect(candidateRepository.deleteBySessionId.calledBefore(candidateRepository.saveInSession)).to.be.true;
        });
      });
    });
  });
});
