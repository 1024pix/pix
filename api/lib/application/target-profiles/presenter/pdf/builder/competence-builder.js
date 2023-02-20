import sortBy from 'lodash/sortBy';
import thematicBuilder from './thematic-builder';
import CompetenceText from '../drawer/CompetenceText';
import PositionManager from '../manager/position-manager';
import ColorManager from '../manager/color-manager';
import FontManager from '../manager/font-manager';

export default {
  /**
   * @param positionY{number}
   * @param page {PDFPage}
   * @param competence {Competence}
   * @param areaColor {string}
   * @param dryRun {boolean}
   * @returns {number}  next y position
   */
  build(positionY, page, competence, areaColor, dryRun = false) {
    positionY = positionY - FontManager.competenceFontHeight;
    const competenceText = new CompetenceText({
      text: competence.fullName,
      areaColor,
      positionY: positionY,
    });
    if (!dryRun) {
      _drawCompetenceBackground(positionY, page, competenceText);
    }
    positionY = competenceText.draw(page, dryRun);

    for (const thematic of sortBy(competence.thematics, 'index')) {
      positionY = thematicBuilder.build(positionY, page, thematic, dryRun);
      positionY = positionY - FontManager.thematicFontHeight / 2;
    }
    return positionY;
  },
};

/**
 * @param positionY{number}
 * @param page {PDFPage}
 * @param competenceText {CompetenceText}
 * @private
 */
function _drawCompetenceBackground(positionY, page, competenceText) {
  const nextPositionY = competenceText.draw(page, true);
  page.drawRectangle({
    x: PositionManager.margin,
    y: nextPositionY + FontManager.competenceFontHeight,
    width: PositionManager.widthMaxWithoutMargin,
    height: positionY - nextPositionY,
    color: ColorManager.competenceBackground,
    opacity: 0.5,
    borderWidth: 0,
  });
}
