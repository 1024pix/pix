const sortBy = require('lodash/sortBy');
const thematicBuilder = require('./thematic-builder');
const CompetenceText = require('../drawer/CompetenceText');
const PositionManager = require('../manager/position-manager');
const ColorManager = require('../manager/color-manager');
const FontManager = require('../manager/font-manager');
const LINE_JUMP = 5;
module.exports = {
  /**
   * @param positionY{number}
   * @param page {PDFPage}
   * @param competence {Competence}
   * @param areaColor {string}
   * @param dryRun {boolean}
   * @returns {number}  next y position
   */
  build(positionY, page, competence, areaColor, dryRun) {
    const competenceText = new CompetenceText({ text: competence.fullName, areaColor, positionY: positionY });
    if (!dryRun) {
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
      positionY = competenceText.draw(page, false);
    } else {
      positionY = competenceText.draw(page, true);
    }
    positionY = positionY - LINE_JUMP;
    for (const thematic of sortBy(competence.thematics, 'index')) {
      if (!dryRun) {
        const nextPositionY = thematicBuilder.build(positionY, page, thematic, true);
        page.drawRectangle({
          x: PositionManager.margin,
          y: nextPositionY + FontManager.thematicFontHeight / 2,
          width: PositionManager.widthMaxWithoutMargin,
          height: positionY - nextPositionY + FontManager.thematicFontHeight,
          color: ColorManager.thematicBackground,
          opacity: 0.5,
          borderWidth: 0,
        });
      }

      positionY = thematicBuilder.build(positionY, page, thematic, dryRun);
      positionY = positionY - LINE_JUMP - FontManager.thematicFontHeight;
    }
    return positionY;
  },
};
