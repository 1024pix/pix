import pdfLibFontKit from '@pdf-lib/fontkit';
import 'dayjs/locale/fr.js';
import { FontManager } from './manager/font-manager.js';
import * as TemplatePageManager from './manager/template-page-manager.js';
import * as learningContentBuilder from './builder/learning-content-builder.js';
import * as coverPageBuilder from './builder/cover-page-builder.js';
import { PDFDocument } from 'pdf-lib';

const present = async function (learningContent, title, language) {
  const pdfDocument = await _initializeNewPDFDocument(pdfLibFontKit);
  coverPageBuilder.build(pdfDocument, title, language);
  const pdfBytes = await learningContentBuilder.build(pdfDocument, learningContent, language).save();
  return Buffer.from(pdfBytes);
};

export { present };

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
