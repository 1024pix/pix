/**
 @typedef {import('./TubeView.js').TubeView} TubeView
 */

export class ThematicView {
  /**
   * @param {object} params
   * @param {string} params.id
   * @param {object} params.name_i18n
   * @param {string} params.index
   * @param {TubeView[]} params.tubeViews
   */
  constructor({ id, name_i18n, index, tubeViews }) {
    this.id = id;
    this.name_i18n = name_i18n;
    this.index = index;
    this.tubeViews = tubeViews;
  }
}
