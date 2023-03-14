import * as TemplatePageManager from '../manager/template-page-manager.js';
import { CoverPageVersionText } from '../drawer/CoverPageVersionText.js';
import { CoverPageLegaLMentionText } from '../drawer/CoverPageLegalMentionText.js';
import { CoverPageTitleText } from '../drawer/CoverPageTitleText.js';
import { PositionManager } from '../manager/position-manager.js';

const build = function (pdfDocument, title, language) {
  const page = pdfDocument.addPage();
  PositionManager.initialize(page);
  page.drawPage(TemplatePageManager.getCoverPage());
  const coverPageTitleText = new CoverPageTitleText({
    title,
    page,
  });
  const coverPageVersionText = new CoverPageVersionText({ language, page });
  const coverPageLegalMentionText = new CoverPageLegaLMentionText({ language });
  coverPageTitleText.drawAlignCenter(page);
  coverPageVersionText.draw(page);
  coverPageLegalMentionText.draw(page);
};

export { build };
