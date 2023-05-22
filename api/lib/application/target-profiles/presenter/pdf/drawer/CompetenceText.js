import { Text } from './Text.js';
import * as ColorManager from '../manager/color-manager.js';
import { FontManager } from '../manager/font-manager.js';
import { PositionManager } from '../manager/position-manager.js';

class CompetenceText extends Text {
  constructor({ text, positionY, areaColor }) {
    super({
      text,
      positionX: PositionManager.competenceHorizontalStart,
      positionY,
      fontSize: FontManager.competenceHeight,
      font: FontManager.competenceFont,
      fontColor: ColorManager.findLighterShadeRGBColor(areaColor),
    });
  }
}

export { CompetenceText };
