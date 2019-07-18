import {
  afterEach,
  beforeEach,
  describe,
  it
} from 'mocha';
import { expect } from 'chai';
import { authenticateAsSimpleUser } from '../helpers/testing';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import defaultScenario from '../../mirage/scenarios/default';

describe('Acceptance | competences results', function() {
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

      server.create('assessment', {
        id: 111,
        type: 'COMPETENCE_EVALUATION',
        state: 'completed',
      });

      server.create('competence-evaluation', {
        id: 1,
        assessmentId: 111,
        competenceId: 10,
        userId: 1,
      });
    });

    it('should display a return link to profil', async function() {
      // when
      await visit('/competences/resultats/111');

      // then
      expect(find('.scorecard-details-header__return-button')).to.have.lengthOf(1);
      expect(find('.scorecard-details-header__return-button').attr('href')).to.equal('/profil');
    });

    context('When user obtained 0 pix', async function() {
      beforeEach(async function() {

        const area = server.schema.areas.find(3);

        server.create('scorecard', {
          id: '1_10',
          index: 3.3,
          type: 'COMPETENCE_EVALUATION',
          state: 'completed',
          area,
          earnedPix: 0,
          level: 0,
        });
      });

      it('should display the "too bad" banner', async function() {
        // when
        await visit('/competences/resultats/111');

        // then
        findWithAssert('.competence-results-panel-header__banner--too-bad');

      });
    });

    context('When user obtained 5 pix (less than level 1)', async function() {
      beforeEach(async function() {

        const area = server.schema.areas.find(3);

        server.create('scorecard', {
          id: '1_10',
          index: 3.3,
          type: 'COMPETENCE_EVALUATION',
          state: 'completed',
          area,
          earnedPix: 5,
          level: 0,
        });
      });

      it('should display the "not bad" banner', async function() {
        // when
        await visit('/competences/resultats/111');

        // then
        findWithAssert('.competence-results-panel-header__banner--not-bad');
        expect(find('.competence-results-banner-text-results__value').text()).to.equal('5 pix');
      });
    });

    context('When user obtained 17 pix and level 2', async function() {
      beforeEach(async function() {

        const area = server.schema.areas.find(3);

        server.create('scorecard', {
          id: '1_10',
          index: 3.3,
          type: 'COMPETENCE_EVALUATION',
          state: 'completed',
          area,
          earnedPix: 17,
          level: 2,
        });
      });

      it('should display the "congrats" banner', async function() {
        // when
        await visit('/competences/resultats/111');

        // then
        findWithAssert('.competence-results-panel-header__banner--congrats');
        expect(find('.competence-results-banner-text__results:first-child .competence-results-banner-text-results__value').text()).to.equal('Niveau 2');
        expect(find('.competence-results-banner-text__results:last-child .competence-results-banner-text-results__value').text()).to.equal('17 pix');
      });
    });
  });
});
