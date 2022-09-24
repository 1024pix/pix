const TubeText = require('../drawer/TubeText');

module.exports = {
  /**
   *
   * @param positionY{number}
   * @param page {PDFPage}
   * @param tube {Tube}
   * @param dryRun {boolean}
   * @returns {number}  next y position
   */
  build(positionY, page, tube, dryRun) {
    const tubeText = new TubeText({
      practicalTitle: tube.practicalTitle,
      practicalDescription: tube.practicalDescription,
      positionY,
    });
    return tubeText.draw(page, dryRun);
  },
};
