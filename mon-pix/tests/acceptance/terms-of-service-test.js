import {  describe, it } from 'mocha';
import { currentURL } from '@ember/test-helpers';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import visit from '../helpers/visit';

describe('Acceptance | terms-of-service', function() {
  setupApplicationTest();
  setupMirage();

  it('should be redirect to login page when user is not authenticated', async function() {

    // when
    await visit('/cgu');

    // then
    expect(currentURL()).to.equal('/connexion');

  });
});
