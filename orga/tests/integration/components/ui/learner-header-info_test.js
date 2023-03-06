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

  test('it renders learner header information when learner is certifiable', async function (assert) {
    const isCertifiable = true;
    const certifiableAt = '2023-01-01';

    this.set('isCertifiable', isCertifiable);
    this.set('certifiableAt', certifiableAt);

    await render(
      hbs`<Ui::LearnerHeaderInfo @isCertifiable={{this.isCertifiable}} @certifiableAt={{this.certifiableAt}} />`
    );

    assert.contains('Certifiable');
    assert.contains('01/01/2023');
  });

  test('it does not render learner division header information when learner is not certifiable', async function (assert) {
    const isCertifiable = false;
    const certifiableAt = null;

    this.set('isCertifiable', isCertifiable);
    this.set('certifiableAt', certifiableAt);

    await render(
      hbs`<Ui::LearnerHeaderInfo @isCertifiable={{this.isCertifiable}} @certifiableAt={{this.certifiableAt}} />`
    );

    assert.notContains('Certifiable');
    assert.notContains('01/01/2023');
  });
});
