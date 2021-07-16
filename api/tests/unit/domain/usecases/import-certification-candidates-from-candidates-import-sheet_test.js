const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { CertificationCandidateAlreadyLinkedToUserError } = require('../../../../lib/domain/errors');
const importCertificationCandidatesFromCandidatesImportSheet = require('../../../../lib/domain/usecases/import-certification-candidates-from-candidates-import-sheet');

describe('Unit | UseCase | import-certification-candidates-from-attendance-sheet', () => {

  let certificationCandidateRepository;
  let certificationCandidatesOdsService;
  let certificationCpfService;
  let certificationCpfCityRepository;
  let certificationCpfCountryRepository;

  beforeEach(() => {
    certificationCandidateRepository = {
      doesLinkedCertificationCandidateInSessionExist: sinon.stub(),
      setSessionCandidates: sinon.stub(),
    };
    certificationCandidatesOdsService = {
      extractCertificationCandidatesFromCandidatesImportSheet: sinon.stub(),
    };
    certificationCpfService = {
      getBirthInformation: sinon.stub(),
    };
    certificationCpfCountryRepository = Symbol('certificationCpfCountryRepository');
    certificationCpfCityRepository = Symbol('certificationCpfCityRepository');
  });

  describe('#importCertificationCandidatesFromCandidatesImportSheet', () => {

    context('when session contains already linked certification candidates', () => {

      it('should throw a BadRequestError', async () => {
        // given
        const sessionId = 'sessionId';
        const odsBuffer = 'buffer';

        certificationCandidateRepository.doesLinkedCertificationCandidateInSessionExist.withArgs({ sessionId }).resolves(true);

        // when
        const result = await catchErr(importCertificationCandidatesFromCandidatesImportSheet)({
          sessionId,
          odsBuffer,
          certificationCandidatesOdsService,
          certificationCandidateRepository,
          certificationCpfService,
          certificationCpfCountryRepository,
          certificationCpfCityRepository,
        });

        // then
        expect(result).to.be.an.instanceOf(CertificationCandidateAlreadyLinkedToUserError);
      });
    });

    context('when session contains zero linked certification candidates', () => {

      context('when cpf birth information validation has succeed', () => {

        it('should add the certification candidates', async function() {
          // given
          const sessionId = 'sessionId';
          const odsBuffer = 'buffer';
          const certificationCandidate = domainBuilder.buildCertificationCandidate();
          const certificationCandidates = [certificationCandidate];

          certificationCandidateRepository.doesLinkedCertificationCandidateInSessionExist.withArgs({ sessionId }).resolves(false);
          certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet.withArgs({
            sessionId,
            odsBuffer,
            certificationCpfService,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
          }).resolves(certificationCandidates);
          certificationCandidateRepository.setSessionCandidates.resolves();

          // when
          await importCertificationCandidatesFromCandidatesImportSheet({
            sessionId,
            odsBuffer,
            certificationCandidatesOdsService,
            certificationCandidateRepository,
            certificationCpfService,
            certificationCpfCountryRepository,
            certificationCpfCityRepository,
          });

          // then
          expect(certificationCandidateRepository.setSessionCandidates).to.have.been.calledWith(sessionId, certificationCandidates);
          expect(certificationCandidateRepository.setSessionCandidates.calledAfter(certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet))
            .to.be.true;
        });
      });
    });
  });
});
