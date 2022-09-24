const tubeBuilder = require('./tube-builder');
const ThematicText = require('../drawer/ThematicText.js');
const PositionManager = require('../manager/position-manager');
const ColorManager = require('../manager/color-manager');
const FontManager = require('../manager/font-manager');

const START_BORDER = 2;

module.exports = {
  /**
   * @param positionY{number}
   * @param page {PDFPage}
   * @param thematic {Thematic}
   * @param dryRun {boolean}
   * @returns {number}  next y position
   */
  build(positionY, page, thematic, dryRun) {
    let positionYAfterTubes = positionY;
    let pair = false;
    for (const tube of thematic.tubes) {
      const positionBeforeTube = positionYAfterTubes;
      if (!dryRun && pair) {
        positionYAfterTubes = tubeBuilder.build(positionBeforeTube, page, tube, true);
        page.drawRectangle({
          x: PositionManager.tubeFirstPartStart - START_BORDER,
          y: positionYAfterTubes + FontManager.tubeFontHeight,
          width: PositionManager.tubeWidth + START_BORDER,
          height: positionBeforeTube - positionYAfterTubes,
          color: ColorManager.tubeBackground,
          opacity: 0.5,
          borderWidth: 0,
        });
      }
      positionYAfterTubes = tubeBuilder.build(positionBeforeTube, page, tube, dryRun);
      pair = !pair;
    }
    const thematicText = new ThematicText({ text: thematic.name, positionY, positionYAfterTubes });
    const nextYThematic = thematicText.draw(page, dryRun);

    return Math.min(positionYAfterTubes, nextYThematic);
  },
};
