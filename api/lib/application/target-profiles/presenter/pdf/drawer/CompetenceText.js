import Text from './Text';
import ColorManager from '../manager/color-manager';
import FontManager from '../manager/font-manager';
import PositionManager from '../manager/position-manager';

export default class CompetenceText extends Text {
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
