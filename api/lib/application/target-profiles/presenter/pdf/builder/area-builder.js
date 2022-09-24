const competenceBuilder = require('./competence-builder');
const AreaText = require('../drawer/AreaText');

const MARGIN_TOP_WITHOUT_AREA = 30;

module.exports = {
  /**
   * @param pdfDocument{PDFDocument}
   * @param area{Area}
   */
  build(pdfDocument, area) {
    let page = pdfDocument.addPage();
    let positionY = _drawAreaTitle(page, area.title, area.color);
    for (const competence of area.competences) {
      let currentYAfterDryRun = positionY;
      currentYAfterDryRun = competenceBuilder.build(currentYAfterDryRun, page, competence, area.color, true);
      if (currentYAfterDryRun < 0) {
        page = pdfDocument.addPage();
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
