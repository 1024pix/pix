import jsyaml from 'js-yaml';

export default function resultDetailsAsObject(yamlResultDetails) {
  let resultDetailsAsObject = {};
  if (yamlResultDetails !== 'null\n') {
    resultDetailsAsObject = jsyaml.load(yamlResultDetails);
  }
  return resultDetailsAsObject;
}
