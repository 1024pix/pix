import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import UserQuestChecker from 'pix-admin/components/administration/common/user-quest-checker';
import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component |  administration/user-quest-checker', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display a form', async function (assert) {
    // when
    const screen = await render(<template><UserQuestChecker /></template>);

    // then
    assert.ok(await screen.findByText(t('components.administration.user-quest-checker.title')));
    assert.ok(await screen.findByText(t('components.administration.user-quest-checker.description')));
    assert.ok(await screen.findByText(t('components.administration.user-quest-checker.form.user-id-input-label')));
    assert.ok(await screen.findByText(t('components.administration.user-quest-checker.form.quest-id-input-label')));
    assert.ok(await screen.findByText(t('components.administration.user-quest-checker.form.submit-button')));
  });

  test('should display eligibility on quest for given user id and quest id', async function (assert) {
    // given
    const accessToken = 'an accesstoken';
    class SessionService extends Service {
      data = { authenticated: { access_token: accessToken } };
    }
    this.owner.register('service:session', SessionService);
    sinon
      .stub(window, 'fetch')
      .withArgs(`${ENV.APP.API_HOST}/api/admin/check-user-quest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              'user-id': '1',
              'quest-id': '2',
            },
          },
        }),
      })
      .resolves(fetchResponse({ body: { data: { attributes: { 'is-successful': true } } }, status: 200 }));

    // when
    const screen = await render(<template><UserQuestChecker /></template>);
    await fillIn(screen.getByLabelText(t('components.administration.user-quest-checker.form.user-id-input-label')), 1);
    await fillIn(screen.getByLabelText(t('components.administration.user-quest-checker.form.quest-id-input-label')), 2);
    await click(
      screen.getByRole('button', { name: t('components.administration.user-quest-checker.form.submit-button') }),
    );

    // then
    assert.ok(window.fetch.calledOnce);
    assert.ok(screen.getByText(t('components.administration.user-quest-checker.messages.success')));
  });

  test('should display ineligibility on quest for given user id and quest id', async function (assert) {
    // given
    const accessToken = 'an accesstoken';
    class SessionService extends Service {
      data = { authenticated: { access_token: accessToken } };
    }
    this.owner.register('service:session', SessionService);
    sinon
      .stub(window, 'fetch')
      .withArgs(`${ENV.APP.API_HOST}/api/admin/check-user-quest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              'user-id': '1',
              'quest-id': '2',
            },
          },
        }),
      })
      .resolves(fetchResponse({ body: { data: { attributes: { 'is-successful': false } } }, status: 200 }));

    // when
    const screen = await render(<template><UserQuestChecker /></template>);
    await fillIn(screen.getByLabelText(t('components.administration.user-quest-checker.form.user-id-input-label')), 1);
    await fillIn(screen.getByLabelText(t('components.administration.user-quest-checker.form.quest-id-input-label')), 2);
    await click(
      screen.getByRole('button', { name: t('components.administration.user-quest-checker.form.submit-button') }),
    );

    // then
    assert.ok(window.fetch.calledOnce);
    assert.ok(screen.getByText(t('components.administration.user-quest-checker.messages.error')));
  });
});

function fetchResponse({ body, status }) {
  const mockResponse = new window.Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-type': 'application/json',
    },
  });

  return mockResponse;
}
