const COVER_PAGE_TITLE_WIDTH = 400;
const COMPETENCE_START = 20;
const THEMATIC_START = 20;
const THEMATIC_WIDTH = 120;
const TUBES_FIRST_PART_WIDTH = 150;
const DEFAULT_SPACE = 5;
const BORDER = 10;

module.exports = {
  maxWidth: null,
  /**
   * @param page{PDFPage}
   * @returns {void}
   */
  initialize(page) {
    if (this.maxWidth) return;
    this.maxWidth = page.getWidth();
  },
  get coverPageTitleWidth() {
    return COVER_PAGE_TITLE_WIDTH;
  },
  get widthMaxWithoutMargin() {
    return this.maxWidth - this.margin * 2;
  },
  get competenceStart() {
    return BORDER + COMPETENCE_START;
  },
  get thematicStart() {
    return BORDER + THEMATIC_START;
  },
  get thematicWidth() {
    return THEMATIC_WIDTH;
  },
  get tubeFirstPartStart() {
    return this.thematicStart + this.thematicWidth + DEFAULT_SPACE;
  },
  get tubeFirstPartWidth() {
    return TUBES_FIRST_PART_WIDTH;
  },
  get tubeSecondPartStart() {
    return this.tubeFirstPartStart + this.tubeFirstPartWidth + DEFAULT_SPACE;
  },
  get tubeWidth() {
    return this.tubeFirstPartWidth + DEFAULT_SPACE + this.tubeSecondPartWidth;
  },
  get margin() {
    return BORDER;
  },
  get tubeSecondPartWidth() {
    return this.maxWidth - this.tubeSecondPartStart - this.margin;
  },
};
