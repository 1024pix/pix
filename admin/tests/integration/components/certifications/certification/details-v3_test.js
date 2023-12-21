import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | certifications/candidate-edit-modal', function (hooks) {
  setupRenderingTest(hooks);

  module('#display', function () {
    test('it should display the certification complementary info section with the right info', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      this.model = store.createRecord('v3-certification-course-details-for-administration', {
        certificationChallengesForAdministration: createChallengesForAdministration(
          ['ok', 'ok', 'ko', 'aband', null],
          store,
        ),
      });

      // when
      const screen = await render(hbs`<Certifications::Certification::DetailsV3 @details={{this.model}} />`);
      const expected = [
        {
          term: 'Nombre de question répondues  / Nombre total de questions',
          definition: '4/32',
        },
        {
          term: 'Nombre de question OK :',
          definition: '2',
        },
        {
          term: 'Nombre de question KO :',
          definition: '1',
        },
        {
          term: 'Nombre de question abandonnées :',
          definition: '1',
        },
        {
          term: 'Nombre de problèmes techniques validés :',
          definition: '1',
        },
      ];

      const terms = screen.getAllByRole('term');
      const definitions = screen.getAllByRole('definition');
      const result = terms.map((term, i) => ({ term: term.textContent, definition: definitions[i].textContent }));

      // then
      assert.deepEqual(expected, result);
    });
  });
});

function createChallengesForAdministration(answerStatuses, store) {
  return answerStatuses.map((answerStatus, index) =>
    store.createRecord('certification-challenges-for-administration', {
      id: index,
      answerStatus,
      validatedLiveAlert: !answerStatus,
    }),
  );
}
