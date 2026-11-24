import { clickByName, fillByLabel, render as renderScreen } from '@1024pix/ember-testing-library';
import UpdateForm from 'pix-orga/components/campaign/update-form';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::UpdateForm', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;
  const cancelSpy = () => {};
  const updateCampaignSpy = (event) => event.preventDefault();

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  test('[a11y] it should display a message that some inputs are required', async function (assert) {
    // given
    const campaign = await store.createRecord('campaign', { name: 'campaign', type: 'ASSESSMENT', ownerId: 666 });

    // when
    const screen = await renderScreen(
      <template>
        <UpdateForm @campaign={{campaign}} @onSubmit={{updateCampaignSpy}} @onCancel={{cancelSpy}} />
      </template>,
    );

    // then
    assert.dom(screen.getByText('indique un champ obligatoire')).exists();
  });

  module('When campaign type is ASSESSMENT', function () {
    test('it should display campaign title input', async function (assert) {
      // given
      const campaign = await store.createRecord('campaign', { name: 'campaign', type: 'ASSESSMENT', ownerId: 666 });

      // when
      const screen = await renderScreen(
        <template>
          <UpdateForm @campaign={{campaign}} @onSubmit={{updateCampaignSpy}} @onCancel={{cancelSpy}} />
        </template>,
      );

      // then
      assert.dom(screen.getByLabelText('Titre du parcours', { exact: false })).exists();
      assert.dom(screen.getByLabelText('Titre du parcours', { exact: false })).hasAttribute('maxLength', '50');
    });

    test('it should contain inputs, attributes, information block, validation and cancel buttons', async function (assert) {
      // given
      const campaign = await store.createRecord('campaign', { name: 'campaign', type: 'ASSESSMENT', ownerId: 666 });

      // when
      const screen = await renderScreen(
        <template>
          <UpdateForm @campaign={{campaign}} @onSubmit={{updateCampaignSpy}} @onCancel={{cancelSpy}} />
        </template>,
      );

      // then
      assert.dom(screen.getByLabelText('Nom de la campagne *')).exists();
      assert.dom(screen.getByLabelText('Propriétaire de la campagne *')).exists();
      assert.dom(screen.getByLabelText("Texte de la page d'accueil", { exact: false })).exists();
      assert.dom(screen.getByLabelText('Titre du parcours', { exact: false })).exists();
      assert.dom(screen.getByText('Modifier')).exists();
      assert.dom(screen.getByText('Annuler')).exists();
    });

    test('it should send campaign update action when submitted', async function (assert) {
      // given
      const campaign = await store.createRecord('campaign', {
        name: 'campaign',
        type: 'ASSESSMENT',
        ownerFirstName: 'Jon',
        ownerLastName: 'snow',
        ownerId: 666,
      });

      const updateCampaignSpy = sinon.stub();

      await renderScreen(
        <template>
          <UpdateForm @campaign={{campaign}} @onSubmit={{updateCampaignSpy}} @onCancel={{cancelSpy}} />
        </template>,
      );

      // when
      await fillByLabel('Nom de la campagne *', 'New name');
      await clickByName('Modifier');

      //then
      sinon.assert.called(updateCampaignSpy);
      assert.ok(true);
    });

    test('it should display campaign custom landing page input', async function (assert) {
      // given
      const campaign = await store.createRecord('campaign', { name: 'campaign', type: 'ASSESSMENT', ownerId: 666 });

      //when
      const screen = await renderScreen(
        <template>
          <UpdateForm @campaign={{campaign}} @onSubmit={{updateCampaignSpy}} @onCancel={{cancelSpy}} />
        </template>,
      );

      //then
      assert
        .dom(screen.getByLabelText("Texte de la page d'accueil", { exact: false }))
        .hasAttribute('maxLength', '5000');
    });

    test('it should explain which informations will be visible to organization-learners', async function (assert) {
      // given
      const campaign = await store.createRecord('campaign', { name: 'campaign', type: 'ASSESSMENT', ownerId: 666 });

      //when
      const screen = await renderScreen(
        <template>
          <UpdateForm @campaign={{campaign}} @onSubmit={{updateCampaignSpy}} @onCancel={{cancelSpy}} />
        </template>,
      );

      //then
      const testTitleSublabel = screen.getAllByLabelText(
        t('pages.campaign-modification.personalised-test-title.sublabel'),
        {
          exact: false,
        },
      )[0];
      const landingPageSublabel = screen.getAllByLabelText(
        t('pages.campaign-modification.landing-page-text.sublabel'),
        {
          exact: false,
        },
      )[1];

      assert.ok(testTitleSublabel);
      assert.ok(landingPageSublabel);
    });
  });

  module('When campaign type is EXAM', function () {
    test('it should display campaign title input', async function (assert) {
      // given
      const campaign = await store.createRecord('campaign', { name: 'campaign', type: 'ASSESSMENT', ownerId: 666 });

      // when
      const screen = await renderScreen(
        <template>
          <UpdateForm @campaign={{campaign}} @onSubmit={{updateCampaignSpy}} @onCancel={{cancelSpy}} />
        </template>,
      );

      // then
      assert.dom(screen.getByLabelText('Titre du parcours', { exact: false })).exists();
      assert.dom(screen.getByLabelText('Titre du parcours', { exact: false })).hasAttribute('maxLength', '50');
    });

    test('it should contain inputs, attributes, information block, validation and cancel buttons', async function (assert) {
      // given
      const campaign = await store.createRecord('campaign', { name: 'campaign', type: 'ASSESSMENT', ownerId: 666 });

      // when
      const screen = await renderScreen(
        <template>
          <UpdateForm @campaign={{campaign}} @onSubmit={{updateCampaignSpy}} @onCancel={{cancelSpy}} />
        </template>,
      );

      // then
      assert.dom(screen.getByLabelText('Nom de la campagne *')).exists();
      assert.dom(screen.getByLabelText('Propriétaire de la campagne *')).exists();
      assert.dom(screen.getByLabelText("Texte de la page d'accueil", { exact: false })).exists();
      assert.dom(screen.getByLabelText('Titre du parcours', { exact: false })).exists();
      assert.dom(screen.getByText('Modifier')).exists();
      assert.dom(screen.getByText('Annuler')).exists();
    });

    test('it should send campaign update action when submitted', async function (assert) {
      // given
      const campaign = await store.createRecord('campaign', {
        name: 'campaign',
        type: 'ASSESSMENT',
        ownerFirstName: 'Jon',
        ownerLastName: 'snow',
        ownerId: 666,
      });

      const updateCampaignSpy = sinon.stub();

      await renderScreen(
        <template>
          <UpdateForm @campaign={{campaign}} @onSubmit={{updateCampaignSpy}} @onCancel={{cancelSpy}} />
        </template>,
      );

      // when
      await fillByLabel('Nom de la campagne *', 'New name');
      await clickByName('Modifier');

      //then
      sinon.assert.called(updateCampaignSpy);
      assert.ok(true);
    });

    test('it should display campaign custom landing page input', async function (assert) {
      // given
      const campaign = await store.createRecord('campaign', { name: 'campaign', type: 'ASSESSMENT', ownerId: 666 });

      //when
      const screen = await renderScreen(
        <template>
          <UpdateForm @campaign={{campaign}} @onSubmit={{updateCampaignSpy}} @onCancel={{cancelSpy}} />
        </template>,
      );

      //then
      assert
        .dom(screen.getByLabelText("Texte de la page d'accueil", { exact: false }))
        .hasAttribute('maxLength', '5000');
    });

    test('it should explain which informations will be visible to organization-learners', async function (assert) {
      // given
      const campaign = await store.createRecord('campaign', { name: 'campaign', type: 'ASSESSMENT', ownerId: 666 });

      //when
      const screen = await renderScreen(
        <template>
          <UpdateForm @campaign={{campaign}} @onSubmit={{updateCampaignSpy}} @onCancel={{cancelSpy}} />
        </template>,
      );

      //then
      const testTitleSublabel = screen.getAllByLabelText(
        t('pages.campaign-modification.personalised-test-title.sublabel'),
        {
          exact: false,
        },
      )[0];
      const landingPageSublabel = screen.getAllByLabelText(
        t('pages.campaign-modification.landing-page-text.sublabel'),
        {
          exact: false,
        },
      )[1];

      assert.ok(testTitleSublabel);
      assert.ok(landingPageSublabel);
    });
  });

  module('When campaign type is PROFILES_COLLECTION', function () {
    test('it should not display campaign title input', async function (assert) {
      // given
      const campaign = await store.createRecord('campaign', {
        name: 'campaign',
        type: 'PROFILES_COLLECTION',
        ownerId: 666,
      });

      // when
      await renderScreen(
        <template>
          <UpdateForm @campaign={{campaign}} @onSubmit={{updateCampaignSpy}} @onCancel={{cancelSpy}} />
        </template>,
      );

      // then
      assert.dom('input#campaign-title').doesNotExist();
    });
  });
});
