import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, find, visit } from '@ember/test-helpers';
import { authenticateByEmail } from '../../helpers/authentication';

describe('Acceptance | User-tutorials-v2 | Actions', function () {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(async function () {
    user = server.create('user', 'withEmail');
    await authenticateByEmail(user);
  });

  describe('Evaluate tutorial', () => {
    it('should disable evaluate action on click', async function () {
      await visit('/mes-tutos/recommandes');

      await click(find('[aria-label="Donner mon avis sur ce tuto"]'));

      expect(find('[aria-label="Tuto utile"]').disabled).to.be.true;
    });
  });
});
