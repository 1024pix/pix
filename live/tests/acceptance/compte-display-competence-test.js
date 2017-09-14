import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import seeds from '../helpers/seeds';
import { destroyApp, startApp } from '../helpers/application';

describe('Acceptance | Compte | competence profile', function() {
  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  function seedDatabase() {
    seeds.injectUserAccount();
  }

  function authenticateUser() {
    visit('/connexion');
    fillIn('#pix-email', 'samurai.jack@aku.world');
    fillIn('#pix-password', 'B@ck2past');
    click('.signin-form__submit_button');
  }

  it('can visit /compte', async function() {
    // given
    seedDatabase();
    authenticateUser();

    // when
    await visit('/compte');

    // then
    return andThen(() => {
      expect(currentURL()).to.equal('/compte');
    });
  });

  it('should redirect to home, when user is not found', async function() {
    // when
    await visit('/compte');
    return andThen(() => {
      expect(currentURL()).to.equal('/connexion');
    });
  });

  it('should display user competences (with level) grouped by area', function() {
    // given
    seedDatabase();
    authenticateUser();

    // when
    visit('/compte');

    // then
    return andThen(() => {
      expect(find('.competence-by-area-item').length).to.equal(5);
      expect(find('.competence').length).to.equal(16);
    });
  });

  it('should display a link ’commencer’ with the correct url to start an adaptive course, for the first competence', function() {
    // given
    seedDatabase();
    authenticateUser();

    // when
    visit('/compte');

    // then
    return andThen(() => {
      expect(find('.competence-level-progress-bar__start-link:first').attr('href')).to.be.equal('/courses/ref_course_id');
    });
  });

  it('should display a hero banner for logged user', function() {
    // given
    seedDatabase();
    authenticateUser();

    // when
    visit('/compte');

    // then
    return andThen(() => {
      expect(find('.logged-user-profile-banner')).to.have.lengthOf(1);
    });
  });
});
