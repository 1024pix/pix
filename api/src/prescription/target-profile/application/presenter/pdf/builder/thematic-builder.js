import lodash from 'lodash';

const { sortBy } = lodash;

import { ThematicText } from '../drawer/ThematicText.js';
import * as ColorManager from '../manager/color-manager.js';
import { FontManager } from '../manager/font-manager.js';
import { PositionManager } from '../manager/position-manager.js';
import * as tubeBuilder from './tube-builder.js';

export function build(positionY, page, thematic, dryRun) {
  if (!dryRun) {
    _drawThematicBackground(positionY, page, thematic);
  }
  return _drawContent(positionY, page, thematic, dryRun);
}

function _drawContent(positionY, page, thematic, dryRun) {
  let positionYAfterTubes = positionY;
  let pair = false;
  for (const tube of sortBy(thematic.tubes, 'practicalTitle')) {
    positionYAfterTubes = tubeBuilder.build(positionYAfterTubes, page, tube, pair, dryRun);
    pair = !pair;
  }
  const thematicText = new ThematicText({ text: thematic.name, positionY, positionYAfterTubes });
  const nextYThematic = thematicText.draw(page, dryRun);

  return Math.min(positionYAfterTubes, nextYThematic);
}

function _drawThematicBackground(positionY, page, thematic) {
  const nextPositionY = _drawContent(positionY, page, thematic, true);
  page.drawRectangle({
    x: PositionManager.margin,
    y: nextPositionY + FontManager.thematicFontHeight,
    width: PositionManager.widthMaxWithoutMargin,
    height: positionY - nextPositionY,
    color: ColorManager.thematicBackground,
    opacity: 0.5,
    borderWidth: 0,
  });
}
