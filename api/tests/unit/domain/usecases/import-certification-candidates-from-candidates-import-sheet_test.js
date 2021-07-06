const { expect, sinon, catchErr } = require('../../../test-helper');
const { CertificationCandidateAlreadyLinkedToUserError } = require('../../../../lib/domain/errors');
const importCertificationCandidatesFromCandidatesImportSheet = require('../../../../lib/domain/usecases/import-certification-candidates-from-candidates-import-sheet');

describe('Unit | UseCase | import-certification-candidates-from-attendance-sheet', () => {

  let certificationCandidateRepository;
  let certificationCandidatesOdsService;

  beforeEach(() => {
    certificationCandidateRepository = {
      doesLinkedCertificationCandidateInSessionExist: sinon.stub(),
      setSessionCandidates: sinon.stub(),
    };
    certificationCandidatesOdsService = {
      extractCertificationCandidatesFromCandidatesImportSheet: sinon.stub(),
    };
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
        });

        // then
        expect(result).to.be.an.instanceOf(CertificationCandidateAlreadyLinkedToUserError);
      });
    });

    context('when session contains zero linked certification candidates', () => {

      it('should call the appropriate methods', async function() {
        // given
        const sessionId = 'sessionId';
        const odsBuffer = 'buffer';
        const certificationCandidates = 'extractedCandidates';

        certificationCandidateRepository.doesLinkedCertificationCandidateInSessionExist.withArgs({ sessionId }).resolves(false);
        certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet.withArgs({ sessionId, odsBuffer }).resolves(certificationCandidates);
        certificationCandidateRepository.setSessionCandidates.withArgs(sessionId, certificationCandidates).resolves();

        // when
        await importCertificationCandidatesFromCandidatesImportSheet({
          sessionId,
          odsBuffer,
          certificationCandidatesOdsService,
          certificationCandidateRepository,
        });

        // then
        expect(certificationCandidateRepository.doesLinkedCertificationCandidateInSessionExist).to.have.been.calledWith({ sessionId });
        expect(certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet).to.have.been.calledWith({ sessionId, odsBuffer });
        expect(certificationCandidateRepository.setSessionCandidates).to.have.been.calledWith(sessionId, certificationCandidates);
        expect(certificationCandidateRepository.setSessionCandidates.calledAfter(certificationCandidatesOdsService.extractCertificationCandidatesFromCandidatesImportSheet))
          .to.be.true;
      });
    });
  });
});
