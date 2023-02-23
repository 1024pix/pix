const pdfLibFontKit = require('@pdf-lib/fontkit');
require('dayjs/locale/fr');
const FontManager = require('./manager/font-manager.js');
const TemplatePageManager = require('./manager/template-page-manager.js');
const learningContentBuilder = require('./builder/learning-content-builder.js');
const coverPageBuilder = require('./builder/cover-page-builder.js');
const { PDFDocument } = require('pdf-lib');

module.exports = {
  /**
   * @param learningContent{LearningContent}
   * @param title{string}
   * @param language{string}
   * @return {Promise<Buffer>}
   */
  async present(learningContent, title, language) {
    const pdfDocument = await _initializeNewPDFDocument(pdfLibFontKit);
    coverPageBuilder.build(pdfDocument, title, language);
    const pdfBytes = await learningContentBuilder.build(pdfDocument, learningContent, language).save();
    return Buffer.from(pdfBytes);
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
