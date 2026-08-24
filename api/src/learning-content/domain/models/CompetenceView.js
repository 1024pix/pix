/**
 @typedef {import('./ThematicView.js').ThematicView} ThematicView
 */

export class CompetenceView {
  /**
   * @param {object} params
   * @param {string} params.id
   * @param {object} params.name_i18n
   * @param {string} params.index
   * @param {ThematicView[]} params.thematicViews
   */
  constructor({ id, name_i18n, index, thematicViews }) {
    this.id = id;
    this.name_i18n = name_i18n;
    this.index = index;
    this.thematicViews = thematicViews;
  }
}
