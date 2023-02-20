import pdfLibFontKit from '@pdf-lib/fontkit';
import 'dayjs/locale/fr';
import FontManager from './manager/font-manager';
import TemplatePageManager from './manager/template-page-manager';
import learningContentBuilder from './builder/learning-content-builder';
import coverPageBuilder from './builder/cover-page-builder';
import { PDFDocument } from 'pdf-lib';

export default {
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
