import lodash from 'lodash';

const { sortBy } = lodash;

import * as tubeBuilder from './tube-builder.js';
import { ThematicText } from '../drawer/ThematicText.js';
import { PositionManager } from '../manager/position-manager.js';
import { FontManager } from '../manager/font-manager.js';
import * as ColorManager from '../manager/color-manager.js';

const build = function (positionY, page, thematic, dryRun) {
  if (!dryRun) {
    this._drawThematicBackground(positionY, page, thematic);
  }
  return this._drawContent(positionY, page, thematic, dryRun);
};

const _drawContent = function (positionY, page, thematic, dryRun) {
  let positionYAfterTubes = positionY;
  let pair = false;
  for (const tube of sortBy(thematic.tubes, 'practicalTitle')) {
    positionYAfterTubes = tubeBuilder.build(positionYAfterTubes, page, tube, pair, dryRun);
    pair = !pair;
  }
  const thematicText = new ThematicText({ text: thematic.name, positionY, positionYAfterTubes });
  const nextYThematic = thematicText.draw(page, dryRun);

  return Math.min(positionYAfterTubes, nextYThematic);
};

const _drawThematicBackground = function (positionY, page, thematic) {
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
};

export { build, _drawContent, _drawThematicBackground };
