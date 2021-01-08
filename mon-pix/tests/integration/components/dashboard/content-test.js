import EmberObject from '@ember/object';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

describe('Integration | Component | Dashboard | Content', function() {
  setupIntlRenderingTest();

  it('should render component', async function() {
    // when
    await render(hbs`<Dashboard::Content />}`);

    // then
    expect(find('.dashboard-content')).to.exist;
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
    this.set('model', [campaignParticipationOverview]);

    // when
    await render(hbs`<Dashboard::Content @model={{this.model}} />}`);

    // then
    expect(find('.dashboard-content__campaign-participation-overviews')).to.exist;
  });

  it('should not render campaign participations when there is no campaign participation overviews', async function() {
    // when
    await render(hbs`<Dashboard::Content />}`);

    // then
    expect(find('.dashboard-content__campaign-participation-overviews')).to.not.exist;
  });
});
