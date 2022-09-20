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
    expect(find('.training-card')).to.have.property('href').that.equals('https://training.net/');
    expect(find('.training-card__visual')).to.exist;
    expect(find('.training-card__visual img'))
      .to.have.property('alt')
      .that.equals("Ministère de l'éducation nationale et de la jeunesse");
    expect(find('.training-card__content')).to.exist;
    expect(find('.training-card__title').textContent.trim()).to.equal('Mon super training');
    expect(find('.training-card__infos')).to.exist;
    expect(find('.training-card__type').textContent.trim()).to.equal('Webinaire');
    expect(find('.training-card__duration').textContent.trim()).to.equal('6h');
  });
});
