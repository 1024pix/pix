const sortBy = require('lodash/sortBy');
const areaBuilder = require('./area-builder.js');

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
      const frameworkName = learningContent.findFrameworkNameOfArea(area.id);
      areaBuilder.build(pdfDocument, area, frameworkName, language);
    }
    return pdfDocument;
  },
};
