/* global jsyaml */

export default function resultDetailsAsObject(yamlResultDetails) {
  let resultDetailsAsObject = {};
  if (yamlResultDetails !== 'null\n') {
    resultDetailsAsObject = jsyaml.safeLoad(yamlResultDetails);
  }
  return resultDetailsAsObject;
}
