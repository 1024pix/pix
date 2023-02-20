import TemplatePageManager from '../manager/template-page-manager';
import CoverPageVersionText from '../drawer/CoverPageVersionText';
import CoverPageLegalMentionText from '../drawer/CoverPageLegalMentionText';
import CoverPageTitleText from '../drawer/CoverPageTitleText';
import PositionManager from '../manager/position-manager';

export default {
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
