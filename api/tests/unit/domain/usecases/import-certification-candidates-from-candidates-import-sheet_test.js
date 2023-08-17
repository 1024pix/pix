import { CertificationCandidateAlreadyLinkedToUserError } from '../../../../lib/domain/errors.js';
import { importCertificationCandidatesFromCandidatesImportSheet } from '../../../../lib/domain/usecases/import-certification-candidates-from-candidates-import-sheet.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';
import { getI18n } from '../../../tooling/i18n/i18n.js';
const i18n = getI18n();

describe('Unit | UseCase | import-certification-candidates-from-attendance-sheet', function () {
  let certificationCandidateRepository;
  let certificationCandidatesOdsService;
  let certificationCpfService;
  let certificationCpfCityRepository;
  let certificationCpfCountryRepository;
  let complementaryCertificationRepository;
  let certificationCenterRepository;
  let sessionRepository;
  let domainTransaction;

  beforeEach(function () {
    certificationCandidateRepository = {
      doesLinkedCertificationCandidateInSessionExist: sinon.stub(),
      deleteBySessionId: sinon.stub(),
      saveInSession: sinon.stub(),
    };
    sessionRepository = {
      isSco: sinon.stub(),
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
    domainTransaction = Symbol('domainTransaction');
    DomainTransaction.execute = (lambda) => {
      return lambda(domainTransaction);
    };
  });

  describe('#importCertificationCandidatesFromCandidatesImportSheet', function () {
    context('when session contains already linked certification candidates', function () {
      it('should throw a BadRequestError', async function () {
        // given
        const sessionId = 'sessionId';
        const odsBuffer = 'buffer';

        certificationCandidateRepository.doesLinkedCertificationCandidateInSessionExist
          .withArgs({ sessionId })
          .resolves(true);

        // when
        const result = await catchErr(importCertificationCandidatesFromCandidatesImportSheet)({
          i18n,
          sessionId,
          odsBuffer,
          certificationCandidatesOdsService,
          certificationCandidateRepository,
          certificationCpfService,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
          complementaryCertificationRepository,
          certificationCenterRepository,
        });

        // then
        expect(result).to.be.an.instanceOf(CertificationCandidateAlreadyLinkedToUserError);
      });
    });

    context('when session contains zero linked certification candidates', function () {
      context('when cpf birth information validation has succeed', function () {
        it('should add the certification candidates', async function () {
          // given
          const sessionId = 'sessionId';
          const odsBuffer = 'buffer';
          const complementaryCertification = domainBuilder.buildComplementaryCertification();
          const certificationCandidate = domainBuilder.buildCertificationCandidate({
            complementaryCertification,
          });
          const certificationCandidates = [certificationCandidate];

          sessionRepository.isSco.resolves(false);

          certificationCandidateRepository.doesLinkedCertificationCandidateInSessionExist
            .withArgs({ sessionId })
            .resolves(false);

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
            .resolves(certificationCandidates);

          // when
          await importCertificationCandidatesFromCandidatesImportSheet({
            sessionId,
            odsBuffer,
            i18n,
            certificationCandidatesOdsService,
            certificationCandidateRepository,
            certificationCpfService,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
            complementaryCertificationRepository,
            certificationCenterRepository,
            sessionRepository,
          });

          // then
          expect(certificationCandidateRepository.deleteBySessionId).to.have.been.calledWith({
            sessionId,
            domainTransaction,
          });
          expect(certificationCandidateRepository.saveInSession).to.have.been.calledWith({
            certificationCandidate,
            sessionId,
            domainTransaction,
          });
          expect(
            certificationCandidateRepository.deleteBySessionId.calledBefore(
              certificationCandidateRepository.saveInSession,
            ),
          ).to.be.true;
        });
      });
    });
  });
});
