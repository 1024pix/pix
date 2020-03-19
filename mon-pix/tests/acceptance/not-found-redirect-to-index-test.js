import { currentURL } from '@ember/test-helpers';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Page | Not Found Redirection', () => {
  setupApplicationTest();
  setupMirage();

  it('should redirect to home page when URL is a nonexistant page', async () => {
    await visit('/plop');

    expect(currentURL()).to.eq('/connexion');
  });

});
