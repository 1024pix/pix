import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | learning-more-panel', function() {
  setupIntlRenderingTest();

  it('renders a list item when there is at least one learningMore item', async function() {
    // given
    this.set('learningMoreTutorials', [{ titre: 'Ceci est un tuto', duration: '20:00:00', type: 'video' }]);

    // when
    await render(hbs`<LearningMorePanel @learningMoreTutorials={{this.learningMoreTutorials}}/>`);

    // then
    expect(findAll('.learning-more-panel__container')).to.have.length(1);
    expect(findAll('.learning-more-panel__list-container')).to.have.length(1);
    expect(find('.learning-more-panel__container').textContent).to.contains(this.intl.t('pages.learning-more.title'));
  });

  it('should not render a list when there is no LearningMore elements', async function() {
    // given
    this.set('learningMoreTutorials', null);

    // when
    await render(hbs`<LearningMorePanel @learningMoreTutorials={{this.learningMoreTutorials}}/>`);

    // then
    expect(findAll('.learning-more-panel__container')).to.have.lengthOf(0);
  });
});
