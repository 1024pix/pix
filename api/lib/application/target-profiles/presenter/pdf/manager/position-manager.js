const BORDER = 10;
const DEFAULT_SPACE = 5;
const COVER_PAGE_TITLE_VERTICAL_START = 400;
const COVER_PAGE_TITLE_WIDTH = 400;
const COVER_PAGE_LEGAL_MENTION_HORIZONTAL_START = 40;
const COVER_PAGE_LEGAL_MENTION_VERTICAL_START = 45;
const COVER_PAGE_LEGAL_MENTION_WIDTH = 540;
const COVER_PAGE_VERSION_VERTICAL_START = 120;
const LEGAL_MENTION_HORIZONTAL_START = 20;
const LEGAL_MENTION_VERTICAL_START = 5;
const COMPETENCE_HORIZONTAL_START = 20;
const THEMATIC_HORIZONTAL_START = 10;
const THEMATIC_WIDTH = 70;
const TUBES_FIRST_PART_WIDTH = 140;

export default {
  maxWidth: null,
  /**
   * @param page{PDFPage}
   * @returns {void}
   */
  initialize(page) {
    if (this.maxWidth) return;
    this.maxWidth = page.getWidth();
  },
  get margin() {
    return BORDER;
  },
  get widthMaxWithoutMargin() {
    return this.maxWidth - this.margin * 2;
  },
  get coverPageTitleVerticalStart() {
    return COVER_PAGE_TITLE_VERTICAL_START;
  },
  get coverPageTitleWidth() {
    return COVER_PAGE_TITLE_WIDTH;
  },
  get coverPageLegalMentionHorizontalStart() {
    return COVER_PAGE_LEGAL_MENTION_HORIZONTAL_START;
  },
  get coverPageLegalMentionVerticalStart() {
    return COVER_PAGE_LEGAL_MENTION_VERTICAL_START;
  },
  get coverPageLegalMentionWidth() {
    return COVER_PAGE_LEGAL_MENTION_WIDTH;
  },
  get coverPageVersionVerticalStart() {
    return COVER_PAGE_VERSION_VERTICAL_START;
  },
  get legalMentionHorizontalStart() {
    return LEGAL_MENTION_HORIZONTAL_START;
  },
  get legalMentionVerticalStart() {
    return LEGAL_MENTION_VERTICAL_START;
  },
  get competenceHorizontalStart() {
    return BORDER + COMPETENCE_HORIZONTAL_START;
  },
  get thematicHorizontalStart() {
    return BORDER + THEMATIC_HORIZONTAL_START;
  },
  get thematicWidth() {
    return THEMATIC_WIDTH;
  },
  get tubeWidth() {
    return this.tubeFirstPartWidth + DEFAULT_SPACE + this.tubeSecondPartWidth;
  },
  get tubeFirstPartStart() {
    return this.thematicHorizontalStart + this.thematicWidth + DEFAULT_SPACE;
  },
  get tubeFirstPartWidth() {
    return TUBES_FIRST_PART_WIDTH;
  },
  get tubeSecondPartStart() {
    return this.tubeFirstPartStart + this.tubeFirstPartWidth + DEFAULT_SPACE;
  },
  get tubeSecondPartWidth() {
    return this.maxWidth - this.tubeSecondPartStart - this.margin;
  },
};
