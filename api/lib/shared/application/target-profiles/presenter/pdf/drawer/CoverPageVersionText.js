import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
dayjs.extend(localizedFormat);
import { Text } from './Text.js';
import * as ColorManager from '../manager/color-manager.js';
import { FontManager } from '../manager/font-manager.js';
import { PositionManager } from '../manager/position-manager.js';

const textByLang = {
  en: 'Version {date}',
  fr: 'Version du {date}',
};

class CoverPageVersionText extends Text {
  constructor({ language, page }) {
    let text = textByLang[language];
    const todayDateString = dayjs().locale(language).format('LL');
    text = text.replace('{date}', todayDateString);
    const font = FontManager.coverPageVersionFont;
    const fontSize = FontManager.coverPageVersionHeight;
    const positionX = Text._positionXForHorizontalCentering(text, page, font, fontSize);
    super({
      text,
      positionX,
      positionY: PositionManager.coverPageVersionVerticalStart,
      fontSize,
      font,
      fontColor: ColorManager.coverPageVersionColor,
    });
  }
}

export { CoverPageVersionText };
