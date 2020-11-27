import { click, currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { authenticateByEmail } from '../helpers/authentication';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | User account', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(async function() {
    //given
    user = server.create('user', 'withEmail');
    await authenticateByEmail(user);
  });

  describe('When in profile', function() {

    it('should open certifications page when click on menu', async function() {
      // when
      await click('.logged-user-name');
      await click('a[data-test-certifications-link]');

      // then
      expect(currentURL()).to.equal('/mes-certifications');
    });

  });
});
