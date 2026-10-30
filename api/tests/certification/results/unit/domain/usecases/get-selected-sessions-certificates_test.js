import { expect } from 'chai';
import sinon from 'sinon';

import { NoCertificatesToDownloadError } from '../../../../../../src/certification/results/domain/errors.js';
import { getSelectedSessionsCertificates } from '../../../../../../src/certification/results/domain/usecases/get-selected-sessions-certificates.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | get-selected-sessions-certificates', function () {
  it('should return a zip file of multiple certificates', async function () {
    // given
    const now = new Date('2025-09-26');
    sinon.useFakeTimers({ now, toFake: ['Date'] });

    const i18nStub = { getLocale: sinon.stub().returns('fr') };
    const generatedPDF1 = Symbol('pdf1');
    const generatedPDF2 = Symbol('pdf2');
    const getCertificatesForSessionStub = sinon.stub();
    getCertificatesForSessionStub.onFirstCall().returns(generatedPDF1);
    getCertificatesForSessionStub.onSecondCall().returns(generatedPDF2);

    const generatedZip = Symbol('zip');
    const getMultipleFilesAsZipStub = sinon.stub().returns(generatedZip);

    const session1Id = 11;
    const session2Id = 55;

    // when
    const { filename, content } = await getSelectedSessionsCertificates({
      sessionIds: [session1Id, session2Id],
      i18n: i18nStub,
      isFrenchDomainExtension: true,
      dependencies: {
        getCertificatesForSession: getCertificatesForSessionStub,
        getMultipleFilesAsZip: getMultipleFilesAsZipStub,
      },
    });

    // then
    expect(getCertificatesForSessionStub.firstCall).to.have.been.calledWithExactly({
      sessionId: session1Id,
      isFrenchDomainExtension: true,
      i18n: i18nStub,
    });

    expect(getCertificatesForSessionStub.secondCall).to.have.been.calledWithExactly({
      sessionId: session2Id,
      isFrenchDomainExtension: true,
      i18n: i18nStub,
    });

    expect(getMultipleFilesAsZipStub).to.have.been.calledOnceWithExactly({
      files: [generatedPDF1, generatedPDF2],
    });

    expect(filename).to.deep.equal(`pix-sessions-certificates-${Date.now()}.zip`);
    expect(content).to.deep.equal(generatedZip);
  });

  describe('when a selected session has no certificate', function () {
    it('should return a zip file without this session certificates', async function () {
      // given
      const generatedPDF = Symbol('pdf');
      const getCertificatesForSessionStub = sinon.stub();
      getCertificatesForSessionStub.onFirstCall().rejects(new NotFoundError());
      getCertificatesForSessionStub.onSecondCall().resolves(generatedPDF);

      const generatedZip = Symbol('zip');
      const getMultipleFilesAsZipStub = sinon.stub().resolves(generatedZip);

      // when
      const { content } = await getSelectedSessionsCertificates({
        sessionIds: [11, 55],
        i18n: Symbol('i18n'),
        isFrenchDomainExtension: true,
        dependencies: {
          getCertificatesForSession: getCertificatesForSessionStub,
          getMultipleFilesAsZip: getMultipleFilesAsZipStub,
        },
      });

      // then
      expect(getMultipleFilesAsZipStub).to.have.been.calledOnceWithExactly({ files: [generatedPDF] });
      expect(content).to.equal(generatedZip);
    });
  });

  describe('when no selected session has certificates', function () {
    it('should throw a NoCertificatesToDownloadError', async function () {
      // given
      const getCertificatesForSessionStub = sinon.stub().rejects(new NotFoundError());
      const getMultipleFilesAsZipStub = sinon.stub();

      // when
      const error = await catchErr(getSelectedSessionsCertificates)({
        sessionIds: [11, 55],
        i18n: Symbol('i18n'),
        isFrenchDomainExtension: true,
        dependencies: {
          getCertificatesForSession: getCertificatesForSessionStub,
          getMultipleFilesAsZip: getMultipleFilesAsZipStub,
        },
      });

      // then
      expect(error).to.be.an.instanceOf(NoCertificatesToDownloadError);
      expect(getMultipleFilesAsZipStub).to.not.have.been.called;
    });
  });

  describe('when an unexpected error occurs while getting a session certificates', function () {
    it('should throw the error', async function () {
      // given
      const unexpectedError = new Error('PDF generation failed');
      const getCertificatesForSessionStub = sinon.stub().rejects(unexpectedError);

      // when
      const error = await catchErr(getSelectedSessionsCertificates)({
        sessionIds: [11, 55],
        i18n: Symbol('i18n'),
        isFrenchDomainExtension: true,
        dependencies: {
          getCertificatesForSession: getCertificatesForSessionStub,
          getMultipleFilesAsZip: sinon.stub(),
        },
      });

      // then
      expect(error).to.equal(unexpectedError);
    });
  });
});
