import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

module('Integration | Component | OrganizationParticipant::List', function (hooks) {
  setupIntlRenderingTest(hooks);
  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    const organization = store.createRecord('organization');
    class CurrentUserStub extends Service {
      organization = organization;
    }
    this.owner.register('service:current-user', CurrentUserStub);
  });

  test('it should display the header labels', async function (assert) {
    // given
    this.set('participants', []);

    // when
    await render(hbs`<OrganizationParticipant::List @participants={{participants}} />`);

    // then
    assert.contains('Nom');
    assert.contains('Prénom');
  });

  test('it should display a list of participants', async function (assert) {
    // given
    const participants = [
      { lastName: 'La Terreur', firstName: 'Gigi', id: 34 },
      { lastName: "L'asticot", firstName: 'Gogo', id: 56 },
    ];
    this.set('participants', participants);

    // when
    await render(hbs`<OrganizationParticipant::List @participants={{participants}} />`);

    // then
    assert.contains('La Terreur');
    assert.contains("L'asticot");
  });

  test('it should display the participant firstName and lastName', async function (assert) {
    // given
    const participants = [
      {
        lastName: 'La Terreur',
        firstName: 'Gigi',
      },
    ];

    this.set('participants', participants);

    // when
    await render(hbs`<OrganizationParticipant::List @participants={{participants}} />`);

    // then
    assert.contains('La Terreur');
    assert.contains('Gigi');
  });
});
