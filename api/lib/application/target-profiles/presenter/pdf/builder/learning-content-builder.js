const areaBuilder = require('./area-builder');

module.exports = {
  /**
   * @param pdfDocument{PDFDocument}
   * @param learningContent{LearningContent}
   * @param todayDateString {string}
   *
   * @return {PDFDocument}
   */
  build(pdfDocument, learningContent, todayDateString) {
    // areaBuilder.build(pdfDocument, learningContent.areas[29]);
    // areaBuilder.build(pdfDocument, learningContent.areas[35]);
    for (const area of learningContent.areas) {
      areaBuilder.build(pdfDocument, area);
    }
    return pdfDocument;
  },
};
