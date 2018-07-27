import { helper } from '@ember/component/helper';

export function extractExtension(params) {
  const parts = params[0].split('.');
  const lastIndex = parts.length - 1;
  return parts[lastIndex];
}

export default helper(extractExtension);
