/**
 * Job priority. Higher numbers have, um, higher priority
 * @see https://github.com/timgit/pg-boss/blob/master/docs/readme.md#insertjobs
 * @readonly
 * @enum {number}
 */
export const JobPriority = Object.freeze({
  DEFAULT: 0,
  HIGH: 1,
});
