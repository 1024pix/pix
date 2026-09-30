import lodash from 'lodash';

const { sortBy } = lodash;

import { CompetenceText } from '../drawer/CompetenceText.js';
import * as ColorManager from '../manager/color-manager.js';
import { FontManager } from '../manager/font-manager.js';
import { PositionManager } from '../manager/position-manager.js';
import * as thematicBuilder from './thematic-builder.js';

const build = function (positionY, page, competence, areaColor, dryRun = false) {
  const competencePositionY = positionY - FontManager.competenceFontHeight;
  const competenceText = new CompetenceText({
    text: competence.fullName,
    areaColor,
    positionY: competencePositionY,
  });
  if (!dryRun) {
    _drawCompetenceBackground(competencePositionY, page, competenceText);
  }
  const firstThematicPositionY = competenceText.draw(page, dryRun);

  return sortBy(competence.thematics, 'index').reduce(
    (thematicPositionY, thematic) =>
      thematicBuilder.build(thematicPositionY, page, thematic, dryRun) - FontManager.thematicFontHeight / 2,
    firstThematicPositionY,
  );
};

export { build };
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
