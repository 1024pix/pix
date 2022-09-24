const TemplatePageManager = require('../manager/template-page-manager');
const CoverPageVersionText = require('../drawer/CoverPageVersionText');
const CoverPageLegalMentionText = require('../drawer/CoverPageLegalMentionText');
const PositionManager = require('../manager/position-manager');

module.exports = {
  /**
   * @param pdfDocument{PDFDocument}
   * @param todayDateString {string}
   */
  build(pdfDocument, todayDateString) {
    let page = pdfDocument.addPage();
    PositionManager.initialize(page);
    page.drawPage(TemplatePageManager.getCoverPage());
    const coverPageVersionText = new CoverPageVersionText({
      dateString: todayDateString,
      page,
    });
    const coverPageLegalMentionText = new CoverPageLegalMentionText();
    coverPageVersionText.draw(page);
    coverPageLegalMentionText.draw(page);
    return;
  },
};
