import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Ui::LearnerHeaderInfo', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders learner header information when there is a group', async function (assert) {
    const organizationLearner = {
      email: 'organizationlearner@example.net',
      division: '3E',
      authenticationMethods: [],
    };
    const groupName = 'Groupe';

    this.set('groupName', groupName);
    this.set('organizationLearner', organizationLearner);

    await render(
      hbs`<Ui::LearnerHeaderInfo @organizationLearner={{this.organizationLearner}} @groupName={{this.groupName}} />`
    );

    assert.contains('3E');
    assert.contains('Adresse e-mail');
    assert.contains('Groupe');
  });

  test('it does not render learner division header information when there is no groupName', async function (assert) {
    const organizationLearner = {
      email: 'organizationlearner@example.net',
      authenticationMethods: [],
    };

    this.set('organizationLearner', organizationLearner);

    await render(hbs`<Ui::LearnerHeaderInfo @organizationLearner={{this.organizationLearner}} />`);

    assert.notContains('3E');
    assert.contains('Adresse e-mail');
  });
});
