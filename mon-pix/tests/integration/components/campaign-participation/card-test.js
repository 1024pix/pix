import EmberObject from '@ember/object';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

describe('Integration | Component | CampaignParticipation | Card', function() {
  setupIntlRenderingTest();

  it('should render component with a started state', async function() {
    // given
    const campaignParticipation = EmberObject.create({
      isShared: false,
      createdAt: '2020-12-10T15:16:20.109Z',
      assessment: EmberObject.create({
        isCompleted: false,
        state: 'started',
      }),
      campaign: {
        title: 'My campaign',
      },
    });
    this.set('campaignParticipation', campaignParticipation);

    // when
    await render(hbs`<CampaignParticipation::Card @model={{campaignParticipation}} />}`);

    // then
    expect(find('h1').textContent).to.equal('My campaign');
    expect(find('[data-test-tag]')).to.exist;
    expect(find('[data-test-tag]').textContent.trim()).to.equal(this.intl.t('pages.campaign-participation.card.tag.started'));
    expect(find('time').getAttribute('datetime')).to.equal('2020-12-10T15:16:20.109Z');
    expect(find('a').textContent.trim()).to.equal(this.intl.t('pages.campaign-participation.card.resume'));
  });

  it('should render component with a completed state but not shared', async function() {
    // given
    const campaignParticipation = EmberObject.create({
      isShared: false,
      createdAt: '2020-12-10T15:16:20.109Z',
      assessment: EmberObject.create({
        isCompleted: true,
        state: 'completed',
      }),
      campaign: {
        title: 'My campaign',
      },
    });
    this.set('campaignParticipation', campaignParticipation);

    // when
    await render(hbs`<CampaignParticipation::Card @model={{campaignParticipation}} />}`);

    // then
    expect(find('[data-test-tag]').textContent.trim()).to.equal(this.intl.t('pages.campaign-participation.card.tag.completed'));
    expect(find('a').textContent.trim()).to.equal(this.intl.t('pages.campaign-participation.card.send'));
  });
});
