import each from 'lodash/each';

import jsyaml from 'js-yaml';

function transformSolutionsToString(solutionsAsObject) {
  each(solutionsAsObject, (potentialSolution) => {
    potentialSolution.forEach((value, index) => {
      potentialSolution[index] = potentialSolution[index].toString();
    });
  });
  return solutionsAsObject;
}

export default function solutionAsObject(yamlSolution) {
  let solutionsAsObject = jsyaml.safeLoad(yamlSolution);
  solutionsAsObject = transformSolutionsToString(solutionsAsObject);
  return solutionsAsObject;
}
