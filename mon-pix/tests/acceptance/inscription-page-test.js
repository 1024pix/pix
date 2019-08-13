import { find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Page | Inscription', function() {
  setupApplicationTest();
  setupMirage();

  beforeEach(function() {
    defaultScenario(this.server);
  });

  it('should contain a link to "Terms of service" page', async function() {
    await visitWithAbortedTransition('/inscription');

    return expect(find('.signup-form__cgu .link').getAttribute('href').trim()).to.equal('https://pix.fr/conditions-generales-d-utilisation');
  });

});
