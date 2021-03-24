const { expect, sinon } = require('../../../test-helper');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;

const { getPdfBuffer } = require('../../../../lib/infrastructure/utils/pdf/write-pdf-utils');

describe('Unit | Utils | write-pdf-utils', function() {

  describe('#getPdfBuffer', function() {

    it('should return a Buffer', async function() {
      // given
      const pdfUnit8arrayTemplateBuffer = new Uint8Array(8);
      const templatePath = 'path';
      const templateFileName = 'fileName';
      const page = Symbol('page');
      const donorPdfDoc = Symbol('pdfDoc');
      const donorPdfBytes = Symbol('donorPdfBytes');
      const addPage = sinon.stub();

      PDFDocument.create = sinon.stub().resolves({
        copyPages: sinon.stub().withArgs(pdfUnit8arrayTemplateBuffer).resolves([page]),
        addPage,
        save: sinon.stub().resolves(pdfUnit8arrayTemplateBuffer),
        registerFontkit: sinon.stub(),
      });

      sinon.stub(fs, 'readFile').withArgs(`${templatePath}/${templateFileName}`).resolves(donorPdfBytes);

      PDFDocument.load = sinon.stub().withArgs(donorPdfBytes).resolves(donorPdfDoc);

      // when
      const returnedPdfBuffer = await getPdfBuffer({
        templatePath,
        templateFileName,
        applyDynamicInformationsInPDF: () => {},
        data: {},
      });

      // then
      expect(returnedPdfBuffer).to.be.instanceOf(Buffer);
      expect(returnedPdfBuffer).to.deep.equal(Buffer.from(pdfUnit8arrayTemplateBuffer));
    });
  });
});
