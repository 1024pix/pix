import { load } from 'js-yaml';

export default function resultDetailsAsObject(yamlResultDetails) {
  let resultDetailsAsObject = {};
  if (yamlResultDetails !== 'null\n') {
    resultDetailsAsObject = load(yamlResultDetails);
  }
  return resultDetailsAsObject;
}
