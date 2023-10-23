import _ from 'lodash';

export function applyPatch(value, patch) {
  if (patch.operation === 'assign') {
    _.set(value, patch.path, patch.value);
  } else if (patch.operation === 'push') {
    const arr = _.get(value, patch.path);
    arr.push(patch.value);
  }
}
