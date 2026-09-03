import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import IndexClassic from 'pix-orga/components/index/classic';
import { EVENT_NAME } from 'pix-orga/constants/metrics-event-name';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Index::Classic', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display welcome message', async function (assert) {
    class CurrentUserStub extends Service {
      prescriber = {
        firstName: 'Jean',
      };
    }
    this.owner.register('service:current-user', CurrentUserStub);
    const screen = await render(<template><IndexClassic /></template>);

    // then
    assert.ok(screen.getByRole('heading', { name: t('components.index.welcome.title', { name: 'Jean' }) }));
    assert.ok(screen.getByText(t('components.index.welcome.description.classic')));
  });

  test('should display organization information', async function (assert) {
    class CurrentUserStub extends Service {
      prescriber = {
        firstName: 'Jean',
      };

      organization = {
        name: 'Ma super organization',
      };
    }
    this.owner.register('service:current-user', CurrentUserStub);
    const screen = await render(<template><IndexClassic /></template>);

    // then
    assert.ok(screen.getByRole('heading', { name: t('components.index.organization-information.title') }));
    assert.ok(screen.getByText(t('components.index.organization-information.label')));
    assert.ok(screen.getByText('Ma super organization'));
  });

  module('when organisation is SCO and managingStudents', function () {
    test('should display sco banner with markdown content', async function (assert) {
      class CurrentUserStub extends Service {
        isSCOManagingStudents = true;
        prescriber = {
          firstName: 'Jean',
        };
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const store = this.owner.lookup('service:store');
      store.createRecord('announcement', { id: 'SCO', content: { fr: 'Contenu de la bannière SCO' } });

      const screen = await render(<template><IndexClassic /></template>);

      // then
      assert.ok(screen.getByText('Contenu de la bannière SCO'));
    });
  });

  module('when organisation is not SCO and managingStudents', function () {
    test('should not display sco banner', async function (assert) {
      class CurrentUserStub extends Service {
        isSCOManagingStudents = false;
        prescriber = {
          firstName: 'Jean',
        };
      }
      this.owner.register('service:current-user', CurrentUserStub);

      const store = this.owner.lookup('service:store');
      store.createRecord('announcement', { id: '1', content: { fr: 'Contenu de la bannière SCO' } });

      const screen = await render(<template><IndexClassic /></template>);

      // then
      assert.notOk(screen.queryByText('Contenu de la bannière SCO'));
    });
  });

  module('metrics', function () {
    test('should call trackEvent on campaign creation click', async function (assert) {
      class CurrentUserStub extends Service {
        prescriber = {
          firstName: 'Jean',
        };
      }

      const router = this.owner.lookup('service:-routing');
      sinon.stub(router, 'transitionTo');
      this.owner.register('service:current-user', CurrentUserStub);
      const pixMetrics = this.owner.lookup('service:pix-metrics');
      const trackEventStub = sinon.stub(pixMetrics, 'trackEvent');
      const screen = await render(<template><IndexClassic /></template>);

      const createCampaignButton = screen.getByRole('link', {
        name: t('components.index.action-cards.classic.create-campaign.buttonText'),
      });
      await click(createCampaignButton);

      // then
      sinon.assert.calledWith(trackEventStub, EVENT_NAME.HOMEPAGE.CREATE_CAMPAIGN_CLICK);
      assert.ok(true);
    });

    test('should call trackEvent on campaigns list click', async function (assert) {
      class CurrentUserStub extends Service {
        prescriber = {
          firstName: 'Jean',
        };
      }

      const router = this.owner.lookup('service:-routing');
      sinon.stub(router, 'transitionTo');
      this.owner.register('service:current-user', CurrentUserStub);
      const pixMetrics = this.owner.lookup('service:pix-metrics');
      const trackEventStub = sinon.stub(pixMetrics, 'trackEvent');
      const screen = await render(<template><IndexClassic /></template>);

      const createCampaignButton = screen.getByRole('link', {
        name: t('components.index.action-cards.classic.follow-activity.buttonText'),
      });
      await click(createCampaignButton);

      // then
      sinon.assert.calledWith(trackEventStub, EVENT_NAME.HOMEPAGE.LIST_CAMPAIGNS_CLICK);
      assert.ok(true);
    });
  });

  test('should display action cards', async function (assert) {
    class CurrentUserStub extends Service {
      prescriber = {
        firstName: 'Jean',
      };
      organization = {
        name: 'Ma super organization',
      };
    }
    this.owner.register('service:current-user', CurrentUserStub);
    const screen = await render(<template><IndexClassic /></template>);

    // then
    assert.ok(screen.getByRole('heading', { name: t('components.index.action-cards.classic.create-campaign.title') }));
    assert.ok(screen.getByText(t('components.index.action-cards.classic.create-campaign.description')));

    assert.ok(
      screen.getByRole('link', { name: t('components.index.action-cards.classic.create-campaign.buttonText') }),
    );

    assert.ok(screen.getByRole('heading', { name: t('components.index.action-cards.classic.follow-activity.title') }));
    assert.ok(screen.getByText(t('components.index.action-cards.classic.follow-activity.description')));
    assert.ok(
      screen.getByRole('link', { name: t('components.index.action-cards.classic.follow-activity.buttonText') }),
    );
  });
});
