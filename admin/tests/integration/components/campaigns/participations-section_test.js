import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | Campaigns | participations-section', function (hooks) {
  setupRenderingTest(hooks);

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
    await render(hbs`<Campaigns::ParticipationsSection @participations={{participations}}/>`);

    // then
    assert.dom('[aria-label="participation"]').exists({ count: 2 });
  });

  test('it should display firstName, lastName and createdAt', async function (assert) {
    // given
    const participation = EmberObject.create({
      firstName: 'Jean',
      lastName: 'Claude',
      createdAt: new Date('2020-01-01'),
    });
    const participations = [participation];
    this.set('participations', participations);
    participations.meta = { rowCount: 1 };

    // when
    await render(hbs`<Campaigns::ParticipationsSection @participations={{participations}}/>`);

    // then
    assert.contains('Jean');
    assert.contains('Claude');
    assert.contains('01/01/2020');
  });

  test('it should not display participantExternalId if idPixLabel is null', async function (assert) {
    // given
    const participation = EmberObject.create({
      participantExternalId: '123',
    });
    const participations = [participation];
    this.set('participations', participations);
    this.set('idPixLabel', null);
    participations.meta = { rowCount: 1 };

    // when
    await render(
      hbs`<Campaigns::ParticipationsSection @participations={{participations}} @idPixLabel={{idPixLabel}}/>`
    );

    // then
    assert.notContains('123');
  });

  test('it should display participantExternalId if idPixLabel is set', async function (assert) {
    // given
    const participation = EmberObject.create({
      participantExternalId: '123',
    });
    const participations = [participation];
    this.set('participations', participations);
    this.set('idPixLabel', 'identifiant');
    participations.meta = { rowCount: 1 };

    // when
    await render(
      hbs`<Campaigns::ParticipationsSection @participations={{participations}} @idPixLabel={{idPixLabel}}/>`
    );

    // then
    assert.contains('identifiant');
    assert.contains('123');
  });

  test('it should display shared date if participation is shared', async function (assert) {
    // given
    const participation = EmberObject.create({
      sharedAt: new Date('2020-01-01'),
    });
    const participations = [participation];
    this.set('participations', participations);
    participations.meta = { rowCount: 1 };

    // when
    await render(hbs`<Campaigns::ParticipationsSection @participations={{participations}}/>`);

    // then
    assert.contains('01/01/2020');
  });

  test('it should an empty table when no participations', async function (assert) {
    // given
    const participations = [];
    this.set('participations', participations);
    participations.meta = { rowCount: 2 };

    // when
    await render(hbs`<Campaigns::ParticipationsSection @participations={{participations}}/>`);

    // then
    assert.contains('Aucune participation');
  });
});
