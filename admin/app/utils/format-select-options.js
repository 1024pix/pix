import map from 'lodash/map';

export default function formatSelectOptions(options) {
  return map(options, (key, value) => ({ value: value, label: key }));
}
