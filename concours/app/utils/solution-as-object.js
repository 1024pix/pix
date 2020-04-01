import _ from 'lodash';
import jsyaml from 'js-yaml';

function transformSolutionsToString(solutionsAsObject) {
  _.each(solutionsAsObject, (potentialSolution) => {
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
