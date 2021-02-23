import { find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentication';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | competences results', function() {
  setupApplicationTest();
  setupMirage();
  let user;
  const competenceId = 10;
  const assessmentId = 10;

  beforeEach(function() {
    user = server.create('user', 'withEmail');
  });

  describe('Authenticated cases as simple user', function() {
    beforeEach(async function() {
      await authenticateByEmail(user);

      this.server.create('assessment', {
        id: assessmentId,
        type: 'COMPETENCE_EVALUATION',
        state: 'completed',
      });

      // Older competence-evaluation
      const area = this.server.schema.areas.find(3);
      const olderCompetenceScoreCard = this.server.create('scorecard', {
        id: '1_9',
        index: 5.1,
        type: 'COMPETENCE_EVALUATION',
        state: 'completed',
        area,
        earnedPix: 17,
        level: 2,
      });
      const olderCompetence = this.server.create('competence-evaluation', {
        id: 2,
        assessmentId: assessmentId,
        competenceId: 9,
        userId: user.id,
        createdAt: new Date('2020-01-01'),
      });
      olderCompetence.update({ scorecard: olderCompetenceScoreCard });

      this.server.create('competence-evaluation', {
        id: 1,
        assessmentId: assessmentId,
        competenceId: competenceId,
        userId: user.id,
        createdAt: new Date('2020-02-01'),
      });
    });

    it('should display a return link to competences', async function() {
      // when
      await visit(`/competences/${competenceId}/resultats/${assessmentId}`);

      // then
      expect(find('.pix-return-to')).to.exist;
      expect(find('.pix-return-to').getAttribute('href')).to.equal('/competences');
    });

    context('When user obtained 0 pix', async function() {
      beforeEach(async function() {

        const area = this.server.schema.areas.find(3);

        this.server.create('scorecard', {
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
        await visit(`/competences/${competenceId}/resultats/${assessmentId}`);

        // then
        expect(find('.competence-results-panel-header__banner--too-bad')).to.exist;

      });
    });

    context('When user obtained 5 pix (less than level 1)', async function() {
      beforeEach(async function() {

        const area = this.server.schema.areas.find(3);

        this.server.create('scorecard', {
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
        await visit(`/competences/${competenceId}/resultats/${assessmentId}`);

        // then
        expect(find('.competence-results-panel-header__banner--not-bad')).to.exist;
        expect(find('.competence-results-banner-text-results__value').textContent).to.equal('5 pix');
      });
    });

    context('When user obtained 17 pix and level 2', async function() {
      beforeEach(async function() {

        const area = this.server.schema.areas.find(3);

        this.server.create('scorecard', {
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
        await visit(`/competences/${competenceId}/resultats/${assessmentId}`);

        // then
        expect(find('.competence-results-panel-header__banner--congrats')).to.exist;
        expect(find(
          '.competence-results-banner-text__results:first-child .competence-results-banner-text-results__value',
        ).textContent).to.equal('niveau 2');
        expect(find(
          '.competence-results-banner-text__results:last-child .competence-results-banner-text-results__value',
        ).textContent).to.equal('17 pix');
      });
    });
  });
});
