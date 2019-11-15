import { helper } from '@ember/component/helper';

export function getQrocInputSize(format) {
  const defaultFormat = 'mots';
  const inputSizeMap = {
    petit: '10',
    mots: '20',
    phrase: '50',
  };

  return inputSizeMap[format] || inputSizeMap[defaultFormat];
}

export default helper(getQrocInputSize);
