import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';
import { targetProfileController } from '../../../../../src/prescription/target-profile/application/admin-target-profile-controller.js';
import { usecases } from '../../../../../src/prescription/target-profile/domain/usecases/index.js';

describe('Unit | Controller | admin-target-profile-controller', function () {
  describe('#getContentAsJsonFile', function () {
    it('should succeed', async function () {
      // given
      const accessToken = 'ABC123';
      sinon.stub(usecases, 'getTargetProfileContentAsJson');
      usecases.getTargetProfileContentAsJson.withArgs({ userId: 66, targetProfileId: 123 }).resolves({
        jsonContent: 'json_content',
        fileName: 'file_name',
      });
      const request = {
        params: {
          id: 123,
        },
        query: {
          accessToken,
        },
      };
      const tokenService = {
        extractUserId: sinon.stub(),
      };
      tokenService.extractUserId.withArgs(accessToken).returns(66);

      // when
      const response = await targetProfileController.getContentAsJsonFile(request, hFake, { tokenService });

      // then
      expect(response.source).to.equal('json_content');
      expect(response.headers).to.deep.equal({
        'Content-Type': 'text/json;charset=utf-8',
        'Content-Disposition': 'attachment; filename=file_name',
      });
    });
  });

  describe('#getLearningContentAsPdf', function () {
    let clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now: new Date('2022-02-01'), toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('should return the pdf', async function () {
      // given
      const learningContent = domainBuilder.buildLearningContent();
      const pdfBuffer = 'some_pdf_buffer';
      const docTitle = 'titre du doc';
      sinon
        .stub(usecases, 'getLearningContentByTargetProfile')
        .withArgs({ targetProfileId: 123, language: 'fr' })
        .resolves({ learningContent, targetProfileName: docTitle });

      const learningContentPDFPresenter = {
        present: sinon.stub(),
      };

      learningContentPDFPresenter.present.withArgs(learningContent, docTitle, 'fr').resolves(pdfBuffer);
      const request = {
        params: {
          id: 123,
          locale: 'fr',
        },
        query: {
          language: 'fr',
        },
      };

      // when
      const response = await targetProfileController.getLearningContentAsPdf(request, hFake, {
        learningContentPDFPresenter,
      });

      // then
      expect(response.headers['Content-Disposition']).to.equal(
        `attachment; filename=20220201_profil_cible_${docTitle}.pdf`,
      );
      expect(response.headers['Content-Type']).to.equal('application/pdf');
      expect(response.source).to.equal(pdfBuffer);
    });
  });
});
