const { expect, sinon, catchErr } = require('../../../test-helper');
const { CertificationCandidateAlreadyLinkedToUserError } = require('../../../../lib/domain/errors');
const importCertificationCandidatesFromCandidatesImportSheet = require('../../../../lib/domain/usecases/import-certification-candidates-from-candidates-import-sheet');
const certificationCandidateRepository = require('../../../../lib/infrastructure/repositories/certification-candidate-repository');
const certificationCandidatesOdsService = require('../../../../lib/domain/services/certification-candidates-ods-service');

describe('Unit | UseCase | import-certification-candidates-from-attendance-sheet', () => {

  describe('#importCertificationCandidatesFromCandidatesImportSheet', () => {
    const sessionId = 'sessionId';
    const odsBuffer = 'buffer';
    const certificationCandidates = 'extractedCandidates';

    context('when session contains already linked certification candidates', () => {

      beforeEach(() => {
        sinon.stub(certificationCandidateRepository, 'doesLinkedCertificationCandidateInSessionExist')
          .withArgs({ sessionId })
          .resolves(true);
      });

      it('should throw a BadRequestError', async () => {
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

      beforeEach(() => {
        sinon.stub(certificationCandidateRepository, 'doesLinkedCertificationCandidateInSessionExist')
          .withArgs({ sessionId })
          .resolves(false);
        sinon.stub(certificationCandidatesOdsService, 'extractCertificationCandidatesFromCandidatesImportSheet')
          .withArgs({ sessionId, odsBuffer })
          .resolves(certificationCandidates);
        sinon.stub(certificationCandidateRepository, 'setSessionCandidates')
          .withArgs(sessionId, certificationCandidates)
          .resolves();
      });

      it('should call the appropriate methods', async function() {
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
