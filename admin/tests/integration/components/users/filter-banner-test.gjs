import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { waitForElementToBeRemoved } from '@testing-library/dom';
import UsersFilterBanner from 'pix-admin/components/users/filter-banner';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest, { t } from '../../../helpers/setup-intl-rendering';

module('Integration | Component | users | filter-banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('display filter banner to search users', function () {
    test('it should display filter banner components', async function (assert) {
      // given
      const refreshUsersList = sinon.stub();
      const onChangeQueryType = sinon.stub();
      const onChangeUserId = sinon.stub();
      const onChangeFirstName = sinon.stub();
      const onChangeLastName = sinon.stub();
      const onChangeEmail = sinon.stub();
      const onChangeUsername = sinon.stub();
      const clearSearchFields = sinon.stub();

      const screen = await render(
        <template>
          <UsersFilterBanner
            @refreshUsersList={{refreshUsersList}}
            @onChangeQueryType={{onChangeQueryType}}
            @onChangeUserId={{onChangeUserId}}
            @onChangeFirstName={{onChangeFirstName}}
            @onChangeLastName={{onChangeLastName}}
            @onChangeEmail={{onChangeEmail}}
            @onChangeUsername={{onChangeUsername}}
            @clearSearchFields={{clearSearchFields}}
          />
        </template>,
      );

      // when && then
      assert.ok(screen.getByLabelText(t('common.filters.common.selector')));
      assert.ok(screen.getByLabelText(t('common.filters.common.internal-identifier')));
      assert.ok(screen.getByLabelText(t('common.filters.users.firstname')));
      assert.ok(screen.getByLabelText(t('common.filters.users.lastname')));
      assert.ok(screen.getByLabelText(t('common.filters.users.email')));
      assert.ok(screen.getByLabelText(t('common.filters.users.username')));

      assert.ok(screen.getByRole('button', { name: t('common.filters.actions.clear') }));
      assert.ok(screen.getByRole('button', { name: t('common.filters.actions.load') }));
    });

    test('it should call clearSearchFields when click on clear button', async function (assert) {
      // given
      const refreshUsersList = sinon.stub();
      const onChangeQueryType = sinon.stub();
      const onChangeUserId = sinon.stub();
      const onChangeFirstName = sinon.stub();
      const onChangeLastName = sinon.stub();
      const onChangeEmail = sinon.stub();
      const onChangeUsername = sinon.stub();
      const clearSearchFields = sinon.stub();

      const screen = await render(
        <template>
          <UsersFilterBanner
            @refreshUsersList={{refreshUsersList}}
            @onChangeQueryType={{onChangeQueryType}}
            @onChangeUserId={{onChangeUserId}}
            @onChangeFirstName={{onChangeFirstName}}
            @onChangeLastName={{onChangeLastName}}
            @onChangeEmail={{onChangeEmail}}
            @onChangeUsername={{onChangeUsername}}
            @clearSearchFields={{clearSearchFields}}
          />
        </template>,
      );

      // when
      await click(screen.getByRole('button', { name: t('common.filters.actions.clear') }));

      // then
      assert.ok(clearSearchFields.calledOnce);
    });

    test('it should call refreshUsersList when click on search button', async function (assert) {
      // given
      const refreshUsersList = sinon.stub();
      const onChangeQueryType = sinon.stub();
      const onChangeUserId = sinon.stub();
      const onChangeFirstName = sinon.stub();
      const onChangeLastName = sinon.stub();
      const onChangeEmail = sinon.stub();
      const onChangeUsername = sinon.stub();
      const clearSearchFields = sinon.stub();

      const screen = await render(
        <template>
          <UsersFilterBanner
            @refreshUsersList={{refreshUsersList}}
            @onChangeQueryType={{onChangeQueryType}}
            @onChangeUserId={{onChangeUserId}}
            @onChangeFirstName={{onChangeFirstName}}
            @onChangeLastName={{onChangeLastName}}
            @onChangeEmail={{onChangeEmail}}
            @onChangeUsername={{onChangeUsername}}
            @clearSearchFields={{clearSearchFields}}
          />
        </template>,
      );

      // when
      await click(screen.getByRole('button', { name: t('common.filters.actions.load') }));

      // then
      assert.ok(refreshUsersList.calledOnce);
    });
  });

  module('selector', function () {
    test('it should render selector list with default selected', async function (assert) {
      // given
      const refreshUsersList = sinon.stub();
      const onChangeQueryType = sinon.stub();
      const onChangeUserId = sinon.stub();
      const onChangeFirstName = sinon.stub();
      const onChangeLastName = sinon.stub();
      const onChangeEmail = sinon.stub();
      const onChangeUsername = sinon.stub();
      const clearSearchFields = sinon.stub();

      // when
      const screen = await render(
        <template>
          <UsersFilterBanner
            @queryTypeForm="EXACT_QUERY"
            @refreshUsersList={{refreshUsersList}}
            @onChangeQueryType={{onChangeQueryType}}
            @onChangeUserId={{onChangeUserId}}
            @onChangeFirstName={{onChangeFirstName}}
            @onChangeLastName={{onChangeLastName}}
            @onChangeEmail={{onChangeEmail}}
            @onChangeUsername={{onChangeUsername}}
            @clearSearchFields={{clearSearchFields}}
          />
        </template>,
      );

      // then
      const selector = screen.getByLabelText(t('common.filters.common.selector'));

      await click(selector);
      await screen.findByRole('listbox');

      assert.ok(screen.getByRole('option', { name: t('pages.users-list.query.exact'), selected: true }));
      assert.ok(screen.getByRole('option', { name: t('pages.users-list.query.contains'), selected: false }));
    });

    test('it should call onChangeQueryTypeon change selector', async function (assert) {
      // given
      const refreshUsersList = sinon.stub();
      const onChangeQueryType = sinon.stub();
      const onChangeUserId = sinon.stub();
      const onChangeFirstName = sinon.stub();
      const onChangeLastName = sinon.stub();
      const onChangeEmail = sinon.stub();
      const onChangeUsername = sinon.stub();
      const clearSearchFields = sinon.stub();

      const screen = await render(
        <template>
          <UsersFilterBanner
            @queryTypeForm="EXACT_QUERY"
            @refreshUsersList={{refreshUsersList}}
            @onChangeQueryType={{onChangeQueryType}}
            @onChangeUserId={{onChangeUserId}}
            @onChangeFirstName={{onChangeFirstName}}
            @onChangeLastName={{onChangeLastName}}
            @onChangeEmail={{onChangeEmail}}
            @onChangeUsername={{onChangeUsername}}
            @clearSearchFields={{clearSearchFields}}
          />
        </template>,
      );

      // when
      const selector = screen.getByLabelText(t('common.filters.common.selector'));

      await click(selector);

      await screen.findByRole('listbox');

      await Promise.all([
        waitForElementToBeRemoved(() => screen.queryByRole('listbox')),
        click(screen.getByRole('option', { name: t('pages.users-list.query.contains') })),
      ]);

      // then
      assert.ok(onChangeQueryType.calledOnce);
    });
  });

  module('internal identifier', function () {
    test('it should display default value on internal identifier', async function (assert) {
      // given
      const refreshUsersList = sinon.stub();
      const onChangeQueryType = sinon.stub();
      const onChangeUserId = sinon.stub();
      const onChangeFirstName = sinon.stub();
      const onChangeLastName = sinon.stub();
      const onChangeEmail = sinon.stub();
      const onChangeUsername = sinon.stub();
      const clearSearchFields = sinon.stub();

      const screen = await render(
        <template>
          <UsersFilterBanner
            @idForm="12"
            @refreshUsersList={{refreshUsersList}}
            @onChangeQueryType={{onChangeQueryType}}
            @onChangeUserId={{onChangeUserId}}
            @onChangeFirstName={{onChangeFirstName}}
            @onChangeLastName={{onChangeLastName}}
            @onChangeEmail={{onChangeEmail}}
            @onChangeUsername={{onChangeUsername}}
            @clearSearchFields={{clearSearchFields}}
          />
        </template>,
      );

      // when & then
      assert.dom(screen.getByLabelText(t('common.filters.common.internal-identifier'))).hasValue('12');
    });

    test('it should call onChangeUserId on input', async function (assert) {
      // given
      const refreshUsersList = sinon.stub();
      const onChangeQueryType = sinon.stub();
      const onChangeUserId = sinon.stub();
      const onChangeFirstName = sinon.stub();
      const onChangeLastName = sinon.stub();
      const onChangeEmail = sinon.stub();
      const onChangeUsername = sinon.stub();
      const clearSearchFields = sinon.stub();

      const screen = await render(
        <template>
          <UsersFilterBanner
            @refreshUsersList={{refreshUsersList}}
            @onChangeQueryType={{onChangeQueryType}}
            @onChangeUserId={{onChangeUserId}}
            @onChangeFirstName={{onChangeFirstName}}
            @onChangeLastName={{onChangeLastName}}
            @onChangeEmail={{onChangeEmail}}
            @onChangeUsername={{onChangeUsername}}
            @clearSearchFields={{clearSearchFields}}
          />
        </template>,
      );

      // then
      const input = screen.getByLabelText(t('common.filters.common.internal-identifier'));

      await fillIn(input, '12');

      assert.ok(onChangeUserId.calledOnce);
    });
  });

  module('firstname', function () {
    test('it should display given value on user first name', async function (assert) {
      // given
      const refreshUsersList = sinon.stub();
      const onChangeQueryType = sinon.stub();
      const onChangeUserId = sinon.stub();
      const onChangeFirstName = sinon.stub();
      const onChangeLastName = sinon.stub();
      const onChangeEmail = sinon.stub();
      const onChangeUsername = sinon.stub();
      const clearSearchFields = sinon.stub();

      const screen = await render(
        <template>
          <UsersFilterBanner
            @firstNameForm="Jane"
            @refreshUsersList={{refreshUsersList}}
            @onChangeQueryType={{onChangeQueryType}}
            @onChangeUserId={{onChangeUserId}}
            @onChangeFirstName={{onChangeFirstName}}
            @onChangeLastName={{onChangeLastName}}
            @onChangeEmail={{onChangeEmail}}
            @onChangeUsername={{onChangeUsername}}
            @clearSearchFields={{clearSearchFields}}
          />
        </template>,
      );

      // when & then
      assert.dom(screen.getByLabelText(t('common.filters.users.firstname'))).hasValue('Jane');
    });

    test('it should call onChangeFirstName on input', async function (assert) {
      // given
      const refreshUsersList = sinon.stub();
      const onChangeQueryType = sinon.stub();
      const onChangeUserId = sinon.stub();
      const onChangeFirstName = sinon.stub();
      const onChangeLastName = sinon.stub();
      const onChangeEmail = sinon.stub();
      const onChangeUsername = sinon.stub();
      const clearSearchFields = sinon.stub();

      const screen = await render(
        <template>
          <UsersFilterBanner
            @refreshUsersList={{refreshUsersList}}
            @onChangeQueryType={{onChangeQueryType}}
            @onChangeUserId={{onChangeUserId}}
            @onChangeFirstName={{onChangeFirstName}}
            @onChangeLastName={{onChangeLastName}}
            @onChangeEmail={{onChangeEmail}}
            @onChangeUsername={{onChangeUsername}}
            @clearSearchFields={{clearSearchFields}}
          />
        </template>,
      );

      // then
      const input = screen.getByLabelText(t('common.filters.users.firstname'));

      await fillIn(input, '12');

      assert.ok(onChangeFirstName.calledOnce);
    });
  });

  module('lastname', function () {
    test('it should display given value on user firstname', async function (assert) {
      // given
      const refreshUsersList = sinon.stub();
      const onChangeQueryType = sinon.stub();
      const onChangeUserId = sinon.stub();
      const onChangeFirstName = sinon.stub();
      const onChangeLastName = sinon.stub();
      const onChangeEmail = sinon.stub();
      const onChangeUsername = sinon.stub();
      const clearSearchFields = sinon.stub();

      const screen = await render(
        <template>
          <UsersFilterBanner
            @lastNameForm="Doe"
            @refreshUsersList={{refreshUsersList}}
            @onChangeQueryType={{onChangeQueryType}}
            @onChangeUserId={{onChangeUserId}}
            @onChangeFirstName={{onChangeFirstName}}
            @onChangeLastName={{onChangeLastName}}
            @onChangeEmail={{onChangeEmail}}
            @onChangeUsername={{onChangeUsername}}
            @clearSearchFields={{clearSearchFields}}
          />
        </template>,
      );

      // when & then
      assert.dom(screen.getByLabelText(t('common.filters.users.lastname'))).hasValue('Doe');
    });

    test('it should call onChangeLastName on input', async function (assert) {
      // given
      const refreshUsersList = sinon.stub();
      const onChangeQueryType = sinon.stub();
      const onChangeUserId = sinon.stub();
      const onChangeFirstName = sinon.stub();
      const onChangeLastName = sinon.stub();
      const onChangeEmail = sinon.stub();
      const onChangeUsername = sinon.stub();
      const clearSearchFields = sinon.stub();

      const screen = await render(
        <template>
          <UsersFilterBanner
            @refreshUsersList={{refreshUsersList}}
            @onChangeQueryType={{onChangeQueryType}}
            @onChangeUserId={{onChangeUserId}}
            @onChangeFirstName={{onChangeFirstName}}
            @onChangeLastName={{onChangeLastName}}
            @onChangeEmail={{onChangeEmail}}
            @onChangeUsername={{onChangeUsername}}
            @clearSearchFields={{clearSearchFields}}
          />
        </template>,
      );

      // then
      const input = screen.getByLabelText(t('common.filters.users.lastname'));

      await fillIn(input, '12');

      assert.ok(onChangeLastName.calledOnce);
    });
  });

  module('email', function () {
    test('it should display given value on user firstname', async function (assert) {
      // given
      const refreshUsersList = sinon.stub();
      const onChangeQueryType = sinon.stub();
      const onChangeUserId = sinon.stub();
      const onChangeFirstName = sinon.stub();
      const onChangeLastName = sinon.stub();
      const onChangeEmail = sinon.stub();
      const onChangeUsername = sinon.stub();
      const clearSearchFields = sinon.stub();

      const screen = await render(
        <template>
          <UsersFilterBanner
            @emailForm="jane.doe@unknown.org"
            @refreshUsersList={{refreshUsersList}}
            @onChangeQueryType={{onChangeQueryType}}
            @onChangeUserId={{onChangeUserId}}
            @onChangeFirstName={{onChangeFirstName}}
            @onChangeLastName={{onChangeLastName}}
            @onChangeEmail={{onChangeEmail}}
            @onChangeUsername={{onChangeUsername}}
            @clearSearchFields={{clearSearchFields}}
          />
        </template>,
      );

      // when & then
      assert.dom(screen.getByLabelText(t('common.filters.users.email'))).hasValue('jane.doe@unknown.org');
    });

    test('it should call onChangeEmail on input', async function (assert) {
      // given
      const refreshUsersList = sinon.stub();
      const onChangeQueryType = sinon.stub();
      const onChangeUserId = sinon.stub();
      const onChangeFirstName = sinon.stub();
      const onChangeLastName = sinon.stub();
      const onChangeEmail = sinon.stub();
      const onChangeUsername = sinon.stub();
      const clearSearchFields = sinon.stub();

      const screen = await render(
        <template>
          <UsersFilterBanner
            @refreshUsersList={{refreshUsersList}}
            @onChangeQueryType={{onChangeQueryType}}
            @onChangeUserId={{onChangeUserId}}
            @onChangeFirstName={{onChangeFirstName}}
            @onChangeLastName={{onChangeLastName}}
            @onChangeEmail={{onChangeEmail}}
            @onChangeUsername={{onChangeUsername}}
            @clearSearchFields={{clearSearchFields}}
          />
        </template>,
      );

      // then
      const input = screen.getByLabelText(t('common.filters.users.email'));

      await fillIn(input, '12');

      assert.ok(onChangeEmail.calledOnce);
    });
  });

  module('username', function () {
    test('it should display given value on user firstname', async function (assert) {
      // given
      const refreshUsersList = sinon.stub();
      const onChangeQueryType = sinon.stub();
      const onChangeUserId = sinon.stub();
      const onChangeFirstName = sinon.stub();
      const onChangeLastName = sinon.stub();
      const onChangeEmail = sinon.stub();
      const onChangeUsername = sinon.stub();
      const clearSearchFields = sinon.stub();

      const screen = await render(
        <template>
          <UsersFilterBanner
            @usernameForm="jane.doe@unknown.org"
            @refreshUsersList={{refreshUsersList}}
            @onChangeQueryType={{onChangeQueryType}}
            @onChangeUserId={{onChangeUserId}}
            @onChangeFirstName={{onChangeFirstName}}
            @onChangeLastName={{onChangeLastName}}
            @onChangeEmail={{onChangeEmail}}
            @onChangeUsername={{onChangeUsername}}
            @clearSearchFields={{clearSearchFields}}
          />
        </template>,
      );

      // when & then
      assert.dom(screen.getByLabelText(t('common.filters.users.username'))).hasValue('jane.doe@unknown.org');
    });

    test('it should call onChangeEmail on input', async function (assert) {
      // given
      const refreshUsersList = sinon.stub();
      const onChangeQueryType = sinon.stub();
      const onChangeUserId = sinon.stub();
      const onChangeFirstName = sinon.stub();
      const onChangeLastName = sinon.stub();
      const onChangeEmail = sinon.stub();
      const onChangeUsername = sinon.stub();
      const clearSearchFields = sinon.stub();

      const screen = await render(
        <template>
          <UsersFilterBanner
            @refreshUsersList={{refreshUsersList}}
            @onChangeQueryType={{onChangeQueryType}}
            @onChangeUserId={{onChangeUserId}}
            @onChangeFirstName={{onChangeFirstName}}
            @onChangeLastName={{onChangeLastName}}
            @onChangeEmail={{onChangeEmail}}
            @onChangeUsername={{onChangeUsername}}
            @clearSearchFields={{clearSearchFields}}
          />
        </template>,
      );

      // then
      const input = screen.getByLabelText(t('common.filters.users.username'));

      await fillIn(input, '12');

      assert.ok(onChangeUsername.calledOnce);
    });
  });
});
