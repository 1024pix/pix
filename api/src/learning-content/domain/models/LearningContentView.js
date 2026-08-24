/**
  @typedef {import('./FrameworkView.js').FrameworkView} FrameworkView
*/

export class LearningContentView {
  /**
   * @param {object} params
   * @param {FrameworkView[]} params.frameworkViews
   */
  constructor({ frameworkViews }) {
    this.frameworkViews = frameworkViews;
  }
}
