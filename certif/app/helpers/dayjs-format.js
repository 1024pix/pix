import { helper } from '@ember/component/helper';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export function dayjsFormat([value, format], { inputFormat, 'allow-empty': allowEmpty } = {}) {
  if (!value) {
    return allowEmpty ? '' : value;
  }

  const parsed = inputFormat ? dayjs(value, inputFormat) : dayjs(value);

  if (!parsed.isValid()) {
    return allowEmpty ? '' : value;
  }

  return parsed.format(format);
}

export default helper(dayjsFormat);