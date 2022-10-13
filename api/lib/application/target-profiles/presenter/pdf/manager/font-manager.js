const { readFile } = require('fs/promises');

const embeddedFonts = {};
const COVER_PAGE_VERSION_TEXT_FONT_SIZE = 20;
const COVER_PAGE_LEGAL_MENTION_TEXT_FONT_SIZE = 10;
const COVER_PAGE_TITLE_TEXT_FONT_SIZE = 30;
const LEGAL_MENTION_TEXT_FONT_SIZE = 5;
const AREA_NAME_FONT_SIZE = 20;
const COMPETENCE_TEXT_FONT_SIZE = 12;
const TUBE_TEXT_FONT_SIZE = 7;
const THEMATIC_TEXT_FONT_SIZE = 7;

const fonts = {
  robotoCondensedBold: 'RobotoCondensed-Bold.ttf',
  robotoCondensedLight: 'RobotoCondensed-Light.ttf',
  robotoCondensedRegular: 'RobotoCondensed-Regular.ttf',
  robotoRegular: 'Roboto-Regular.ttf',
};

module.exports = {
  key: {
    robotoCondensedBold: 'robotoCondensedBold',
    robotoCondensedLight: 'robotoCondensedLight',
    robotoCondensedRegular: 'robotoCondensedRegular',
    robotoRegular: 'robotoRegular',
  },
  /**
   * @param fontKey {string}
   * @returns {PDFFont}
   */
  findFontByFontKey(fontKey) {
    if (!embeddedFonts[fontKey]) {
      return embeddedFonts[this.key.robotoCondensedRegular];
    }
    return embeddedFonts[fontKey];
  },
  /**
   * @returns {PDFFont}
   */
  get legalMentionFont() {
    return this.findFontByFontKey(this.key.robotoCondensedBold);
  },
  /**
   * @returns {number}
   */
  get legalMentionFontHeight() {
    return this.legalMentionFont.heightAtSize(this.legalMentionHeight);
  },
  /**
   * @returns {number}
   */
  get legalMentionHeight() {
    return LEGAL_MENTION_TEXT_FONT_SIZE;
  },
  /**
   * @returns {PDFFont}
   */
  get areaFont() {
    return this.findFontByFontKey(this.key.robotoCondensedBold);
  },
  /**
   * @returns {number}
   */
  get areaFontHeight() {
    return this.areaFont.heightAtSize(this.areaHeight);
  },
  /**
   * @returns {number}
   */
  get areaHeight() {
    return AREA_NAME_FONT_SIZE;
  },
  /**
   * @returns {PDFFont}
   */
  get coverPageLegalMentionFont() {
    return this.findFontByFontKey(this.key.robotoCondensedBold);
  },
  /**
   * @returns {number}
   */
  get coverPageLegalMentionFontHeight() {
    return this.coverPageLegalMentionFont.heightAtSize(this.coverPageLegalMentionHeight);
  },
  /**
   * @returns {number}
   */
  get coverPageLegalMentionHeight() {
    return COVER_PAGE_LEGAL_MENTION_TEXT_FONT_SIZE;
  },
  /**
   * @returns {PDFFont}
   */
  get coverPageTitleFont() {
    return this.findFontByFontKey(this.key.robotoCondensedBold);
  },
  /**
   * @returns {number}
   */
  get coverPageTitleFontHeight() {
    return this.coverPageTitleFont.heightAtSize(this.coverPageTitleHeight);
  },
  /**
   * @returns {number}
   */
  get coverPageTitleHeight() {
    return COVER_PAGE_TITLE_TEXT_FONT_SIZE;
  },
  /**
   * @returns {PDFFont}
   */
  get coverPageVersionFont() {
    return this.findFontByFontKey(this.key.robotoCondensedBold);
  },
  /**
   * @returns {number}
   */
  get coverPageVersionFontHeight() {
    return this.coverPageVersionFont.heightAtSize(this.coverPageVersionHeight);
  },
  /**
   * @returns {number}
   */
  get coverPageVersionHeight() {
    return COVER_PAGE_VERSION_TEXT_FONT_SIZE;
  },
  /**
   * @returns {PDFFont}
   */
  get competenceFont() {
    return this.findFontByFontKey(this.key.robotoCondensedBold);
  },
  /**
   * @returns {number}
   */
  get competenceFontHeight() {
    return this.competenceFont.heightAtSize(this.competenceHeight);
  },
  /**
   * @returns {number}
   */
  get competenceHeight() {
    return COMPETENCE_TEXT_FONT_SIZE;
  },
  /**
   * @returns {PDFFont}
   */
  get thematicFont() {
    return this.findFontByFontKey(this.key.robotoCondensedBold);
  },
  /**
   * @returns {number}
   */
  get thematicFontHeight() {
    return this.thematicFont.heightAtSize(this.thematicHeight);
  },
  /**
   * @returns {number}
   */
  get thematicHeight() {
    return THEMATIC_TEXT_FONT_SIZE;
  },
  /**
   * @returns {PDFFont}
   */
  get tubeFont() {
    return this.findFontByFontKey(this.key.robotoRegular);
  },
  /**
   * @returns {number}
   */
  get tubeFontHeight() {
    return this.tubeFont.heightAtSize(this.tubeHeight);
  },
  /**
   * @returns {number}
   */
  get tubeHeight() {
    return TUBE_TEXT_FONT_SIZE;
  },
  /**
   * @param pdfDocument {PDFDocument}
   * @param dirname {string}
   * @returns {Promise<void>}
   */
  async initializeFonts(pdfDocument) {
    for (const fontKey in fonts) {
      const fontFilename = fonts[fontKey];
      const fontFile = await readFile(`${__dirname}/fonts/${fontFilename}`);
      embeddedFonts[fontKey] = await pdfDocument.embedFont(fontFile, { subset: true, customName: fontFilename });
    }
  },
};
