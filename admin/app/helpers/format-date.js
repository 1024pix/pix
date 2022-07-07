import { helper } from '@ember/component/helper';
import dayjs from 'dayjs';

export function formatDate(params) {
  const value = params[0];
  return value ? dayjs(value).format('DD/MM/YYYY') : value;
}

export default helper(formatDate);
