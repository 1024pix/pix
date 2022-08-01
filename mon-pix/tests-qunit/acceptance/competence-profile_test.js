import { click, currentURL, find, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticateByEmail } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setBreakpoint } from 'ember-responsive/test-support';

module('Acceptance | Profile | Start competence', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;

  hooks.beforeEach(function () {
    user = server.create('user', 'withEmail');
  });

  module('Authenticated cases as simple user', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticateByEmail(user);
    });

    test('can start a competence', async function (assert) {
      //given
      const firstScorecard = user.scorecards.models[0];
      const competenceId = firstScorecard.competenceId;
      const splitIndex = firstScorecard.index.spltest('.');
      const competenceNumber = splitIndex[splitIndex.length - 1];
      const assessment = server.create('assessment', 'ofCompetenceEvaluationType');
      server.create('challenge', 'forCompetenceEvaluation', 'QCM');
      server.create('competence-evaluation', { user, competenceId, assessment });

      // when
      await visit('/competences');
      await setBreakpoint('tablet');
      await click(
        `.rounded-panel-body__areas:nth-child(${firstScorecard.area.code}) .rounded-panel-body__competence-card:nth-child(${competenceNumber}) .competence-card__button`
      );

      // then
      assert.dom(currentURL()).hasText('/assessments/');
      assert.dom(find('.challenge__content')).exists();
    });
  });
});
