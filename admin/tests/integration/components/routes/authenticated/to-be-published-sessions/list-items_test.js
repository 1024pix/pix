import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click } from '@ember/test-helpers';
import { render, clickByName } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | routes/authenticated/to-be-published-sessions | list-items', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display to be published sessions list', async function (assert) {
    // given
    const firstSession = {
      id: '1',
      certificationCenterName: 'Centre SCO des Anne-Étoiles',
      sessionDate: '2021-01-01',
      sessionTime: '11:00:00',
      finalizedAt: new Date('2021-01-02T03:00:00Z'),
    };
    const secondSession = {
      id: '2',
      certificationCenterName: 'Pix Center',
      sessionDate: '2021-02-02',
      sessionTime: '12:00:00',
      finalizedAt: new Date('2021-02-03T03:00:00Z'),
    };
    const thirdSession = {
      id: '3',
      certificationCenterName: 'Hogwarts',
      sessionDate: '2021-03-03',
      sessionTime: '13:00:00',
      finalizedAt: new Date('2021-03-04T03:00:00Z'),
    };
    this.toBePublishedSessions = [firstSession, secondSession, thirdSession];

    // when
    const screen = await render(
      hbs`<ToBePublishedSessions::ListItems @toBePublishedSessions={{this.toBePublishedSessions}}/>`
    );

    // then
    assert.dom('table tbody tr').exists({ count: 3 });
    assert.dom(screen.getByText('Centre SCO des Anne-Étoiles')).exists();
    assert.dom(screen.getByText('Pix Center')).exists();
    assert.dom(screen.getByText('Hogwarts')).exists();
  });

  test('it should "Aucun résultat" if there are no sessions to show', async function (assert) {
    // given
    this.toBePublishedSessions = [];

    // when
    const screen = await render(
      hbs`<ToBePublishedSessions::ListItems @toBePublishedSessions={{this.toBePublishedSessions}}/>`
    );

    // then
    assert.dom(screen.getByText('Aucun résultat')).exists();
  });

  test('it should show confirmation modal when one clicks on "Publier" button', async function (assert) {
    // given
    const session = {
      id: '1',
      certificationCenterName: 'Centre SCO des Anne-Étoiles',
      sessionDate: '2021-01-01',
      sessionTime: '11:00:00',
      finalizedAt: new Date('2021-01-02T03:00:00Z'),
    };
    this.toBePublishedSessions = [session];
    const screen = await render(
      hbs`<ToBePublishedSessions::ListItems @toBePublishedSessions={{this.toBePublishedSessions}}/>`
    );

    // when
    await clickByName('Publier la session numéro 1');

    // then
    assert.dom(screen.getByText('Souhaitez-vous publier la session ?')).exists();
  });

  test('it should call provided publishModel "action" with the right published session as argument', async function (assert) {
    // given
    const session = {
      id: '1',
      certificationCenterName: 'Centre SCO des Anne-Étoiles',
      sessionDate: '2021-01-01',
      sessionTime: '11:00:00',
      finalizedAt: new Date('2021-01-02T03:00:00Z'),
    };
    this.toBePublishedSessions = [session];
    this.publishSession = sinon.stub();
    await render(
      hbs`<ToBePublishedSessions::ListItems @toBePublishedSessions={{this.toBePublishedSessions}} @publishSession={{this.publishSession}}/>`
    );
    await clickByName('Publier la session numéro 1');

    // when
    await click('.btn-primary');

    // then
    sinon.assert.calledWith(this.publishSession, session);
    assert.ok(true);
  });
});
