import lodash from 'lodash';

const { sortBy } = lodash;

import { areaBuilder } from './area-builder.js';

const build = function (pdfDocument, learningContent, language) {
  for (const area of sortBy(learningContent.areas, ['frameworkId', 'code'])) {
    const frameworkName = learningContent.findFrameworkNameOfArea(area.id);
    areaBuilder.build(pdfDocument, area, frameworkName, language);
  }
  return pdfDocument;
};

export { build };
