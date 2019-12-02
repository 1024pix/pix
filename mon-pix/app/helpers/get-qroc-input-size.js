import { helper } from '@ember/component/helper';

export function getQrocInputSize(format) {
  const defaultFormat = 'mots';
  const inputSizeMap = {
    petit: '11',
    mots: '20',
  };

  return inputSizeMap[format] || inputSizeMap[defaultFormat];
}

export default helper(getQrocInputSize);
