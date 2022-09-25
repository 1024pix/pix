const sortBy = require('lodash/sortBy');
const areaBuilder = require('./area-builder');

module.exports = {
  /**
   * @param pdfDocument{PDFDocument}
   * @param learningContent{LearningContent}
   * @param language {string}
   *
   * @return {PDFDocument}
   */
  build(pdfDocument, learningContent, language) {
    for (const area of sortBy(learningContent.areas, ['frameworkId', 'code'])) {
      areaBuilder.build(pdfDocument, area, language);
    }
    return pdfDocument;
  },
};
