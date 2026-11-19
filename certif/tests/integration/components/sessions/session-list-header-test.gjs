import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import SessionListHeader from 'pix-certif/components/sessions/session-list-header';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | panel-header', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders a link to the new session creation page', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
      type: 'SCO',
      isRelatedToManagingStudentsOrganization: true,
    });

    class CurrentUserStub extends Service {
      currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
    }

    this.owner.register('service:current-user', CurrentUserStub);

    // when
    const { getByRole } = await render(<template><SessionListHeader /></template>);

    // then
    assert.dom(getByRole('link', { name: t('pages.sessions.list.actions.creation.label') })).exists();
  });

  module('when certification center is a type SCO which manages students', function () {
    test('it does not render a link to the session import page', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        type: 'SCO',
        isRelatedToManagingStudentsOrganization: true,
      });

      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }

      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const { queryByRole } = await render(<template><SessionListHeader /></template>);

      // then
      assert
        .dom(queryByRole('link', { name: t('pages.sessions.list.actions.multiple-creation-edition.label') }))
        .doesNotExist();
    });
  });

  module('when top level domain is org and current locale is english', function () {
    test('it does not render a link to the session import page', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        type: 'SUP',
        isRelatedToManagingStudentsOrganization: false,
      });

      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const currentDomain = this.owner.lookup('service:current-domain');
      sinon.stub(currentDomain, 'getExtension').returns('org');

      const locale = this.owner.lookup('service:locale');
      sinon.stub(locale, 'currentLocale').value('en');

      // when
      const { queryByRole } = await render(<template><SessionListHeader /></template>);

      // then
      assert
        .dom(queryByRole('link', { name: t('pages.sessions.list.actions.multiple-creation-edition.label') }))
        .doesNotExist();
    });
  });

  module('when certification center is not a type SCO which manages students', function () {
    test('it renders a link to the session import page', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        type: 'SUP',
        isRelatedToManagingStudentsOrganization: false,
      });

      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }

      this.owner.register('service:current-user', CurrentUserStub);

      // when
      const screen = await render(<template><SessionListHeader /></template>);

      // then
      const createOneSessionButton = screen.getByRole('link', {
        name: t('pages.sessions.list.actions.creation.label'),
      });
      const createOrEditMultipleSessionsButton = screen.getByRole('link', {
        name: t('pages.sessions.list.actions.multiple-creation-edition.label'),
      });
      const buttonsInTheRightOrder = createOrEditMultipleSessionsButton.compareDocumentPosition(createOneSessionButton);
      assert.strictEqual(buttonsInTheRightOrder, Node.DOCUMENT_POSITION_FOLLOWING);
    });
  });
});
