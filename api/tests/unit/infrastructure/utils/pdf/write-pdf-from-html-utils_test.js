const { expect, sinon } = require('../../../../test-helper');
const puppeteer = require('puppeteer');
const {
  getPdfBufferFromHtml,
  getHtmlContentFromTemplate,
} = require('../../../../../lib/infrastructure/utils/pdf/write-pdf-from-html-utils');

describe('Unit | Infrastructure | Utils | PDF | write-pdf-from-html-utils', () => {

  const GET_TEMPLATE_FILE_PATH = `${__dirname}/files`;

  describe('getHtmlContentFromTemplate', async () => {
    it('should interpolate the template file with given data', async () => {
      // given
      const templateFile = 'template.hbs';
      const data = {
        hello: 'bonjour',
      };

      // when
      const htmlAttestation = await getHtmlContentFromTemplate(GET_TEMPLATE_FILE_PATH, templateFile, data);

      // then
      expect(htmlAttestation).to.equal('<html>\n  bonjour\n</html>\n');
    });
  });

  describe('writePdfFromHtml', () => {

    it('should return the pdf file as a buffer', async () => {
      // given
      const templateFile = 'template.hbs';

      const expectedBuffer = 'buffer';
      const close = sinon.stub();
      const pdf = sinon.stub().resolves(expectedBuffer);
      const content = Symbol('content');
      const setContent = sinon.stub();
      const getHtmlContent = sinon.stub().resolves(content);
      const newPage = sinon.stub().resolves({
        setContent,
        pdf,
      });
      sinon.stub(puppeteer, 'launch').resolves({ newPage, close });

      // when
      const buffer = await getPdfBufferFromHtml({
        templatePath: GET_TEMPLATE_FILE_PATH,
        templateFileName: templateFile,
        templateData: { hello: 'bonjour' },
        getHtmlContent,
      });

      expect(setContent).to.have.been.calledWithExactly(content);
      expect(pdf).to.have.been.calledWithExactly({
        format: 'A4',
        printBackground: true,
      });
      expect(buffer).to.equal(expectedBuffer);
      expect(close).to.have.been.calledOnce;
    });

  });

});
