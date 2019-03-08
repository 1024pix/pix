import { helper } from '@ember/component/helper';

export function dayBetweenTwoDate(params) {
  const day1 = new Date(params[0]);
  const day2 = new Date(params[1]);
  return Math.abs(Math.ceil((day1.getTime() - day2.getTime())/(1000*60*60*24)));
}

export default helper(dayBetweenTwoDate);
