import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

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
    const screen = await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

    // then
    assert.dom(screen.getByRole('main')).exists();
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
      const screen = await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert.dom(screen.getByRole('heading', { name: this.intl.t('pages.dashboard.campaigns.title') })).exists();
      assert.dom(screen.getByRole('link', { name: this.intl.t('pages.dashboard.campaigns.tests-link') })).exists();
    });

    test('should not render campaign participations when there is no campaign participation overviews', async function (assert) {
      // given
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      const screen = await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert
        .dom(screen.queryByRole('heading', { name: this.intl.t('pages.dashboard.campaigns.title') }))
        .doesNotExist();
      assert
        .dom(screen.queryByRole('link', { name: this.intl.t('pages.dashboard.campaigns.tests-link') }))
        .doesNotExist();
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
      const screen = await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert
        .dom(screen.getByRole('heading', { name: this.intl.t('pages.dashboard.recommended-competences.title') }))
        .exists();
      assert
        .dom(screen.getByRole('link', { name: this.intl.t('pages.dashboard.recommended-competences.profile-link') }))
        .exists();
    });

    test('should not render competence-card when there is no competence-card', async function (assert) {
      // given
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      const screen = await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert
        .dom(screen.queryByRole('heading', { name: this.intl.t('pages.dashboard.recommended-competences.title') }))
        .doesNotExist();
      assert
        .dom(screen.queryByRole('link', { name: this.intl.t('pages.dashboard.recommended-competences.profile-link') }))
        .doesNotExist();
    });

    test('should render the four first non started competence cards from the received arguments', async function (assert) {
      // given
      const scorecards = [
        { id: 1, index: '1.1', isNotStarted: true, name: 'Compétence 1' },
        { id: 2, index: '1.2', isNotStarted: true, name: 'Compétence 2' },
        { id: 3, index: '3.1', isNotStarted: true, name: 'Compétence 3' },
        { id: 5, index: '1.3', isNotStarted: false, name: 'Compétence 4' },
        { id: 4, index: '2.4', isNotStarted: true, name: 'Compétence 5' },
        { id: 6, index: '1.4', isNotStarted: true, name: 'Compétence 6' },
      ];
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards,
      });

      // when
      const screen = await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert.strictEqual(screen.getAllByRole('article').length, 4);
      assert.dom(screen.getByRole('link', { name: 'Compétence 1 Compétence non commencée' })).exists();
      assert.dom(screen.getByRole('link', { name: 'Compétence 2 Compétence non commencée' })).exists();
      assert.dom(screen.getByRole('link', { name: 'Compétence 5 Compétence non commencée' })).exists();
      assert.dom(screen.getByRole('link', { name: 'Compétence 6 Compétence non commencée' })).exists();
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
      const screen = await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert.ok(screen.getByText(this.intl.t('pages.dashboard.improvable-competences.subtitle')));
    });

    test('should not render competence-card when there is no competence-card', async function (assert) {
      // given
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      const screen = await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert.notOk(screen.queryByText(this.intl.t('pages.dashboard.improvable-competences.subtitle')));
    });

    test('should render the four first non improvable competence cards from the received arguments', async function (assert) {
      // given
      const scorecards = [
        { id: 1, index: '1.1', isImprovable: true, name: 'Compétence 1' },
        { id: 2, index: '1.2', isImprovable: true, name: 'Compétence 2' },
        { id: 3, index: '3.1', isImprovable: true, name: 'Compétence 3' },
        { id: 5, index: '1.3', isImprovable: false, name: 'Compétence 4' },
        { id: 4, index: '2.4', isImprovable: true, name: 'Compétence 5' },
        { id: 4, index: '1.4', isImprovable: true, name: 'Compétence 6' },
      ];
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards,
      });

      // when
      const screen = await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert.strictEqual(screen.getAllByRole('article').length, 4);
      assert
        .dom(screen.getByRole('link', { name: 'Compétence 1 Niveau actuel: . Le prochain niveau est complété à %.' }))
        .exists();
      assert
        .dom(screen.getByRole('link', { name: 'Compétence 2 Niveau actuel: . Le prochain niveau est complété à %.' }))
        .exists();
      assert
        .dom(screen.getByRole('link', { name: 'Compétence 5 Niveau actuel: . Le prochain niveau est complété à %.' }))
        .exists();
      assert
        .dom(screen.getByRole('link', { name: 'Compétence 6 Niveau actuel: . Le prochain niveau est complété à %.' }))
        .exists();
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
      const screen = await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert
        .dom(screen.getByRole('heading', { name: this.intl.t('pages.dashboard.started-competences.title') }))
        .exists();
    });

    test('should not render competence-card when there is no competence-card', async function (assert) {
      // given
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      const screen = await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      assert
        .dom(screen.queryByRole('heading', { name: this.intl.t('pages.dashboard.started-competences.title') }))
        .doesNotExist();
    });

    test('should render the four first started competence cards from the received arguments', async function (assert) {
      // given
      const scorecards = [
        { id: 1, index: '1.1', isStarted: true, name: 'Compétence 1' },
        { id: 2, index: '1.2', isStarted: true, name: 'Compétence 2' },
        { id: 3, index: '3.1', isStarted: true, name: 'Compétence 3' },
        { id: 5, index: '1.3', isStarted: false, name: 'Compétence 4' },
        { id: 4, index: '2.4', isStarted: true, name: 'Compétence 5' },
        { id: 4, index: '1.4', isStarted: true, name: 'Compétence 6' },
      ];
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards,
      });

      // when
      const screen = await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then

      assert.strictEqual(screen.getAllByRole('article').length, 4);
      assert
        .dom(screen.getByRole('link', { name: 'Compétence 1 Niveau actuel: . Le prochain niveau est complété à %.' }))
        .exists();
      assert
        .dom(screen.getByRole('link', { name: 'Compétence 2 Niveau actuel: . Le prochain niveau est complété à %.' }))
        .exists();
      assert
        .dom(screen.getByRole('link', { name: 'Compétence 5 Niveau actuel: . Le prochain niveau est complété à %.' }))
        .exists();
      assert
        .dom(screen.getByRole('link', { name: 'Compétence 6 Niveau actuel: . Le prochain niveau est complété à %.' }))
        .exists();
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
      const screen = await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      assert.dom(screen.getByRole('heading', { name: 'Bonjour Banana, découvrez votre tableau de bord.' })).exists();
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
      const screen = await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      assert
        .dom(screen.queryByRole('heading', { name: 'Bonjour Banana, découvrez votre tableau de bord.' }))
        .doesNotExist();
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
      const screen = await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      assert
        .dom(screen.getByRole('link', { name: this.intl.t('pages.dashboard.presentation.link.text') }))
        .hasAttribute('href', this.intl.t('pages.dashboard.presentation.link.url'));
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
      const screen = await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      assert.dom(screen.getByRole('heading', { name: 'Bonjour Banana, découvrez votre tableau de bord.' })).exists();
      assert
        .dom(screen.queryByRole('link', { name: this.intl.t('pages.dashboard.presentation.link.text') }))
        .doesNotExist();
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
      const screen = await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      assert
        .dom(screen.getByRole('heading', { name: 'Bravo vous avez terminé les compétences recommandées !' }))
        .exists();
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
      const screen = await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      assert
        .dom(screen.queryByRole('heading', { name: 'Bravo vous avez terminé les compétences recommandées !' }))
        .doesNotExist();
      assert
        .dom(screen.queryByRole('button', { name: this.intl.t('pages.dashboard.empty-dashboard.link-to-competences') }))
        .doesNotExist();
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
      const screen = await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      assert.dom(screen.getByText(pixScore)).exists();
      assert.dom(screen.getByRole('button', { name: this.intl.t('pages.profile.total-score-helper.label') })).exists();
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
      const screen = await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      assert.ok(screen.getByRole('link', { name: this.intl.t('pages.dashboard.campaigns.resume.action') }));
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
      const screen = await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      assert.notOk(screen.queryByRole('link', { name: this.intl.t('pages.dashboard.campaigns.resume.action') }));
    });
  });
});
