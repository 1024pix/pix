import { click, currentURL, find } from '@ember/test-helpers';
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

    it('should contain link to pix.fr/aide', async function() {
      // when
      await click('.logged-user-name');
      const helplink = find('.logged-user-menu__actions').children[2].children[0].getAttribute('href');

      // then
      expect(helplink).to.equal('https://pix.fr/aide');
    });

  });
});
