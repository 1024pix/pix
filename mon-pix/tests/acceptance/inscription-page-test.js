import { find } from '@ember/test-helpers';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Page | Inscription', function() {
  setupApplicationTest();
  setupMirage();

  it('should contain a link to "Terms of service" page', async function() {
    await visitWithAbortedTransition('/inscription');

    return expect(find('.signup-form__cgu .link').getAttribute('href').trim()).to.equal('https://pix.fr/conditions-generales-d-utilisation');
  });

});
