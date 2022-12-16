import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { contains } from '../../../helpers/contains';

module('Integration | Component | Dashboard | Content', function (hooks) {
  setupIntlRenderingTest(hooks);

  const pixScore = 105;
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('should render component', async function (assert) {
    // given
    class CurrentUserStub extends Service {
      user = store.createRecord('user', {
        firstName: 'Banana',
        lastName: 'Split',
        email: 'banana.split@example.net',
        profile: store.createRecord('profile', {
          pixScore,
        }),
        hasSeenNewDashboardInfo: false,
      });
    }

    this.owner.register('service:currentUser', CurrentUserStub);
    this.set('model', {
      campaignParticipationOverviews: [],
      campaignParticipations: [],
      scorecards: [],
    });

    // when
    await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

    // then
    assert.dom('.dashboard-content').exists();
  });

  module('campaign-participation-overview rendering', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentUserStub extends Service {
        user = store.createRecord('user', {
          firstName: 'Banana',
          lastName: 'Split',
          email: 'banana.split@example.net',
          profile: store.createRecord('profile', {
            pixScore,
          }),
          hasSeenNewDashboardInfo: false,
        });
      }

      this.owner.register('service:currentUser', CurrentUserStub);
    });

    test('should render campaign participation when there is at least one campaign participation overviews', async function (assert) {
      // given
      const campaignParticipationOverview = EmberObject.create({
        isShared: false,
        createdAt: '2020-12-10T15:16:20.109Z',
        assessmentState: 'started',
        campaignTitle: 'My campaign',
        organizationName: 'My organization',
      });
      this.set('model', {
        campaignParticipationOverviews: [campaignParticipationOverview],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert.dom('section[data-test-campaign-participation-overviews]').exists();
    });

    test('should render campaign participations link', async function (assert) {
      // given
      const campaignParticipationOverview = EmberObject.create({
        isShared: false,
        createdAt: '2020-12-10T15:16:20.109Z',
        assessmentState: 'started',
        campaignTitle: 'My campaign',
        organizationName: 'My organization',
      });
      this.set('model', {
        campaignParticipationOverviews: [campaignParticipationOverview],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert.ok(contains('Tous mes parcours'));
    });

    test('should not render campaign participations when there is no campaign participation overviews', async function (assert) {
      // given
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert.dom('section[data-test-campaign-participation-overviews]').doesNotExist();
    });
  });

  module('recommended competence-card rendering', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentUserStub extends Service {
        user = store.createRecord('user', {
          firstName: 'Banana',
          lastName: 'Split',
          email: 'banana.split@example.net',
          profile: store.createRecord('profile', {
            pixScore,
          }),
          hasSeenNewDashboardInfo: false,
        });
      }

      this.owner.register('service:currentUser', CurrentUserStub);
    });

    test('should render competence-card when there is at least one competence-card not started', async function (assert) {
      // given
      const scorecard = { isNotStarted: true };
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [scorecard],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert.dom('section[data-test-recommended-competences]').exists();
    });

    test('should not render competence-card when there is no competence-card', async function (assert) {
      // given
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert.dom('section[data-test-recommended-competences]').doesNotExist();
    });

    test('should render the four first non started competence cards from the received arguments', async function (assert) {
      // given
      const scorecards = [
        { id: 1, index: '1.1', isNotStarted: true },
        { id: 2, index: '1.2', isNotStarted: true },
        { id: 3, index: '3.1', isNotStarted: true },
        { id: 5, index: '1.3', isNotStarted: false },
        { id: 4, index: '2.4', isNotStarted: true },
        { id: 4, index: '1.4', isNotStarted: true },
      ];
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards,
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert.dom('.competence-card').exists({ count: 4 });
    });
  });

  module('improvable competence-card rendering', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentUserStub extends Service {
        user = store.createRecord('user', {
          firstName: 'Banana',
          lastName: 'Split',
          email: 'banana.split@example.net',
          profile: store.createRecord('profile', {
            pixScore,
          }),
          hasSeenNewDashboardInfo: false,
        });
      }

      this.owner.register('service:currentUser', CurrentUserStub);
    });

    test('should render competence-card when there is at least one competence-card not started', async function (assert) {
      // given
      const scorecard = { isImprovable: true };
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [scorecard],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert.ok(contains(this.intl.t('pages.dashboard.improvable-competences.subtitle')));
    });

    test('should not render competence-card when there is no competence-card', async function (assert) {
      // given
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert.notOk(contains(this.intl.t('pages.dashboard.improvable-competences.subtitle')));
    });

    test('should render the four first non improvable competence cards from the received arguments', async function (assert) {
      // given
      const scorecards = [
        { id: 1, index: '1.1', isImprovable: true },
        { id: 2, index: '1.2', isImprovable: true },
        { id: 3, index: '3.1', isImprovable: true },
        { id: 5, index: '1.3', isImprovable: false },
        { id: 4, index: '2.4', isImprovable: true },
        { id: 4, index: '1.4', isImprovable: true },
      ];
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards,
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert.dom('.competence-card').exists({ count: 4 });
    });
  });

  module('started competence-card rendering', function (hooks) {
    hooks.beforeEach(function () {
      class CurrentUserStub extends Service {
        user = store.createRecord('user', {
          firstName: 'Banana',
          lastName: 'Split',
          email: 'banana.split@example.net',
          profile: store.createRecord('profile', {
            pixScore,
          }),
          hasSeenNewDashboardInfo: false,
        });
      }

      this.owner.register('service:currentUser', CurrentUserStub);
    });

    test('should render competence-card when there is at least one competence-card started', async function (assert) {
      // given
      const scorecard = { isStarted: true };
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [scorecard],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert.dom('section[data-test-started-competences]').exists();
    });

    test('should not render competence-card when there is no competence-card', async function (assert) {
      // given
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert.dom('section[data-test-started-competences]').doesNotExist();
    });

    test('should render the four first started competence cards from the received arguments', async function (assert) {
      // given
      const scorecards = [
        { id: 1, index: '1.1', isStarted: true },
        { id: 2, index: '1.2', isStarted: true },
        { id: 3, index: '3.1', isStarted: true },
        { id: 5, index: '1.3', isStarted: false },
        { id: 4, index: '2.4', isStarted: true },
        { id: 4, index: '1.4', isStarted: true },
      ];
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards,
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert.dom('.competence-card').exists({ count: 4 });
    });
  });

  module('new dashboard info rendering', function () {
    test('should display NewInformation on dashboard if user has not close it before', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        user = store.createRecord('user', {
          firstName: 'Banana',
          lastName: 'Split',
          email: 'banana.split@example.net',
          profile: store.createRecord('profile', {
            pixScore,
          }),
          hasSeenNewDashboardInfo: false,
        });
      }

      this.owner.register('service:currentUser', CurrentUserStub);
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      assert.dom('.new-information').exists();
    });

    test('should not display NewInformation on dashboard if user has close it before', async function (assert) {
      // given
      class HasSeenNewDashboardInformationCurrentUserStub extends Service {
        user = store.createRecord('user', {
          firstName: 'Banana',
          lastName: 'Split',
          email: 'banana.split@example.net',
          profile: store.createRecord('profile', {
            pixScore,
          }),
          hasSeenNewDashboardInfo: true,
        });
      }

      this.owner.register('service:currentUser', HasSeenNewDashboardInformationCurrentUserStub);
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      assert.dom('section[data-test-new-dashboard-info]').doesNotExist();
    });

    test('should display link on new dashboard banner when domain is pix.fr', async function (assert) {
      // given
      class UrlStub extends Service {
        get isFrenchDomainExtension() {
          return true;
        }
      }

      class CurrentUserStub extends Service {
        user = store.createRecord('user', {
          firstName: 'Banana',
          lastName: 'Split',
          email: 'banana.split@example.net',
          profile: store.createRecord('profile', {
            pixScore,
          }),
          hasSeenNewDashboardInfo: false,
        });
      }

      this.owner.register('service:currentUser', CurrentUserStub);
      this.owner.register('service:url', UrlStub);
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      assert.dom('.new-information').exists();
      assert.dom('.new-information-content-text__link').exists();
    });

    test('should hide link on new dashboard banner when domain is pix.org', async function (assert) {
      // given
      class UrlStub extends Service {
        get isFrenchDomainExtension() {
          return false;
        }
      }

      class CurrentUserStub extends Service {
        user = store.createRecord('user', {
          firstName: 'Banana',
          lastName: 'Split',
          email: 'banana.split@example.net',
          profile: store.createRecord('profile', {
            pixScore,
          }),
          hasSeenNewDashboardInfo: false,
        });
      }

      this.owner.register('service:currentUser', CurrentUserStub);
      this.owner.register('service:url', UrlStub);
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      assert.dom('.new-information').exists();
      assert.dom('.new-information-content-text__link').doesNotExist();
    });
  });

  module('empty dashboard info rendering', function () {
    test('should display Empty Dashboard Information if user has nothing to do', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        user = store.createRecord('user', {
          firstName: 'Banana',
          lastName: 'Split',
          email: 'banana.split@example.net',
          profile: store.createRecord('profile', {
            pixScore,
          }),
          hasSeenNewDashboardInfo: false,
        });
      }

      this.owner.register('service:currentUser', CurrentUserStub);
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      assert.dom('section[data-test-empty-dashboard]').exists();
    });

    test('should not display Empty Dashboard Information on dashboard if user has competence to continue', async function (assert) {
      // given
      class HasSeenNewDashboardInformationCurrentUserStub extends Service {
        user = store.createRecord('user', {
          firstName: 'Banana',
          lastName: 'Split',
          email: 'banana.split@example.net',
          profile: store.createRecord('profile', {
            pixScore,
          }),
          hasSeenNewDashboardInfo: true,
        });
      }

      this.owner.register('service:currentUser', HasSeenNewDashboardInformationCurrentUserStub);
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [
          { id: 1, index: '1.1', isStarted: true },
          { id: 2, index: '1.2', isStarted: true },
        ],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      assert.dom('section[data-test-empty-dashboard]').doesNotExist();
    });
  });

  module('user pix score rendering', function () {
    test('should display user score', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        user = store.createRecord('user', {
          firstName: 'Banana',
          lastName: 'Split',
          email: 'banana.split@example.net',
          profile: store.createRecord('profile', {
            pixScore,
          }),
          hasSeenNewDashboardInfo: false,
        });
      }

      this.owner.register('service:currentUser', CurrentUserStub);
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      assert.dom('.dashboard-content__score').exists();
      assert.ok(find('.hexagon-score-content__pix-score').textContent.includes(pixScore));
    });
  });

  module('participation to a profile collection campaign to resume', function () {
    test('should display the banner to resume participation', async function (assert) {
      // given
      class CurrentUserWithCodeStub extends Service {
        user = store.createRecord('user', {
          firstName: 'Banana',
          lastName: 'Split',
          email: 'banana.split@example.net',
          profile: store.createRecord('profile', {
            pixScore,
          }),
          hasSeenNewDashboardInfo: false,
          codeForLastProfileToShare: 'SNAP1234',
        });
      }

      this.owner.register('service:currentUser', CurrentUserWithCodeStub);
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      assert.ok(contains(this.intl.t('pages.dashboard.campaigns.resume.action')));
    });

    test('should not display the banner when there is no code', async function (assert) {
      // given
      class CurrentUserStub extends Service {
        user = store.createRecord('user', {
          firstName: 'Banana',
          lastName: 'Split',
          email: 'banana.split@example.net',
          profile: store.createRecord('profile', {
            pixScore,
          }),
          hasSeenNewDashboardInfo: false,
        });
      }

      this.owner.register('service:currentUser', CurrentUserStub);
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      assert.notOk(contains(this.intl.t('pages.dashboard.campaigns.resume.action')));
    });
  });
});
