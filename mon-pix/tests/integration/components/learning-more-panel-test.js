import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | learning-more-panel', function() {
  setupRenderingTest();

  it('renders a list item when there is at least one learningMore item', async function() {
    // given
    this.set('learningMoreTutorials', [{ titre: 'Ceci est un tuto', duration: '20:00:00', type: 'video' }]);

    // when
    await render(hbs`{{learning-more-panel learningMoreTutorials=learningMoreTutorials}}`);

    // then
    expect(findAll('.learning-more-panel__container')).to.have.length(1);
    expect(findAll('.learning-more-panel__list-container')).to.have.length(1);
    expect(find('.learning-more-panel__container').textContent).to.contains('Pour en apprendre davantage');
  });

  it('should not render a list when there is no LearningMore elements', async function() {
    // given
    this.set('learningMoreTutorials', null);

    // when
    await render(hbs`{{learning-more-panel learningMoreTutorials=learningMoreTutorials}}`);

    // then
    expect(findAll('.learning-more-panel__container')).to.have.lengthOf(0);
  });
});
