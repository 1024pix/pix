import { describe, it } from 'mocha';
import { expect } from 'chai';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

describe('Integration | Component | Training | Card', function () {
  setupIntlRenderingTest();

  it('renders component', async function () {
    // given
    this.set('training', {
      title: 'Mon super training',
      link: 'https://training.net/',
      type: 'webinaire',
      locale: 'fr-fr',
      duration: { hours: 6 },
    });

    // when
    await render(hbs`<Training::Card @training={{this.training}} />`);

    // then
    expect(find('.training-card')).to.exist;
    expect(find('.training-card__content')).to.have.property('href').that.equals('https://training.net/');
    expect(find('.training-card-content__title').textContent.trim()).to.equal('Mon super training');
    expect(find('.training-card-content__infos')).to.exist;
    expect(find('.training-card-content-infos-list__type').textContent.trim()).to.equal('Webinaire');
    expect(find('.training-card-content-infos-list__duration').textContent.trim()).to.equal('6h');
    expect(find('.training-card-content-illustration__image')).to.have.property('alt').to.be.empty;
    expect(find('.training-card-content-illustration__logo'))
      .to.have.property('alt')
      .that.equals(this.intl.t('common.french-education-ministry'));
  });
});
