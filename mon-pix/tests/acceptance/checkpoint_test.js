import { find, findAll, visit } from '@ember/test-helpers';
import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateByEmail } from '../helpers/authentication';

describe('Acceptance | Checkpoint', function () {
  setupApplicationTest();
  setupMirage();
  let assessment;

  beforeEach(function () {
    assessment = server.create('assessment', 'ofCompetenceEvaluationType');
  });

  describe('With answers', function () {
    const NB_ANSWERS = 3;

    beforeEach(function () {
      for (let i = 0; i < NB_ANSWERS; ++i) {
        const challenge = server.create('challenge', 'forCompetenceEvaluation');
        server.create('answer', {
          value: 'SomeAnswer',
          result: 'ko',
          challenge,
          assessment,
        });
      }
    });

    it('should display questions and links to solutions', async function () {
      // when
      await visit(`/assessments/${assessment.id}/checkpoint`);

      // then
      expect(find('.checkpoint-progression-gauge-wrapper')).to.exist;
      expect(find('.assessment-results__list')).to.exist;
      expect(findAll('.result-item')).to.have.lengthOf(NB_ANSWERS);
      expect(find('.checkpoint__continue').textContent).to.contain('Continuer');
      expect(find('.checkpoint-no-answer')).to.not.exist;
    });
  });

  describe('Without answers', function () {
    it('should display a message indicating that there is no answers to provide', async function () {
      // when
      await visit(`/assessments/${assessment.id}/checkpoint?finalCheckpoint=true`);

      // then
      expect(find('.checkpoint-progression-gauge-wrapper')).to.not.exist;
      expect(find('.assessment-results__list')).to.not.exist;
      expect(find('.checkpoint-no-answer')).to.exist;

      expect(find('.checkpoint__continue')).to.exist;
      expect(find('.checkpoint__continue').textContent).to.contain('Voir mes résultats');
      expect(find('.checkpoint-no-answer__info').textContent).to.contain(
        'Vous avez déjà répondu à ces questions lors de vos tests précédents : vous pouvez directement accéder à vos résultats.\n\nVous souhaitez améliorer votre score ? En cliquant sur  “Voir mes résultats”, vous aurez la possibilité de retenter le parcours.'
      );
    });
  });

  describe('When user is anonymous', function () {
    it('should not display home link', async function () {
      //given
      const user = server.create('user', 'withEmail', {
        isAnonymous: true,
      });
      await authenticateByEmail(user);

      // when
      await visit(`/assessments/${assessment.id}/checkpoint?finalCheckpoint=true`);

      // then
      expect(find('.assessment-banner__home-link')).to.not.exist;
    });
  });
});
