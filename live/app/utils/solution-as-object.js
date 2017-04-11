/* global jsyaml */
import _ from 'lodash';

function transformSolutionsToString(solutionsAsObject) {
  _.each(solutionsAsObject, function (potentialSolution) {
    potentialSolution.forEach(function (value, index) {
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
