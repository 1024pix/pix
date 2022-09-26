const sortBy = require('lodash/sortBy');
const competenceBuilder = require('./competence-builder');
const AreaText = require('../drawer/AreaText');
const LegalMentionText = require('../drawer/LegalMentionText');

const MARGIN_TOP_WITHOUT_AREA = 30;

module.exports = {
  /**
   * @param pdfDocument{PDFDocument}
   * @param area{Area}
   * @param language{string}
   */
  build(pdfDocument, area, language) {
    let page = _addPage(pdfDocument, language);
    let positionY = _drawAreaTitle(page, area.title, area.color);
    for (const competence of sortBy(area.competences, 'index')) {
      let currentYAfterDryRun = positionY;
      currentYAfterDryRun = competenceBuilder.build(currentYAfterDryRun, page, competence, area.color, true);
      if (currentYAfterDryRun < 0) {
        page = _addPage(pdfDocument, language);
        positionY = page.getSize().height - MARGIN_TOP_WITHOUT_AREA;
      }
      positionY = competenceBuilder.build(positionY, page, competence, area.color, false);
    }
  },
};

function _drawAreaTitle(page, areaTitle, areaColor) {
  const areaText = new AreaText({
    text: areaTitle,
    areaColor,
    page,
  });
  return areaText.draw(page);
}

function _addPage(pdfDocument, language) {
  const page = pdfDocument.addPage();
  const legalMentionText = new LegalMentionText({ language });
  legalMentionText.draw(page);
  return page;
}
