import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);
import Text from './Text';
import ColorManager from '../manager/color-manager';
import FontManager from '../manager/font-manager';
import PositionManager from '../manager/position-manager';

const textByLang = {
  en: 'Version {date}',
  fr: 'Version du {date}',
};

export default class CoverPageVersionText extends Text {
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
