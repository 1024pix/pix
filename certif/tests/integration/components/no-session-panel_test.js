import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { render } from '@1024pix/ember-testing-library';

module('Integration | Component | no-session-panel', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders a button link to the new session creation page', async function (assert) {
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
    const { getByRole } = await render(hbs`<NoSessionPanel />`);

    // then
    assert.dom(getByRole('link', { name: 'Créer une session' })).exists();
  });

  module('when certification center is not a type SCO which manages students', function () {
    test('it renders a button link to the sessions import page', async function (assert) {
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
      const { getByRole } = await render(hbs`<NoSessionPanel />`);

      // then
      assert.dom(getByRole('link', { name: 'Créer plusieurs sessions' })).exists();
    });
  });

  module('when certification center is a type SCO which manages students', function () {
    test('it does not render a button link to the sessions import page', async function (assert) {
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
      const { queryByRole } = await render(hbs`<NoSessionPanel />`);

      // then
      assert.dom(queryByRole('link', { name: 'Créer plusieurs sessions' })).doesNotExist();
    });
  });
});
