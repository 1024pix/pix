import { TubeText } from '../drawer/TubeText.js';
import { PositionManager } from '../manager/position-manager.js';
import { FontManager } from '../manager/font-manager.js';
import * as ColorManager from '../manager/color-manager.js';

const START_BORDER = 2;

const build = function (positionY, page, tube, withBackground, dryRun) {
  const tubeText = new TubeText({
    practicalTitle: tube.practicalTitle,
    practicalDescription: tube.practicalDescription,
    positionY,
  });
  if (!dryRun && withBackground) {
    _drawTubeBackground(positionY, page, tubeText);
  }

  return tubeText.draw(page, dryRun);
};

export { build };
/**
 *
 * @param positionY{number}
 * @param page {PDFPage}
 * @param tubeText {TubeText}
 * @private
 */
function _drawTubeBackground(positionY, page, tubeText) {
  const positionYAfterTubes = tubeText.draw(page, true);
  page.drawRectangle({
    x: PositionManager.tubeFirstPartStart - START_BORDER,
    y: positionYAfterTubes + Math.max(FontManager.tubeTitleFontHeight, FontManager.tubeDescriptionFontHeight),
    width: PositionManager.tubeWidth + START_BORDER,
    height: positionY - positionYAfterTubes,
    color: ColorManager.tubeBackground,
    opacity: 0.5,
    borderWidth: 0,
  });
}
