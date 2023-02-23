const TemplatePageManager = require('../manager/template-page-manager.js');
const CoverPageVersionText = require('../drawer/CoverPageVersionText.js');
const CoverPageLegalMentionText = require('../drawer/CoverPageLegalMentionText.js');
const CoverPageTitleText = require('../drawer/CoverPageTitleText.js');
const PositionManager = require('../manager/position-manager.js');

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
    coverPageTitleText.drawAlignCenter(page);
    coverPageVersionText.draw(page);
    coverPageLegalMentionText.draw(page);
  },
};
