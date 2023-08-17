import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | Campaigns | participations-section', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    // given
    class AccessControlStub extends Service {
      hasAccessToOrganizationActionsScope = true;
    }
    this.owner.register('service:access-control', AccessControlStub);
  });

  test('it should display a list of participations', async function (assert) {
    // given
    const participation1 = EmberObject.create({
      firstName: 'Jean',
      lastName: 'Claude',
    });
    const participation2 = EmberObject.create({
      firstName: 'Jean',
      lastName: 'Pierre',
    });
    const participations = [participation1, participation2];
    this.set('participations', participations);
    participations.meta = { rowCount: 2 };

    // when
    const screen = await render(hbs`<Campaigns::ParticipationsSection @participations={{this.participations}} />`);

    // then
    assert.strictEqual(screen.getAllByLabelText('participation').length, 2);
  });

  test('it should display participantExternalId column if idPixLabel is set', async function (assert) {
    // given
    const participation = EmberObject.create({
      participantExternalId: '123',
    });
    const participations = [participation];
    this.set('participations', participations);
    this.set('idPixLabel', 'identifiant');
    participations.meta = { rowCount: 2 };

    // when
    const screen = await render(
      hbs`<Campaigns::ParticipationsSection @participations={{this.participations}} @idPixLabel={{this.idPixLabel}} />`,
    );

    // then
    assert.dom(screen.getByText('identifiant')).exists();
  });

  test('it should display an empty table when no participations', async function (assert) {
    // given
    const participations = [];
    this.set('participations', participations);
    participations.meta = { rowCount: 2 };

    // when
    const screen = await render(hbs`<Campaigns::ParticipationsSection @participations={{this.participations}} />`);

    // then
    assert.dom(screen.getByText('Aucune participation')).exists();
  });
});
