import { render as renderScreen } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
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
      id: '12345',
      date: '2020-01-01',
      time: '12:00:00',
      room: 'Salle 12',
      examiner: 'Star Lord',
      address: 'centre de certification 1',
      certificationCandidates: [],
      accessCode: 'ACCES1',
    });

    this.set('sessionForSupervising', sessionForSupervising);

    // when
    const screen = await renderScreen(hbs`<SessionSupervising::Header @session={{this.sessionForSupervising}} />`);

    // then
    const termsList = screen.getAllByRole('term');
    const definitionsList = screen.getAllByRole('definition');

    assert.dom(screen.getByText('Session 12345')).exists();
    assert.dom(screen.getByText('01/01/2020 · 12:00')).exists();

    assert.strictEqual(termsList[0].textContent.trim(), 'Nom du site');
    assert.strictEqual(definitionsList[0].textContent.trim(), 'centre de certification 1');

    assert.strictEqual(termsList[1].textContent.trim(), 'Salle');
    assert.strictEqual(definitionsList[1].textContent.trim(), 'Salle 12');

    assert.strictEqual(termsList[2].textContent.trim(), 'Surveillant(s)');
    assert.strictEqual(definitionsList[2].textContent.trim(), 'Star Lord');

    assert.strictEqual(termsList[3].textContent.trim(), "Code d'accès (candidats)");
    assert.strictEqual(definitionsList[3].textContent.trim(), 'ACCES1');
  });

  module("when 'Quitter' button is clicked", function () {
    test('it opens the confirmation modal', async function (assert) {
      // given
      const sessionForSupervising = store.createRecord('session-for-supervising', {
        id: '12345',
        date: '2020-01-01',
        time: '12:00:00',
        room: 'Salle 12',
        examiner: 'Star Lord',
        certificationCandidates: [],
      });

      this.set('sessionForSupervising', sessionForSupervising);

      // when
      const screen = await renderScreen(hbs`<SessionSupervising::Header @session={{this.sessionForSupervising}} />`);

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
        id: '12345',
        date: '2020-01-01',
        time: '12:00:00',
        room: 'Salle 12',
        examiner: 'Star Lord',
        certificationCandidates: [],
      });

      this.set('sessionForSupervising', sessionForSupervising);

      // when
      const screen = await renderScreen(hbs`<SessionSupervising::Header @session={{this.sessionForSupervising}} />`);

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
        id: '12345',
        date: '2020-01-01',
        time: '12:00:00',
        room: 'Salle 12',
        examiner: 'Star Lord',
        certificationCandidates: [],
      });

      const replaceWithStub = sinon.stub();

      class routerServiceStub extends Service {
        replaceWith = replaceWithStub;
      }
      this.owner.register('service:router', routerServiceStub);

      this.set('sessionForSupervising', sessionForSupervising);

      // when
      const screen = await renderScreen(hbs`<SessionSupervising::Header @session={{this.sessionForSupervising}} />`);

      await click(screen.getByRole('button', { name: 'Quitter la surveillance de la session 12345' }));
      await screen.findByRole('dialog');
      await click(screen.getByRole('button', { name: 'Quitter la surveillance' }));
      await waitForDialogClose();

      // then
      assert.dom(screen.queryByRole('heading', { name: 'Quitter la surveillance de la session 12345' })).doesNotExist();
    });
  });
});
