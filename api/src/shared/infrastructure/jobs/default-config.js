/**
 * Job priority. Higher numbers have, um, higher priority
 * @see https://pgboss.io/api/send.html
 * @readonly
 * @enum {number}
 */
export const JobPriority = Object.freeze({
  DEFAULT: 0,
  HIGH: 1,
});

/**
 * Job retry. define few config to retry job when failed
 * @see https://pgboss.io/api/send.html
 * @readonly
 * @enum {Object}
 */
export const JobRetry = Object.freeze({
  NO_RETRY: {
    retryLimit: 0,
    retryDelay: 0,
    retryBackoff: false,
  },
  FEW_RETRY: {
    retryLimit: 2,
    retryDelay: 30,
    retryBackoff: true,
  },
  STANDARD_RETRY: {
    retryLimit: 10,
    retryDelay: 30,
    retryBackoff: true,
  },
  HIGH_RETRY: {
    retryLimit: 10,
    retryDelay: 30,
    retryBackoff: false,
  },
});

/**
 * Job expireIn. define few config to set expireIn field
 * @see https://github.com/timgit/pg-boss/blob/9.0.3/docs/readme.md#insertjobs
 * @readonly
 * @enum {string}
 */
export const JobExpireIn = Object.freeze({
  INFINITE: 20 * 3600,
  /*
   pg-boss n'arrête pas les jobs expirés. De plus, il empile d'autres jobs par dessus et relance le job expiré, ce qui peut provoquer des états incohérents.
   Par conséquent nous définissons 20 heures comme durée maximale, ce qui fait plus que la durée maximale d'un conteneur.
   */
});
