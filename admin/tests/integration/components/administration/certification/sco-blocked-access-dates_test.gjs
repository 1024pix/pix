import { render } from '@1024pix/ember-testing-library';
import { PixToastContainer } from '@1024pix/nebulix-ember';
import { triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ScoBlockedAccessDates from 'pix-admin/components/administration/certification/sco-blocked-access-dates';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | administration/certification/sco-blocked-access-dates', function (hooks) {
  setupIntlRenderingTest(hooks);
  test('it should display sco blocked access dates', async function (assert) {
    // given
    const model = [
      { id: 'COLLEGE', reopeningDate: new Date('2025-11-15') },
      { id: 'LYCEE', reopeningDate: new Date('2025-10-15') },
    ];

    // when
    const screen = await render(<template><ScoBlockedAccessDates @scoBlockedAccessDates={{model}} /></template>);

    // then
    assert
      .dom(screen.getByRole('heading', { name: t('pages.administration.certification.sco-blocked-access-date.title') }))
      .exists();
    assert
      .dom(
        screen.getByText(
          t('pages.administration.certification.sco-blocked-access-date.high-school-date') +
            ' 15/10/2025 ' +
            t('pages.administration.certification.sco-blocked-access-date.hour'),
        ),
      )
      .exists();
    assert
      .dom(
        screen.getByText(
          t('pages.administration.certification.sco-blocked-access-date.middle-school-date') +
            ' 15/11/2025 ' +
            t('pages.administration.certification.sco-blocked-access-date.hour'),
        ),
      )
      .exists();
  });

  test('it should display an input when modify button is clicked', async function (assert) {
    // given
    const model = [
      { id: 'COLLEGE', reopeningDate: new Date('2025-11-15') },
      { id: 'LYCEE', reopeningDate: new Date('2025-10-15') },
    ];

    // when
    const screen = await render(<template><ScoBlockedAccessDates @scoBlockedAccessDates={{model}} /></template>);

    const modifyButtons = await screen.getAllByText(
      t('pages.administration.certification.sco-blocked-access-date.modify-button'),
    );
    await triggerEvent(modifyButtons[0], 'click');

    // then
    assert
      .dom(
        await screen.getByLabelText(t('pages.administration.certification.sco-blocked-access-date.high-school-date')),
      )
      .exists();
  });

  test('it should display a success notification when the date modification succeeds', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const adapter = store.adapterFor('sco-blocked-access-date');
    sinon.stub(adapter, 'updateRecord').resolves();

    const model = [
      { id: 'COLLEGE', reopeningDate: new Date('2025-11-15') },
      { id: 'LYCEE', reopeningDate: new Date('2025-10-15') },
    ];

    // when
    const screen = await render(
      <template>
        <ScoBlockedAccessDates @scoBlockedAccessDates={{model}} /><PixToastContainer @closeButtonAriaLabel="Close" />
      </template>,
    );

    const modifyButtons = await screen.getAllByText(
      t('pages.administration.certification.sco-blocked-access-date.modify-button'),
    );
    await triggerEvent(modifyButtons[0], 'click');
    const saveButton = await screen.getByText(
      t('pages.administration.certification.sco-blocked-access-date.save-button'),
    );
    await triggerEvent(saveButton, 'click');

    // then
    assert.dom(await screen.getByText(t('pages.administration.certification.sco-blocked-access-date.error'))).exists();
  });
  test('it should display an error notification when the date modification fails', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const adapter = store.adapterFor('sco-blocked-access-date');
    sinon.stub(adapter, 'updateRecord').rejects();

    const model = [
      { id: 'COLLEGE', reopeningDate: new Date('2025-11-15') },
      { id: 'LYCEE', reopeningDate: new Date('2025-10-15') },
    ];

    // when
    const screen = await render(
      <template>
        <ScoBlockedAccessDates @scoBlockedAccessDates={{model}} /><PixToastContainer @closeButtonAriaLabel="Close" />
      </template>,
    );

    const modifyButtons = await screen.getAllByText(
      t('pages.administration.certification.sco-blocked-access-date.modify-button'),
    );
    await triggerEvent(modifyButtons[0], 'click');
    const saveButton = await screen.getByText(
      t('pages.administration.certification.sco-blocked-access-date.save-button'),
    );
    await triggerEvent(saveButton, 'click');

    // then
    assert.dom(await screen.getByText(t('pages.administration.certification.sco-blocked-access-date.error'))).exists();
  });

  test('it should display "Non renseigné" when dates are not configured', async function (assert) {
    // given
    const model = [];

    // when
    const screen = await render(<template><ScoBlockedAccessDates @scoBlockedAccessDates={{model}} /></template>);

    // then
    assert
      .dom(screen.getByRole('heading', { name: t('pages.administration.certification.sco-blocked-access-date.title') }))
      .exists();
    assert
      .dom(
        screen.getByText(
          t('pages.administration.certification.sco-blocked-access-date.high-school-date') +
            ' ' +
            t('pages.administration.certification.sco-blocked-access-date.not-configured'),
        ),
      )
      .exists();
    assert
      .dom(
        screen.getByText(
          t('pages.administration.certification.sco-blocked-access-date.middle-school-date') +
            ' ' +
            t('pages.administration.certification.sco-blocked-access-date.not-configured'),
        ),
      )
      .exists();
  });
});
