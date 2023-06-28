import lodash from 'lodash';

const { sortBy } = lodash;

import * as competenceBuilder from './competence-builder.js';
import { AreaText } from '../drawer/AreaText.js';
import { LegalMentionText } from '../drawer/LegalMentionText.js';

const MARGIN_TOP_WITHOUT_AREA = 15;
const MARGIN_BOTTOM_LIMIT = 5;

const build = function (pdfDocument, area, frameworkName, language) {
  const page = _addPage(pdfDocument, language);
  const areaTitle = frameworkName + ' : ' + area.title;
  let pageContext = {
    page,
    positionY: _drawAreaTitle(page, areaTitle, area.color),
  };
  for (const competence of sortBy(area.competences, 'index')) {
    pageContext = _nextPage(pageContext.page, pageContext.positionY, competence, area.color, language);
    pageContext.positionY = competenceBuilder.build(pageContext.positionY, pageContext.page, competence, area.color);
  }
};

export { build };

/**
 * @param page{PDFPage}
 * @param positionY{number}
 * @param competence{Competence}
 * @param areaColor{string}
 * @param language{string}
 * @return {{positionY: number, page: PDFPage}}
 *  - current page if it's possible or create another one
 *  - next position y
 * @private
 */
function _nextPage(page, positionY, competence, areaColor, language) {
  const currentYAfterDryRun = competenceBuilder.build(positionY, page, competence, areaColor, true);
  if (currentYAfterDryRun - MARGIN_BOTTOM_LIMIT < 0) {
    const newPage = _addPage(page.doc, language);
    return {
      page: newPage,
      positionY: newPage.getSize().height - MARGIN_TOP_WITHOUT_AREA,
    };
  }
  return { page, positionY };
}

/**
 * @param page{PDFPage}
 * @param areaTitle{string}
 * @param areaColor{string}
 * @return {number}
 */
function _drawAreaTitle(page, areaTitle, areaColor) {
  const areaText = new AreaText({
    text: areaTitle,
    areaColor,
    page,
  });
  return areaText.drawAlignCenter(page);
}

/**
 * @param pdfDocument{PDFDocument}
 * @param language{string}
 * @return {PDFPage}
 */
function _addPage(pdfDocument, language) {
  const page = pdfDocument.addPage();
  const legalMentionText = new LegalMentionText({ language });
  legalMentionText.draw(page);
  return page;
}
