import { clickByName, render as renderScreen } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Header::ArchivedBanner', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  module('When campaign is active', () => {
    test('it should not display unarchive banner', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        prescriber = { isAdminOfTheCurrentOrganization: true };
      }
      this.owner.register('service:currentUser', CurrentUserStub);
      this.campaign = store.createRecord('campaign', {
        id: '1',
        isArchived: false,
      });

      // when
      const screen = await renderScreen(hbs`<Campaign::Header::ArchivedBanner @campaign={{this.campaign}} />`);

      // then
      assert.dom(screen.queryByText(t('pages.campaign.archived'))).doesNotExist();
      assert.dom(screen.queryByText(t('pages.campaign.actions.unarchive'))).doesNotExist();
    });
  });

  module('When campaign is archived', () => {
    module('When user is admin', () => {
      test('it should display archive informations and button', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = { isAdminOfTheCurrentOrganization: true };
        }
        this.owner.register('service:currentUser', CurrentUserStub);
        this.campaign = store.createRecord('campaign', {
          id: '1',
          isArchived: true,
        });

        // when
        const screen = await renderScreen(hbs`<Campaign::Header::ArchivedBanner @campaign={{this.campaign}} />`);

        // then
        assert.dom(screen.getByText(t('pages.campaign.archived'))).exists();
        assert.dom(screen.getByText(t('pages.campaign.actions.unarchive'))).exists();
      });

      test('it should unarchive campaign on button click', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = { isAdminOfTheCurrentOrganization: true };
        }
        this.owner.register('service:currentUser', CurrentUserStub);
        this.campaign = store.createRecord('campaign', {
          id: '1',
          isArchived: true,
          unarchive: sinon.stub(),
        });

        // when
        await renderScreen(hbs`<Campaign::Header::ArchivedBanner @campaign={{this.campaign}} />`);
        await clickByName('Désarchiver la campagne');

        // then
        assert.ok(this.campaign.unarchive.calledOnce);
      });
    });

    module('When user is member and own the campaign', () => {
      test('it should display archive informations and button', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = EmberObject.create({ isAdminOfTheCurrentOrganization: false, id: 109 });
        }
        this.owner.register('service:currentUser', CurrentUserStub);
        this.campaign = store.createRecord('campaign', {
          id: '1',
          isArchived: true,
          ownerId: 109,
        });

        // when
        const screen = await renderScreen(hbs`<Campaign::Header::ArchivedBanner @campaign={{this.campaign}} />`);

        // then
        assert.dom(screen.getByText(t('pages.campaign.archived'))).exists();
        assert.dom(screen.getByText(t('pages.campaign.actions.unarchive'))).exists();
      });

      test('it should unarchive campaign on button click', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = EmberObject.create({ isAdminOfTheCurrentOrganization: false, id: 109 });
        }
        this.owner.register('service:currentUser', CurrentUserStub);
        this.campaign = store.createRecord('campaign', {
          id: '1',
          isArchived: true,
          ownerId: 109,
          unarchive: sinon.stub(),
        });

        // when
        await renderScreen(hbs`<Campaign::Header::ArchivedBanner @campaign={{this.campaign}} />`);
        await clickByName('Désarchiver la campagne');

        // then
        assert.ok(this.campaign.unarchive.calledOnce);
      });
    });

    module('When user does not own campaign and is a member', () => {
      test('it should display archive informations', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = { isAdminOfTheCurrentOrganization: false };
        }
        this.owner.register('service:currentUser', CurrentUserStub);
        this.campaign = store.createRecord('campaign', {
          id: '1',
          isArchived: true,
        });

        // when
        const screen = await renderScreen(hbs`<Campaign::Header::ArchivedBanner @campaign={{this.campaign}} />`);

        // then
        assert.dom(screen.getByText(t('pages.campaign.archived'))).exists();
      });

      test('it should not be possible to unarchive', async function (assert) {
        // given
        class CurrentUserStub extends Service {
          prescriber = { isAdminOfTheCurrentOrganization: false };
        }
        this.owner.register('service:currentUser', CurrentUserStub);
        this.campaign = store.createRecord('campaign', {
          id: '1',
          isArchived: true,
        });

        // when
        const screen = await renderScreen(hbs`<Campaign::Header::ArchivedBanner @campaign={{this.campaign}} />`);

        // then
        assert.dom(screen.queryByText(t('pages.campaign.actions.unarchive'))).doesNotExist();
      });
    });
  });
});
