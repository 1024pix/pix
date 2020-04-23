import { find } from '@ember/test-helpers';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Page | Inscription', function() {
  setupApplicationTest();
  setupMirage();

  it('should contain a link to "Terms of service" page', async function() {
    await visit('/inscription');

    expect(find('.signup-form__cgu .link')).to.exist;
  });

});
