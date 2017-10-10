import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { startApp, destroyApp } from '../helpers/application';
import { authenticateAsPrescriber } from '../helpers/testing';
import defaultScenario from '../../mirage/scenarios/default';

describe('Acceptance | o1 - board organization', function() {
  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('can visit /board', async function() {
    // given
    authenticateAsPrescriber();

    // when
    await visit('/board');

    // then
    andThen(() => {
      expect(currentURL()).to.equal('/board');
    });

    await visit('/deconnexion');
  });

  it('should not be accessible while the user is not connected', async function() {
    // given
    await visit('/deconnexion');

    // when
    await visit('/board');

    // then
    andThen(() => {
      expect(currentURL()).to.equal('/connexion');
    });
  });

  it('should display the name and the code of my organization', async function() {
    // given
    authenticateAsPrescriber();

    // when
    await visit('/board');

    // then
    expect(find('.board-page__header-organisation__name').length).to.equal(1);
    expect(find('.board-page__header-organisation__name').text().trim()).to.equal('ACME');
    expect(find('.board-page__header-code__text').length).to.equal(1);
    expect(find('.board-page__header-code__text').text().trim()).to.equal('ABCD00');
  });

  it('should display an empty list of snapshot', async function() {
    // given
    authenticateAsPrescriber();

    // when
    await visit('/board');

    // then
    expect(find('.snapshot-list').length).to.equal(1);
    expect(find('.snapshot-list__no-profile').text()).to.equal('Aucun profil partagé pour le moment');

  });

});
