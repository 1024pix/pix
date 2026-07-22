import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import SessionCandidates from 'pix-admin/components/sessions/session/session-candidates';
import { module, test } from 'qunit';

import setupIntl from '../../../../helpers/setup-intl';

module('Integration | Component | Sessions | Session | SessionCandidates', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  let store;

  hooks.beforeEach(async function () {
    this.intl = this.owner.lookup('service:intl');
    store = this.owner.lookup('service:store');
  });

  test('it should display candidate with only a core subscription', async function (assert) {
    // given
    const candidate = _buildCertificationCandidate({});
    const certificationCandidates = [store.createRecord('certification-candidate', candidate)];
    const sessionVersion = 3;

    // when
    const screen = await render(
      <template>
        <SessionCandidates @certificationCandidates={{certificationCandidates}} @sessionVersion={{sessionVersion}} />
      </template>,
    );

    // then
    assert
      .dom(screen.getByRole('cell', { name: this.intl.t('pages.sessions.candidates.subscriptions.CORE') }))
      .exists();
  });

  test('it should display candidate with a v2 complementary subscription', async function (assert) {
    // given
    const candidate = _buildCertificationCandidate({
      subscription: 'DROIT',
    });
    const certificationCandidates = [store.createRecord('certification-candidate', candidate)];
    const sessionVersion = 2;

    // when
    const screen = await render(
      <template>
        <SessionCandidates @certificationCandidates={{certificationCandidates}} @sessionVersion={{sessionVersion}} />
      </template>,
    );

    // then
    assert
      .dom(
        screen.getByRole('cell', {
          name: this.intl.t('pages.sessions.candidates.pix-plus-format.complementary', {
            pixPlusLabel: 'Pix+ Droit',
          }),
        }),
      )
      .exists();
  });

  test('it should display candidate with a v3 pix plus subscription', async function (assert) {
    // given
    const candidate = _buildCertificationCandidate({
      subscription: 'DROIT',
    });
    const certificationCandidates = [store.createRecord('certification-candidate', candidate)];
    const sessionVersion = 3;

    // when
    const screen = await render(
      <template>
        <SessionCandidates @certificationCandidates={{certificationCandidates}} @sessionVersion={{sessionVersion}} />
      </template>,
    );

    // then
    assert
      .dom(
        screen.getByRole('cell', {
          name: this.intl.t('pages.sessions.candidates.pix-plus-format.pix-plus', {
            pixPlusLabel: 'Pix+ Droit',
          }),
        }),
      )
      .exists();
  });

  test('it should display candidate with a double subscription', async function (assert) {
    // given
    const candidate = _buildCertificationCandidate({
      subscription: 'CLEA',
    });

    const certificationCandidates = [store.createRecord('certification-candidate', candidate)];
    const sessionVersion = 2;

    // when
    const screen = await render(
      <template>
        <SessionCandidates @certificationCandidates={{certificationCandidates}} @sessionVersion={{sessionVersion}} />
      </template>,
    );
    // then
    assert
      .dom(
        screen.getByRole('cell', {
          name: this.intl.t('pages.sessions.candidates.subscriptions.CLEA'),
        }),
      )
      .exists();
  });
});

function _buildCertificationCandidate({
  id = '12345',
  firstName = 'Eddy',
  lastName = 'Taurial',
  email = 'eddy.taurial@example.com',
  subscription = 'CORE',
}) {
  return {
    id,
    firstName,
    lastName,
    email,
    subscription,
  };
}
