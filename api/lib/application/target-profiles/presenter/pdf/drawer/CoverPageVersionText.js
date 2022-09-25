const dayjs = require('dayjs');
const Text = require('./Text');
const ColorManager = require('../manager/color-manager');
const FontManager = require('../manager/font-manager');

const COVER_PAGE_VERSION_TEXT_Y_POSITION = 120;

const textByLang = {
  en: 'Version {date}',
  fr: 'Version du {date}',
};

module.exports = class CoverPageVersionText extends Text {
  constructor({ language, page }) {
    let text = textByLang[language];
    const todayDateString = dayjs().locale(language).format('DD MMMM YYYY');
    text = text.replace('{date}', todayDateString);
    const font = FontManager.coverPageVersionFont;
    const fontSize = FontManager.coverPageVersionHeight;
    const positionX = Text._positionXForHorizontalCentering(text, page, font, fontSize);
    super({
      text,
      positionX,
      positionY: COVER_PAGE_VERSION_TEXT_Y_POSITION,
      fontSize,
      font,
      fontColor: ColorManager.coverPageVersionColor,
    });
  }
};
