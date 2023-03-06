import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';
import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';

module('Integration | Component | step-two-section', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders the count of sessions and candidates', async function (assert) {
    // given
    this.set('sessionsCount', 2);
    this.set('sessionsWithoutCandidatesCount', 0);
    this.set('candidatesCount', 12);

    // when
    const { getByText } = await render(
      hbs`<Import::StepTwoSection @sessionsCount="{{this.sessionsCount}}" @sessionsWithoutCandidatesCount="{{this.sessionsWithoutCandidatesCount}}"  @candidatesCount="{{this.candidatesCount}}" />`
    );

    // then
    assert.dom(getByText('2 sessions dont 0 session sans candidat')).exists();
    assert.dom(getByText('12 candidats')).exists();
  });

  module('when the imported file contains errors', function () {
    test('it renders an errors report', async function (assert) {
      // given
      this.set('isImportInError', true);
      this.set('errorsReport', ['Fichier invalide']);
      this.set('errorsReportCount', 1);

      // when
      const screen = await render(
        hbs`<Import::StepTwoSection
            @isImportInError="{{this.isImportInError}}"
            @errorsReport="{{this.errorsReport}}"
            @errorsReportCount="{{this.errorsReportCount}}"
            />`
      );

      await click(screen.getByRole('button', { name: '1 erreur bloquante' }));

      // then
      assert.dom(screen.getByText('Fichier invalide')).exists();
    });

    test('it renders a button to return to step one', async function (assert) {
      // given
      this.set('isImportInError', true);

      // when
      const { getByRole } = await render(hbs`<Import::StepTwoSection @isImportInError="{{this.isImportInError}}" />`);

      // then
      assert
        .dom(getByRole('button', { name: "Revenir à l'étape précédente pour importer le fichier à nouveau" }))
        .exists();
    });
  });
});
