import { expect } from 'chai';
import sinon from 'sinon';

import { getSelectedSessionsCertificates } from '../../../../../../src/certification/results/domain/usecases/get-selected-sessions-certificates.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | get-selected-sessions-certificates', function () {
  let archive;

  beforeEach(function () {
    archive = {
      entry: sinon.stub().yields(),
      finish: sinon.stub(),
      destroyed: false,
    };
  });

  it('should add each session certificates to the archive', async function () {
    // given
    const i18nStub = { getLocale: sinon.stub().returns('fr') };
    const generatedPDF1 = Symbol('pdf1');
    const generatedPDF2 = Symbol('pdf2');
    const getCertificatesForSessionStub = sinon.stub();
    getCertificatesForSessionStub.onFirstCall().resolves({ filename: 'session-11.pdf', content: generatedPDF1 });
    getCertificatesForSessionStub.onSecondCall().resolves({ filename: 'session-55.pdf', content: generatedPDF2 });

    const session1Id = 11;
    const session2Id = 55;

    // when
    await getSelectedSessionsCertificates({
      archive,
      sessionIds: [session1Id, session2Id],
      i18n: i18nStub,
      isFrenchDomainExtension: true,
      dependencies: {
        getCertificatesForSession: getCertificatesForSessionStub,
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

    expect(archive.entry).to.have.been.calledTwice;
    expect(archive.entry.firstCall).to.have.been.calledWith(generatedPDF1, { name: 'session-11.pdf' });
    expect(archive.entry.secondCall).to.have.been.calledWith(generatedPDF2, { name: 'session-55.pdf' });
    expect(archive.finish).to.have.been.calledOnce;
  });

  describe('when a selected session has no certificate', function () {
    it('should add the other sessions certificates to the archive', async function () {
      // given
      const generatedPDF = Symbol('pdf');
      const getCertificatesForSessionStub = sinon.stub();
      getCertificatesForSessionStub.onFirstCall().rejects(new NotFoundError());
      getCertificatesForSessionStub.onSecondCall().resolves({ filename: 'session-55.pdf', content: generatedPDF });

      // when
      await getSelectedSessionsCertificates({
        archive,
        sessionIds: [11, 55],
        i18n: Symbol('i18n'),
        isFrenchDomainExtension: true,
        dependencies: {
          getCertificatesForSession: getCertificatesForSessionStub,
        },
      });

      // then
      expect(archive.entry).to.have.been.calledOnceWith(generatedPDF, { name: 'session-55.pdf' });
      expect(archive.finish).to.have.been.calledOnce;
    });
  });

  describe('when no selected session has certificates', function () {
    it('should finish an empty archive', async function () {
      // given
      const getCertificatesForSessionStub = sinon.stub().rejects(new NotFoundError());

      // when
      await getSelectedSessionsCertificates({
        archive,
        sessionIds: [11, 55],
        i18n: Symbol('i18n'),
        isFrenchDomainExtension: true,
        dependencies: {
          getCertificatesForSession: getCertificatesForSessionStub,
        },
      });

      // then
      expect(archive.entry).to.not.have.been.called;
      expect(archive.finish).to.have.been.calledOnce;
    });
  });

  describe('when an unexpected error occurs while getting a session certificates', function () {
    it('should throw the error without finishing the archive', async function () {
      // given
      const unexpectedError = new Error('PDF generation failed');
      const getCertificatesForSessionStub = sinon.stub().rejects(unexpectedError);

      // when
      const error = await catchErr(getSelectedSessionsCertificates)({
        archive,
        sessionIds: [11, 55],
        i18n: Symbol('i18n'),
        isFrenchDomainExtension: true,
        dependencies: {
          getCertificatesForSession: getCertificatesForSessionStub,
        },
      });

      // then
      expect(error).to.equal(unexpectedError);
      expect(archive.finish).to.not.have.been.called;
    });
  });

  describe('when the archive is destroyed during the generation', function () {
    it('should stop generating the remaining sessions certificates', async function () {
      // given
      archive.entry.callsFake((content, data, callback) => {
        archive.destroyed = true;
        callback();
      });
      const getCertificatesForSessionStub = sinon.stub().resolves({ filename: 'session.pdf', content: Symbol('pdf') });

      // when
      await getSelectedSessionsCertificates({
        archive,
        sessionIds: [11, 55],
        i18n: Symbol('i18n'),
        isFrenchDomainExtension: true,
        dependencies: {
          getCertificatesForSession: getCertificatesForSessionStub,
        },
      });

      // then
      expect(getCertificatesForSessionStub).to.have.been.calledOnce;
      expect(archive.finish).to.not.have.been.called;
    });
  });
});
