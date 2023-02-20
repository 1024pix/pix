import sortBy from 'lodash/sortBy';
import tubeBuilder from './tube-builder';
import ThematicText from '../drawer/ThematicText.js';
import PositionManager from '../manager/position-manager';
import FontManager from '../manager/font-manager';
import ColorManager from '../manager/color-manager';

export default {
  /**
   * @param positionY{number}
   * @param page {PDFPage}
   * @param thematic {Thematic}
   * @param dryRun {boolean}
   * @returns {number}  next y position
   */
  build(positionY, page, thematic, dryRun) {
    if (!dryRun) {
      this._drawThematicBackground(positionY, page, thematic);
    }
    return this._drawContent(positionY, page, thematic, dryRun);
  },
  /**
   * @param positionY{number}
   * @param page {PDFPage}
   * @param thematic {Thematic}
   * @param dryRun {boolean}
   * @returns {number}  next y position
   * @private
   */
  _drawContent(positionY, page, thematic, dryRun) {
    let positionYAfterTubes = positionY;
    let pair = false;
    for (const tube of sortBy(thematic.tubes, 'practicalTitle')) {
      positionYAfterTubes = tubeBuilder.build(positionYAfterTubes, page, tube, pair, dryRun);
      pair = !pair;
    }
    const thematicText = new ThematicText({ text: thematic.name, positionY, positionYAfterTubes });
    const nextYThematic = thematicText.draw(page, dryRun);

    return Math.min(positionYAfterTubes, nextYThematic);
  },
  /**
   * @param positionY{number}
   * @param page {PDFPage}
   * @param thematic {Thematic}
   * @returns {number}  next y position
   * @private
   */
  _drawThematicBackground(positionY, page, thematic) {
    const nextPositionY = this._drawContent(positionY, page, thematic, true);
    page.drawRectangle({
      x: PositionManager.margin,
      y: nextPositionY + FontManager.thematicFontHeight,
      width: PositionManager.widthMaxWithoutMargin,
      height: positionY - nextPositionY,
      color: ColorManager.thematicBackground,
      opacity: 0.5,
      borderWidth: 0,
    });
  },
};
