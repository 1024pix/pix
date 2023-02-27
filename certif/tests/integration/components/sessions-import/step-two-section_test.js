import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { render } from '@1024pix/ember-testing-library';

module('Integration | Component | step-two-section', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders the count of sessions and candidates when the imported file contains no error', async function (assert) {
    // given
    this.set('sessionsReport', '2 sessions dont 0 sessions sans candidat');
    this.set('candidatesReport', '12 candidats');

    // when
    const { getByText } = await render(
      hbs`<Import::StepTwoSection @sessionsReport="{{this.sessionsReport}}"  @candidatesReport="{{this.candidatesReport}}" />`
    );

    // then
    assert.dom(getByText('2 sessions dont 0 sessions sans candidat')).exists();
    assert.dom(getByText('12 candidats')).exists();
  });

  test('it renders an errors report when the imported file contains errors', async function (assert) {
    // given
    this.set('isImportInError', true);
    this.set('errorsReport', 'Fichier invalide');

    // when
    const { getByText } = await render(
      hbs`<Import::StepTwoSection @isImportInError="{{this.isImportInError}}"  @errorsReport="{{this.errorsReport}}" />`
    );

    // then
    assert.dom(getByText('Fichier invalide')).exists();
  });
});
