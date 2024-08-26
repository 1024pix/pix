import { clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import Details from 'pix-admin/components/campaigns/details';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaigns | details', function (hooks) {
  setupIntlRenderingTest(hooks);

  const toggleEditMode = sinon.stub();

  hooks.beforeEach(function () {
    class AccessControlStub extends Service {
      hasAccessToOrganizationActionsScope = true;
    }
    this.owner.register('service:access-control', AccessControlStub);
  });

  module('when campaign type is ASSESSMENT', function () {
    test('should display campaign attributes', async function (assert) {
      // given
      const campaign = {
        type: 'ASSESSMENT',
        code: 'MYCODE',
        creatorFirstName: 'Jon',
        creatorLastName: 'Snow',
        organizationId: 2,
        organizationName: 'My organization',
        targetProfileId: 3,
        targetProfileName: 'My target profile',
        customLandingPageText: 'welcome',
        customResultPageText: 'tadaaa',
        customResultPageButtonText: 'Click here',
        customResultPageButtonUrl: 'www.pix.fr',
        createdAt: new Date('2020-02-01'),
        archivedAt: new Date('2020-03-01'),
      };

      // when
      const screen = await render(
        <template><Details @campaign={{campaign}} @toggleEditMode={{toggleEditMode}} /></template>,
      );

      // expect
      assert.dom(screen.getByText('Créée le 01/02/2020 par Jon Snow')).exists();
      assert.dom(screen.getByText('Type : Évaluation')).exists();
      assert.dom(screen.getByText('Code : MYCODE')).exists();
      assert.dom(screen.getByText('My target profile')).exists();
      assert.dom(screen.getByText('My organization')).exists();
      assert.dom(screen.getByText('Archivée le 01/03/2020')).exists();
      assert.dom(screen.getByText('welcome')).exists();
      assert.dom(screen.getByText('tadaaa')).exists();
      assert.dom(screen.getByText('Texte du bouton de la page de fin de parcours : Click here')).exists();
      assert.dom(screen.getByText('URL du bouton de la page de fin de parcours : www.pix.fr')).exists();
    });

    test('should display the number of shared results', async function (assert) {
      // given
      const campaign = {
        sharedParticipationsCount: 5,
        isTypeAssessment: true,
      };

      // when
      const screen = await render(
        <template><Details @campaign={{campaign}} @toggleEditMode={{toggleEditMode}} /></template>,
      );

      // then
      assert.dom(screen.getByText('5 résultats reçus')).exists();
    });
  });

  module('when campaign type is COLLECTION_PROFILE ', function () {
    test('should display profile collection tag', async function (assert) {
      // given
      const campaign = {
        type: 'COLLECTION_PROFILE',
      };
      // when
      const screen = await render(
        <template><Details @campaign={{campaign}} @toggleEditMode={{toggleEditMode}} /></template>,
      );

      // then
      assert.dom(screen.getByText('Type : Collecte de profils')).exists();
    });

    test('should display the number of shared profiles', async function (assert) {
      // given
      const campaign = {
        sharedParticipationsCount: 5,
        isTypeAssessment: false,
      };

      // when
      const screen = await render(
        <template><Details @campaign={{campaign}} @toggleEditMode={{toggleEditMode}} /></template>,
      );

      // then
      assert.dom(screen.getByText('5 profils reçus')).exists();
    });
  });

  test('should call toggleEditMode function when the edit button is clicked', async function (assert) {
    const campaign = {};

    //when
    await render(<template><Details @campaign={{campaign}} @toggleEditMode={{toggleEditMode}} /></template>);
    await clickByName('Modifier');

    //then
    assert.ok(toggleEditMode.called);
  });

  test('should display total participants', async function (assert) {
    // given
    const campaign = {
      totalParticipationsCount: 10,
      isTypeAssessment: false,
    };

    // when
    const screen = await render(
      <template><Details @campaign={{campaign}} @toggleEditMode={{toggleEditMode}} /></template>,
    );

    // then
    assert.dom(screen.getByText('10 participants')).exists();
  });

  module('when campaign is multiple sendings', function () {
    test("should display 'Oui' when 'multipleSendings' is true", async function (assert) {
      // given
      const campaign = {
        multipleSendings: true,
      };

      // when
      const screen = await render(
        <template><Details @campaign={{campaign}} @toggleEditMode={{toggleEditMode}} /></template>,
      );

      // then
      assert.dom(screen.getByText('Envoi multiple : Oui')).exists();
    });

    test("should display 'Non' when 'multipleSendings' is false", async function (assert) {
      // given
      const campaign = {
        multipleSendings: false,
      };

      // when
      const screen = await render(
        <template><Details @campaign={{campaign}} @toggleEditMode={{toggleEditMode}} /></template>,
      );

      // then
      assert.dom(screen.getByText('Envoi multiple : Non')).exists();
    });
  });

  module('when user does not have access', function () {
    test('it should not allow to edit campaign details', async function (assert) {
      // given
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = false;
      }
      this.owner.register('service:access-control', AccessControlStub);
      const campaign = {};

      //when
      const screen = await render(<template><Details @campaign={{campaign}} /></template>);

      // expect
      assert.dom(screen.queryByRole('button', { name: 'Modifier' })).doesNotExist();
    });
  });
});
