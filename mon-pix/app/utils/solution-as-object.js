import { load } from 'js-yaml';
import each from 'lodash/each';

function transformSolutionsToString(solutionsAsObject) {
  each(solutionsAsObject, (potentialSolution) => {
    potentialSolution.forEach((value, index) => {
      potentialSolution[index] = potentialSolution[index].toString();
    });
  });
  return solutionsAsObject;
}

export default function solutionAsObject(yamlSolution) {
  let solutionsAsObject = load(yamlSolution);
  solutionsAsObject = transformSolutionsToString(solutionsAsObject);
  return solutionsAsObject;
}
