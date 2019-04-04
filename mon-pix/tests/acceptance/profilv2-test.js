import {
  afterEach,
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';
import { authenticateAsPrescriber, authenticateAsSimpleUser } from '../helpers/testing';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import defaultScenario from '../../mirage/scenarios/default';

describe('Acceptance | Profil v2 | Afficher profil v2', function() {
  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Authenticated cases as simple user', function() {
    beforeEach(async function() {
      await authenticateAsSimpleUser();
    });

    it('can visit /profilv2', async function() {
      // when
      await visit('/profilv2');

      // then
      expect(currentURL()).to.equal('/profilv2');
    });

    it('should display pixscore', async function() {
      await visit('/profilv2');

      // then
      expect(find('.hexagon-score-content__pix-score').text()).to.contains('196');
    });

    it('should display first competence card of first area', async function() {
      // when
      await visit('/profilv2');

      // then
      expect(find('.rounded-panel-body__areas:first-child .rounded-panel-body__competence-card:first-child .competence-card__area-name').text()).to.equal('Information et données');
      expect(find('.rounded-panel-body__areas:first-child .rounded-panel-body__competence-card:first-child .competence-card__competence-name').text()).to.equal('Compétence C1');
      expect(find('.rounded-panel-body__areas:first-child .rounded-panel-body__competence-card:first-child .competence-card-level__value').text()).to.equal('2');
    });

    it('should display second competence card of first area', async function() {
      // when
      await visit('/profilv2');

      // then
      expect(find('.rounded-panel-body__areas:first-child .rounded-panel-body__competence-card:nth-child(2) .competence-card__area-name').text()).to.equal('Information et données');
      expect(find('.rounded-panel-body__areas:first-child .rounded-panel-body__competence-card:nth-child(2) .competence-card__competence-name').text()).to.equal('Compétence C2');
      expect(find('.rounded-panel-body__areas:first-child .rounded-panel-body__competence-card:nth-child(2) .competence-card-level__value').text()).to.equal('4');
    });

    it('should display first competence card of second area', async function() {
      // when
      await visit('/profilv2');

      // then
      expect(find('.rounded-panel-body__areas:nth-child(2) .rounded-panel-body__competence-card:first-child .competence-card__area-name').text()).to.equal('Communication et collaboration');
      expect(find('.rounded-panel-body__areas:nth-child(2) .rounded-panel-body__competence-card:first-child .competence-card__competence-name').text()).to.equal('Compétence C3');
      expect(find('.rounded-panel-body__areas:nth-child(2) .rounded-panel-body__competence-card:first-child .competence-card-level__value').text()).to.equal('3');
    });
  });

  describe('Authenticated cases as user with organization', function() {
    beforeEach(async function() {
      await authenticateAsPrescriber();
    });

    it('can visit /profilv2', async function() {
      // when
      await visit('/profilv2');

      // then
      expect(currentURL()).to.equal('/board');
    });
  });

  describe('Not authenticated cases', function() {
    it('should redirect to home, when user is not authenticated', async function() {
      // when
      await visit('/profilv2');
      expect(currentURL()).to.equal('/connexion');
    });

    it('should stay in /connexion, when authentication failed', async function() {
      // given
      await visit('/connexion');
      await fillIn('#email', 'anyone@pix.world');
      await fillIn('#password', 'Pix20!!');

      // when
      await click('.button');

      // then
      expect(currentURL()).to.equal('/connexion');
    });
  });
});
