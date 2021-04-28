/* eslint ember/no-classic-classes: 0 */

import { click, fillIn, currentURL, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentication';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Profile', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(function() {
    user = server.create('user', 'withEmail');
  });

  describe('Authenticated cases as simple user', function() {
    beforeEach(async function() {
      await authenticateByEmail(user);
    });

    it('can visit /competences', async function() {
      // when
      await visit('/competences');

      // then
      expect(currentURL()).to.equal('/competences');
    });

    it('should display pixscore', async function() {
      await visit('/competences');

      // then
      expect(find('.hexagon-score-content__pix-score').textContent).to.contains(user.profile.pixScore);
    });

    it('should display scorecards classified accordingly to each area', async function() {
      // when
      await visit('/competences');

      // then
      user.scorecards.models.forEach((scorecard) => {
        const splitIndex = scorecard.index.split('.');
        const competenceNumber = splitIndex[splitIndex.length - 1];
        expect(find(
          `.rounded-panel-body__areas:nth-child(${scorecard.area.code}) .rounded-panel-body__competence-card:nth-child(${competenceNumber}) .competence-card__area-name`,
        ).textContent).to.equal(scorecard.area.title);
        expect(find(
          `.rounded-panel-body__areas:nth-child(${scorecard.area.code}) .rounded-panel-body__competence-card:nth-child(${competenceNumber}) .competence-card__competence-name`,
        ).textContent).to.equal(scorecard.name);
        expect(find(
          `.rounded-panel-body__areas:nth-child(${scorecard.area.code}) .rounded-panel-body__competence-card:nth-child(${competenceNumber}) .score-value`,
        ).textContent).to.equal(scorecard.level > 0 ? scorecard.level.toString() : scorecard.status === 'NOT_STARTED' ? '' : '–');
      });
    });

    it('should link to competence-details page on click on level circle', async function() {
      // given
      await visit('/competences');

      // when
      await click('.rounded-panel-body__areas:first-child .rounded-panel-body__competence-card:first-child .competence-card__link');

      // then
      const scorecard = user.scorecards.models[0];
      expect(currentURL()).to.equal(`/competences/${scorecard.competenceId}/details`);
    });
  });

  describe('Not authenticated cases', function() {
    it('should redirect to home, when user is not authenticated', async function() {
      // when
      await visit('/competences');
      expect(currentURL()).to.equal('/connexion');
    });

    it('should stay in /connexion, when authentication failed', async function() {
      // given
      await visit('/connexion');
      await fillIn('#login', 'anyone@pix.world');
      await fillIn('#password', 'Pix20!!');

      // when
      await click('.button');

      // then
      expect(currentURL()).to.equal('/connexion');
    });
  });
});
