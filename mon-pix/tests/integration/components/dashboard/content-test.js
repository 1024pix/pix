import EmberObject from '@ember/object';
import Service from '@ember/service';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { contains } from '../../../helpers/contains';

describe('Integration | Component | Dashboard | Content', function() {
  setupIntlRenderingTest();

  const pixScore = 105;
  class CurrentUserStub extends Service {
    user = {
      firstName: 'Banana',
      email: 'banana.split@example.net',
      fullName: 'Banana Split',
      profile: {
        pixScore,
      },
    }
  }

  class HasSeenNewDashboardInformationCurrentUserStub extends Service {
    user = {
      firstName: 'Banana',
      email: 'banana.split@example.net',
      fullName: 'Banana Split',
      hasSeenNewDashboardInfo: true,
    }
  }

  class FeatureTogglesSub extends Service {
    featureToggles = {
      isAprilFoolEnabled: false,
    };
  }

  it('should render component', async function() {
    // given
    this.owner.register('service:currentUser', CurrentUserStub);
    this.set('model', {
      campaignParticipationOverviews: [],
      campaignParticipations: [],
      scorecards: [],
    });

    // when
    await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

    // then
    expect(find('.dashboard-content')).to.exist;
  });

  describe('campaign-participation-overview rendering', function() {
    beforeEach(function() {
      this.owner.register('service:currentUser', CurrentUserStub);
      this.owner.register('service:featureToggles', FeatureTogglesSub);
    });

    it('should render campaign participation when there is at least one campaign participation overviews', async function() {
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
      expect(find('section[data-test-campaign-participation-overviews]')).to.exist;
    });

    it('should render campaign participations link', async function() {
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
      expect(contains('Tous mes parcours')).to.exist;
    });

    it('should not render campaign participations when there is no campaign participation overviews', async function() {
      // given
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      expect(find('section[data-test-campaign-participation-overviews]')).to.not.exist;
    });
  });

  describe('recommended competence-card rendering', function() {
    beforeEach(function() {
      this.owner.register('service:currentUser', CurrentUserStub);
      this.owner.register('service:featureToggles', FeatureTogglesSub);
    });

    it('should render competence-card when there is at least one competence-card not started', async function() {
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
      expect(find('section[data-test-recommended-competences]')).to.exist;
    });

    it('should not render competence-card when there is no competence-card', async function() {
      // given
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      expect(find('section[data-test-recommended-competences]')).to.not.exist;
    });

    it('should render the four first non started competence cards from the received arguments', async function() {
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
      expect(findAll('.competence-card')).to.have.length(4);
    });
  });

  describe('started competence-card rendering', function() {
    beforeEach(function() {
      this.owner.register('service:currentUser', CurrentUserStub);
      this.owner.register('service:featureToggles', FeatureTogglesSub);
    });

    it('should render competence-card when there is at least one competence-card started', async function() {
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
      expect(find('section[data-test-started-competences]')).to.exist;
    });

    it('should not render competence-card when there is no competence-card', async function() {
      // given
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      expect(find('section[data-test-started-competences]')).to.not.exist;
    });

    it('should render the four first started competence cards from the received arguments', async function() {
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
      expect(findAll('.competence-card')).to.have.length(4);
    });
  });

  describe('new dashboard info rendering', function() {

    it('should display NewInformation on dashboard if user has not close it before', async function() {
      // given
      this.owner.register('service:currentUser', CurrentUserStub);
      this.owner.register('service:featureToggles', FeatureTogglesSub);
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      expect(find('.new-information')).to.exist;
    });

    it('should not display NewInformation on dashboard if user has close it before', async function() {
      // given
      this.owner.register('service:currentUser', HasSeenNewDashboardInformationCurrentUserStub);
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      expect(find('section[data-test-new-dashboard-info]')).not.to.exist;
    });

    it('should display link on new dashboard banner when domain is pix.fr', async function() {
      // given
      class UrlStub extends Service {
        get isFrenchDomainExtension() {
          return true;
        }
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
      expect(find('.new-information')).to.exist;
      expect(find('.new-information-content-text__link')).to.exist;
    });

    it('should hide link on new dashboard banner when domain is pix.org', async function() {
      // given
      class UrlStub extends Service {
        get isFrenchDomainExtension() {
          return false;
        }
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
      expect(find('.new-information')).to.exist;
      expect(find('.new-information-content-text__link')).not.to.exist;
    });
  });

  describe('empty dashboard info rendering', function() {

    it('should display Empty Dashboard Information if user has nothing to do', async function() {
      // given
      this.owner.register('service:currentUser', CurrentUserStub);
      this.owner.register('service:featureToggles', FeatureTogglesSub);
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      expect(find('section[data-test-empty-dashboard]')).to.exist;
    });

    it('should not display Empty Dashboard Information on dashboard if user has competence to continue', async function() {
      // given
      this.owner.register('service:currentUser', HasSeenNewDashboardInformationCurrentUserStub);
      this.owner.register('service:featureToggles', FeatureTogglesSub);
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
      expect(find('section[data-test-empty-dashboard]')).not.to.exist;
    });

  });

  describe('user pix score rendering', function() {
    it('should display user score', async function() {
      // given
      this.owner.register('service:currentUser', CurrentUserStub);
      this.owner.register('service:featureToggles', FeatureTogglesSub);
      this.set('model', {
        campaignParticipationOverviews: [],
        campaignParticipations: [],
        scorecards: [],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}}/>`);

      // then
      expect(find('.dashboard-content__score')).to.exist;
      expect(find('.hexagon-score-content__pix-score').textContent).to.contains(pixScore);
    });
  });
});
