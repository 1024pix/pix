import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { render } from '@1024pix/ember-testing-library';

module('Integration | Component | no-session-panel', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders buttons links to create sessions', async function (assert) {
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
    const screen = await render(hbs`<NoSessionPanel />`);

    // then
    const createOneSessionButton = screen.getByRole('link', { name: 'Créer une session' });
    const createMultipleSessionsButton = screen.getByRole('link', { name: 'Créer plusieurs sessions' });
    assert.dom(createOneSessionButton).exists();
    assert.dom(createMultipleSessionsButton).exists();
    const buttonsInTheRightOrder = createOneSessionButton.compareDocumentPosition(createMultipleSessionsButton);
    assert.strictEqual(buttonsInTheRightOrder, Node.DOCUMENT_POSITION_FOLLOWING);
  });

  module('when certification center is a type SCO', function () {
    module('when it manages students', function () {
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

    module('when it does not manage students', function () {
      test('it does render a button link to the sessions import page', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
          type: 'SCO',
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
  });
});
