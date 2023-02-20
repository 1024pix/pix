import TubeText from '../drawer/TubeText';
import PositionManager from '../manager/position-manager';
import FontManager from '../manager/font-manager';
import ColorManager from '../manager/color-manager';

const START_BORDER = 2;

export default {
  /**
   *
   * @param positionY{number}
   * @param page {PDFPage}
   * @param tube {Tube}
   * @param dryRun {boolean}
   * @param withBackground {boolean}
   * @returns {number}  next y position
   */
  build(positionY, page, tube, withBackground, dryRun) {
    const tubeText = new TubeText({
      practicalTitle: tube.practicalTitle,
      practicalDescription: tube.practicalDescription,
      positionY,
    });
    if (!dryRun && withBackground) {
      _drawTubeBackground(positionY, page, tubeText);
    }

    return tubeText.draw(page, dryRun);
  },
};

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
