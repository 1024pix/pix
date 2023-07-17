import { module, test } from 'qunit';
import { click } from '@ember/test-helpers';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

import { hbs } from 'ember-cli-htmlbars';
import { waitForDialogClose } from '../../../helpers/wait-for';

module('Integration | Component | SessionSupervising::Header', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  test('it renders the session information', async function (assert) {
    // given
    const sessionForSupervising = store.createRecord('session-for-supervising', {
      id: 12345,
      date: '2020-01-01',
      time: '12:00:00',
      room: 'Salle 12',
      examiner: 'Star Lord',
      certificationCenterName: 'Knowhere',
      certificationCandidates: [],
      accessCode: 'ACCES1',
    });

    this.set('sessionForSupervising', sessionForSupervising);

    // when
    const screen = await renderScreen(hbs`<SessionSupervising::Header @session={{this.sessionForSupervising}}  />`);

    // then
    assert.dom(screen.getByText('Session 12345')).exists();
    assert.dom(screen.getByText('Salle 12')).exists();
    assert.dom(screen.getByText('Star Lord')).exists();
    assert.dom(screen.getByText('ACCES1')).exists();
    assert.dom(screen.getByText('01/01/2020 · 12:00')).exists();
  });

  module("when 'Quitter' button is clicked", function () {
    test('it opens the confirmation modal', async function (assert) {
      // given
      const sessionForSupervising = store.createRecord('session-for-supervising', {
        id: 12345,
        date: '2020-01-01',
        time: '12:00:00',
        room: 'Salle 12',
        examiner: 'Star Lord',
        certificationCenterName: 'Knowhere',
        certificationCandidates: [],
      });

      this.set('sessionForSupervising', sessionForSupervising);

      // when
      const screen = await renderScreen(hbs`<SessionSupervising::Header @session={{this.sessionForSupervising}}  />`);

      await click(screen.getByRole('button', { name: 'Quitter la surveillance de la session 12345' }));
      await screen.findByRole('dialog');

      // then
      assert.dom(screen.getByRole('heading', { name: 'Quitter la surveillance de la session 12345' })).exists();
      assert
        .dom(
          screen.getByText(
            'Attention, assurez-vous que tous les candidats aient terminé leur test avant de quitter la surveillance. Pour reprendre la surveillance de cette session, vous devrez entrer à nouveau son numéro de session et son mot de passe.',
          ),
        )
        .exists();
    });
  });

  module('when confirmation modal closing button is clicked', function () {
    test('it closes the confirmation modal', async function (assert) {
      // given
      const sessionForSupervising = store.createRecord('session-for-supervising', {
        id: 12345,
        date: '2020-01-01',
        time: '12:00:00',
        room: 'Salle 12',
        examiner: 'Star Lord',
        certificationCenterName: 'Knowhere',
        certificationCandidates: [],
      });

      this.set('sessionForSupervising', sessionForSupervising);

      // when
      const screen = await renderScreen(hbs`<SessionSupervising::Header @session={{this.sessionForSupervising}}  />`);

      await click(screen.getByRole('button', { name: 'Quitter la surveillance de la session 12345' }));
      await screen.findByRole('dialog');
      await click(screen.getByRole('button', { name: 'Fermer' }));
      await waitForDialogClose();

      // then
      assert.dom(screen.queryByRole('heading', { name: 'Quitter la surveillance de la session 12345' })).doesNotExist();
    });
  });

  module('when confirmation modal confirmation button is clicked', function () {
    test('it closes the confirmation modal and redirect to "login-session-supervisor"', async function (assert) {
      // given
      const sessionForSupervising = store.createRecord('session-for-supervising', {
        id: 12345,
        date: '2020-01-01',
        time: '12:00:00',
        room: 'Salle 12',
        examiner: 'Star Lord',
        certificationCenterName: 'Knowhere',
        certificationCandidates: [],
      });

      const replaceWithStub = sinon.stub();

      class routerServiceStub extends Service {
        replaceWith = replaceWithStub;
      }
      this.owner.register('service:router', routerServiceStub);

      this.set('sessionForSupervising', sessionForSupervising);

      // when
      const screen = await renderScreen(hbs`<SessionSupervising::Header @session={{this.sessionForSupervising}}  />`);

      await click(screen.getByRole('button', { name: 'Quitter la surveillance de la session 12345' }));
      await screen.findByRole('dialog');
      await click(screen.getByRole('button', { name: 'Quitter la surveillance' }));
      await waitForDialogClose();

      // then
      assert.dom(screen.queryByRole('heading', { name: 'Quitter la surveillance de la session 12345' })).doesNotExist();
    });
  });
});
