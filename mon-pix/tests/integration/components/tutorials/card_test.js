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
      link: 'https://exemple.net/',
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
    expect(find('.tutorial-card-v2-content__skill'))
      .to.have.property('textContent')
      .that.contains("Mener une recherche et une veille d'information");
    expect(find('.tutorial-card-v2-content__link')).to.have.property('textContent').that.contains('Mon super tutoriel');
    expect(find('.tutorial-card-v2-content__link')).to.have.property('href').that.equals('https://exemple.net/');
    expect(find('.tutorial-card-v2-content__details'))
      .to.have.property('textContent')
      .that.contains('mon-tuto')
      .and.contains('vidéo')
      .and.contains('une minute');
    expect(find('.tutorial-card-v2-content__actions')).to.exist;
    expect(find('.tutorial-card-v2-content-actions__save'))
      .to.have.property('textContent')
      .that.contains(this.intl.t('pages.user-tutorials.list.tutorial.actions.remove.label'));
    expect(find('.tutorial-card-v2-content-actions__evaluate')).to.exist;
  });
});
