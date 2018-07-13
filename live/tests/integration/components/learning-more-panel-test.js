import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | learning-more-panel', function() {
  setupComponentTest('learning-more-panel', {
    integration: true
  });

  it('renders a list item when there is at least one learningMore item', function() {
    // given
    this.set('learningMoreTutorials', [{ titre: 'Ceci est un tuto', duration: '20:00:00', type: 'video' }]);

    // when
    this.render(hbs`{{learning-more-panel learningMoreTutorials=learningMoreTutorials}}`);

    // then
    expect(this.$('.learning-more-panel__container')).to.have.length(1);
    expect(this.$('.learning-more-panel__list-container')).to.have.length(1);
    expect(this.$('.learning-more-panel__container').text()).to.contains('Pour en apprendre davantage');
  });

  it('should not render a list when there is no LearningMore elements', function() {
    // given
    this.set('learningMoreTutorials', null);

    // when
    this.render(hbs`{{learning-more-panel learningMoreTutorials=learningMoreTutorials}}`);

    // then
    expect(this.$('.learning-more-panel__container')).to.have.lengthOf(0);
  });
});
