import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | routes/authenticated/publishable-sessions | list-items', function(hooks) {

  setupRenderingTest(hooks);

  test('it should display publishable sessions list', async function(assert) {
    // given
    const firstSession = {
      id: '1',
      certificationCenterName: 'Centre SCO des Anne-Étoiles',
      sessionDate: new Date('2021-01-01'),
      sessionTime: '11:00:00',
      finalizedAt: new Date('2021-01-02T03:00:00Z'),
    };
    const secondSession = {
      id: '2',
      certificationCenterName: 'Pix Center',
      sessionDate: new Date('2021-02-02'),
      sessionTime: '12:00:00',
      finalizedAt: new Date('2021-02-03T03:00:00Z'),
    };
    const thirdSession = {
      id: '3',
      certificationCenterName: 'Hogwarts',
      sessionDate: new Date('2021-03-03'),
      sessionTime: '13:00:00',
      finalizedAt: new Date('2021-03-04T03:00:00Z'),
    };
    this.publishableSessions = [ firstSession, secondSession, thirdSession];

    // when
    await render(hbs`<PublishableSessions::ListItems @publishableSessions={{this.publishableSessions}}/>`);

    // then
    assert.dom('table tbody tr').exists({ count: 3 });
    assert.contains('Centre SCO des Anne-Étoiles');
    assert.contains('Pix Center');
    assert.contains('Hogwarts');
  });

  test('it should "Aucun résultat" if there are no sessions to show', async function(assert) {
    // given
    this.publishableSessions = [];

    // when
    await render(hbs`<PublishableSessions::ListItems @publishableSessions={{this.publishableSessions}}/>`);

    // then
    assert.contains('Aucun résultat');
  });

  test('it should show confirmation modal when one clicks on "Publier" button', async function(assert) {
    // given
    const session = {
      id: '1',
      certificationCenterName: 'Centre SCO des Anne-Étoiles',
      sessionDate: new Date('2021-01-01'),
      sessionTime: '11:00:00',
      finalizedAt: new Date('2021-01-02T03:00:00Z'),
    };
    this.publishableSessions = [ session ];
    await render(hbs`<PublishableSessions::ListItems @publishableSessions={{this.publishableSessions}}/>`);

    // when
    await click('[aria-label="Publier la session numéro 1"]');

    // then
    assert.contains('Souhaitez-vous publier la session ?');
  });

  test('it should call provided publishModel "action" with the right published session as argument', async function(assert) {
    // given
    const session = {
      id: '1',
      certificationCenterName: 'Centre SCO des Anne-Étoiles',
      sessionDate: new Date('2021-01-01'),
      sessionTime: '11:00:00',
      finalizedAt: new Date('2021-01-02T03:00:00Z'),
    };
    this.publishableSessions = [ session ];
    this.publishSession = sinon.stub();
    await render(hbs`<PublishableSessions::ListItems @publishableSessions={{this.publishableSessions}} @publishSession={{this.publishSession}}/>`);
    await click('[aria-label="Publier la session numéro 1"]');

    // when
    await click('.btn-primary');

    // then
    sinon.assert.calledWith(this.publishSession, session);
    assert.ok(true);
  });

});
