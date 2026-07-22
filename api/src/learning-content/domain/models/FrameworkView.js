/**
 @typedef {import('./AreaView.js').AreaView} AreaView
 */

export class FrameworkView {
  /**
   * @param {object} params
   * @param {string} params.id
   * @param {string} params.name
   * @param {AreaView[]} params.areaViews
   */
  constructor({ id, name, areaViews }) {
    this.id = id;
    this.name = name;
    this.areaViews = areaViews;
  }
}
