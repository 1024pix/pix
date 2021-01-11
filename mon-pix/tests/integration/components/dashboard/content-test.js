import EmberObject from '@ember/object';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

describe('Integration | Component | Dashboard | Content', function() {
  setupIntlRenderingTest();

  it('should render component', async function() {
    // given
    this.set('model', {});

    // when
    await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

    // then
    expect(find('.dashboard-content')).to.exist;
  });

  describe('campaign-participation-overview rendering', function() {
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
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      expect(find('section[data-test-campaign-participation-overviews]')).to.exist;
    });

    it('should not render campaign participations when there is no campaign participation overviews', async function() {
      // given
      this.set('model', {});

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      expect(find('section[data-test-campaign-participation-overviews]')).to.not.exist;
    });
  });

  describe('recommended competence-card rendering', function() {
    it('should render competence-card when there is at least one competence-card', async function() {
      // given
      const scorecard = EmberObject.create();
      this.set('model', {
        scorecards: [scorecard],
      });

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      expect(find('section[data-test-recommended-competences]')).to.exist;
    });

    it('should not render competence-card when there is no competence-card', async function() {
      // given
      this.set('model', {});

      // when
      await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

      // then
      expect(find('section[data-test-recommended-competences]')).to.not.exist;
    });
  });
});
