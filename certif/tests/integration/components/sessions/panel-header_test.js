import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { render } from '@1024pix/ember-testing-library';

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
    const { getByRole } = await render(hbs`<Sessions::PanelHeader />`);

    // then
    assert.dom(getByRole('link', { name: 'Créer une session' })).exists();
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
      const { queryByRole } = await render(hbs`<Sessions::PanelHeader />`);

      // then
      assert.dom(queryByRole('link', { name: 'Créer/éditer plusieurs sessions' })).doesNotExist();
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
      const screen = await render(hbs`<Sessions::PanelHeader />`);

      // then
      const createOneSessionButton = screen.getByRole('link', { name: 'Créer une session' });
      const createOrEditMultipleSessionsButton = screen.getByRole('link', { name: 'Créer/éditer plusieurs sessions' });
      const buttonsInTheRightOrder = createOrEditMultipleSessionsButton.compareDocumentPosition(createOneSessionButton);
      assert.strictEqual(buttonsInTheRightOrder, Node.DOCUMENT_POSITION_FOLLOWING);
    });
  });
});
