import { JobPgBoss } from '../JobPgBoss.js';

export class CreateAnonymizeUserLogJob extends JobPgBoss {
  constructor(queryBuilder) {
    super({ name: 'CreateAnonymizeUserLogJob' }, queryBuilder);
  }
}
