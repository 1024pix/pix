import { readFile } from 'fs/promises';

const embeddedTemplatePages = {};

const templatesPages = {
  jaffa: 'jaffa.pdf',
  emerald: 'emerald.pdf',
  cerulean: 'cerulean.pdf',
  'wild-strawberry': 'wild-strawberry.pdf',
  'butterfly-bush': 'butterfly-bush.pdf',
  'cover-page': 'cover-page.pdf',
};

export default {
  /**
   * @param areaColor {string}
   * @returns {PDFEmbeddedPage}
   */
  findTemplatePage(areaColor) {
    if (!embeddedTemplatePages[areaColor]) {
      return embeddedTemplatePages['jaffa'];
    }
    return embeddedTemplatePages[areaColor];
  },
  /**
   * @returns {PDFEmbeddedPage}
   */
  getCoverPage() {
    return embeddedTemplatePages['cover-page'];
  },
  /**
   * @param pdfDocument {PDFDocument}
   * @returns {Promise<void>}
   */
  async initializeTemplatesPages(pdfDocument) {
    for (const templateKey in templatesPages) {
      const templateFilename = templatesPages[templateKey];
      const templateBuffer = await readFile(`${__dirname}/templates/${templateFilename}`);
      const [templatePage] = await pdfDocument.embedPdf(templateBuffer);
      embeddedTemplatePages[templateKey] = templatePage;
    }
  },
};
