const pdfLibFontKit = require('@pdf-lib/fontkit');
const dayjs = require('dayjs');
require('dayjs/locale/fr');
const FontManager = require('./manager/font-manager');
const TemplatePageManager = require('./manager/template-page-manager');
const learningContentBuilder = require('./builder/learning-content-builder');
const coverPageBuilder = require('./builder/cover-page-builder');
const { PDFDocument } = require('pdf-lib');
// m'appeler comme ca
//const { writeFileSync } = require('fs');
//const path = require('path');
//await writeFileSync(path.join(__dirname, `pdf/test.pdf`), await learningContentPDFPresenter.present(learningContent));
module.exports = {
  /**
   * @param learningContent{LearningContent}
   * @return {Promise<Uint8Array>}
   */
  async present(learningContent) {
    const pdfDocument = await _initializeNewPDFDocument(pdfLibFontKit);
    const todayDateString = dayjs().locale('fr').format('DD MMMM YYYY');
    coverPageBuilder.build(pdfDocument, todayDateString);
    return learningContentBuilder.build(pdfDocument, learningContent, todayDateString).save();
  },
};

/**
 * @param fontKit {Fontkit}
 * @returns {Promise<PDFDocument>}
 * @private
 */
async function _initializeNewPDFDocument(fontKit) {
  const pdfDocument = await PDFDocument.create();
  pdfDocument.registerFontkit(fontKit);
  await FontManager.initializeFonts(pdfDocument);
  await TemplatePageManager.initializeTemplatesPages(pdfDocument);
  return pdfDocument;
}
