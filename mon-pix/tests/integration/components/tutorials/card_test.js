import { describe, it } from 'mocha';
import { expect } from 'chai';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

describe('Integration | Component | Tutorials | Card', function () {
  setupIntlRenderingTest();

  it('renders component', async function () {
    // given
    this.set('tutorial', {
      title: 'Mon super tutoriel',
      link: 'https://exemple.net',
      source: 'mon-tuto',
      format: 'vidéo',
      duration: '00:01:00',
      isEvaluated: true,
      isSaved: true,
    });

    // when
    await render(hbs`<Tutorials::Card @tutorial={{this.tutorial}} />`);

    // then
    expect(find('.tutorial-card-v2')).to.exist;
    expect(find('.tutorial-card-v2__domain-border')).to.exist;
    expect(find('.tutorial-card-v2__content')).to.exist;
    expect(find('.tutorial-card-v2-content__skill')).to.exist;
    expect(find('.tutorial-card-v2-content__link')).to.exist;
    expect(find('.tutorial-card-v2-content__details')).to.exist;
    expect(find('.tutorial-card-v2-content__spacer')).to.exist;
    expect(find('.tutorial-card-v2-content__actions')).to.exist;
    expect(find('.tutorial-card-v2-content-actions__save')).to.exist;
    expect(find('.tutorial-card-v2-content-actions__evaluate')).to.exist;
  });
});
