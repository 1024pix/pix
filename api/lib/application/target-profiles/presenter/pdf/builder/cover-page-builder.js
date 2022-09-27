const TemplatePageManager = require('../manager/template-page-manager');
const CoverPageVersionText = require('../drawer/CoverPageVersionText');
const CoverPageLegalMentionText = require('../drawer/CoverPageLegalMentionText');
const CoverPageTitleText = require('../drawer/CoverPageTitleText');
const PositionManager = require('../manager/position-manager');

module.exports = {
  /**
   * @param pdfDocument{PDFDocument}
   * @param title {string}
   * @param language {string}
   */
  build(pdfDocument, title, language) {
    const page = pdfDocument.addPage();
    PositionManager.initialize(page);
    page.drawPage(TemplatePageManager.getCoverPage());
    const coverPageTitleText = new CoverPageTitleText({
      title,
      page,
    });
    const coverPageVersionText = new CoverPageVersionText({ language, page });
    const coverPageLegalMentionText = new CoverPageLegalMentionText({ language });
    coverPageVersionText.draw(page);
    coverPageLegalMentionText.draw(page);
    coverPageTitleText.drawAlignCenter(page);
  },
};
