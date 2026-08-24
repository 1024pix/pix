/**
 @typedef {import('./CompetenceView.js').CompetenceView} CompetenceView
 */

export class AreaView {
  /**
   * @param {object} params
   * @param {string} params.id
   * @param {object} params.title_i18n
   * @param {string} params.code
   * @param {string} params.color
   * @param {CompetenceView[]} params.competenceViews
   */
  constructor({ id, title_i18n, code, color, competenceViews }) {
    this.id = id;
    this.title_i18n = title_i18n;
    this.code = code;
    this.color = color;
    this.competenceViews = competenceViews;
  }
}
