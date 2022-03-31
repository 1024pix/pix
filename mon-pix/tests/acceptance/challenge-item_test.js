import { beforeEach, describe, it } from 'mocha';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { getPageTitle } from 'ember-page-title/test-support';
import { authenticateByEmail } from '../helpers/authentication';
import { expect } from 'chai';
import { click, find, triggerEvent, visit } from '@ember/test-helpers';

describe('Acceptance | Displaying a challenge of any type', () => {
  setupApplicationTest();
  setupMirage();

  let assessment;
});
