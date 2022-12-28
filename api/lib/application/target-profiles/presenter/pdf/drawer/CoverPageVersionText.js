const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');
dayjs.extend(localizedFormat);
const Text = require('./Text');
const ColorManager = require('../manager/color-manager');
const FontManager = require('../manager/font-manager');
const PositionManager = require('../manager/position-manager');

const textByLang = {
  en: 'Version {date}',
  fr: 'Version du {date}',
};

module.exports = class CoverPageVersionText extends Text {
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
};
