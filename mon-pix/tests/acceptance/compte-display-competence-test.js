import { find, findAll, currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateAsSimpleUser } from '../helpers/testing';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Compte | Competence profile', function() {
  setupApplicationTest();
  setupMirage();

  beforeEach(function() {
    defaultScenario(this.server);
  });

  it('can visit /compte', async function() {
    // given
    await authenticateAsSimpleUser();

    // when
    await visitWithAbortedTransition('/compte');

    // then
    expect(currentURL()).to.equal('/compte');
  });

  it('should redirect to home, when user is not found', async function() {
    // when
    await visitWithAbortedTransition('/compte');

    // then
    expect(currentURL()).to.equal('/connexion');
  });

  it('should display user competences (with level) grouped by area', async function() {
    // given
    await authenticateAsSimpleUser();

    // when
    await visitWithAbortedTransition('/compte');

    // then
    expect(findAll('.competence-by-area-item').length).to.equal(5);
    expect(findAll('.competence').length).to.equal(16);
  });

  it('should display a link ’commencer’ with the correct url to start an adaptive course, for the first competence', async function() {
    // given
    await authenticateAsSimpleUser();

    // when
    await visitWithAbortedTransition('/compte');

    // then
    expect(findAll('.competence-level-progress-bar__link-start')[0].getAttribute('href')).to.equal('/courses/ref_course_id');
  });

  it('should display a hero banner for logged user', async function() {
    // given
    await authenticateAsSimpleUser();

    // when
    await visitWithAbortedTransition('/compte');

    // then
    expect(find('.logged-user-profile-banner')).to.exist;
  });
});
