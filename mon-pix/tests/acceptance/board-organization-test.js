import { findAll, currentURL, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateAsBoardOrganization } from '../helpers/testing';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Board organization', function() {
  setupApplicationTest();
  setupMirage();

  beforeEach(function() {
    defaultScenario(this.server);
  });

  it('can visit /board', async function() {
    // given
    await authenticateAsBoardOrganization();

    // when
    await visitWithAbortedTransition('/board');

    // then
    expect(currentURL()).to.equal('/board');
  });

  it('should not be accessible while the user is not connected', async function() {
    // when
    await visitWithAbortedTransition('/board');

    // then
    expect(currentURL()).to.equal('/connexion');
  });

  it('should display the name and the code of my organization', async function() {
    // given
    await authenticateAsBoardOrganization();

    // when
    await visitWithAbortedTransition('/board');

    // then
    expect(findAll('.board-page__header-organisation__name').length).to.equal(1);
    expect(find('.board-page__header-organisation__name').textContent.trim()).to.equal('Mon Entreprise');
    expect(findAll('.board-page__header-code__text').length).to.equal(1);
    expect(find('.board-page__header-code__text').textContent.trim()).to.equal('PRO001');
  });

  it('should display an empty list of snapshot', async function() {
    // given
    await authenticateAsBoardOrganization();

    // when
    await visitWithAbortedTransition('/board');

    // then
    expect(findAll('.snapshot-list').length).to.equal(1);
    expect(find('.snapshot-list__no-profile').textContent).to.equal('Aucun profil partagé pour le moment');

  });

  it('should display a link to download snapshots', async function() {
    // given
    await authenticateAsBoardOrganization();

    // when
    await visitWithAbortedTransition('/board');

    // then
    expect(find('.profiles-title__export-csv').textContent).to.contains('Exporter (.csv)');
    expect(find('.profiles-title__export-csv').getAttribute('href')).to.equal(
      `http://localhost:3000/api/organizations/1/snapshots/export?userToken=aaa.${btoa('{"user_id":2,"source":"mon-pix","iat":1545321469}')}.bbb`
    );
  });

});
