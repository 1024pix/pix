import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setBreakpoint } from 'ember-responsive/test-support';
import { setupMirage } from 'mon-pix/tests/test-support/mirage';
import { module, test } from 'qunit';

import { authenticate } from '../helpers/authentication';

module('Acceptance | Profile | Start competence', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;

  hooks.beforeEach(function () {
    user = server.create('user', 'withEmail');
  });

  module('Authenticated cases as simple user', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticate(user);
    });

    test('can start a competence', async function (assert) {
      //given
      const firstScorecard = user.scorecards.models[0];
      const competenceId = firstScorecard.competenceId;
      const splitIndex = firstScorecard.index.split('.');
      const competenceNumber = splitIndex[splitIndex.length - 1];
      const assessment = server.create('assessment', 'ofCompetenceEvaluationType');
      server.create('challenge', 'forCompetenceEvaluation', 'QCM');
      server.create('competence-evaluation', { user, competenceId, assessment });

      // when
      const screen = await visit('/competences');
      await setBreakpoint('tablet');

      const cardName = new RegExp(
        `Reprendre la compétence Area_${firstScorecard.area.code}_Competence_${competenceNumber}`,
      );
      await click(screen.getByRole('link', { name: cardName }));

      // then
      assert.ok(currentURL().includes('/assessments/'));
      assert.dom('.challenge__content').exists();
    });
  });
});
