import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, findAll, render } from '@ember/test-helpers';
import { A } from '@ember/array';
import EmberObject from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | learning-more-panel', function () {
  setupIntlRenderingTest();

  describe('when there is at least one learningMore item', function () {
    it('renders a list item when there is at least one learningMore item', async function () {
      // given
      this.set('learningMoreTutorials', [{ titre: 'Ceci est un tuto', duration: '20:00:00', type: 'video' }]);

      // when
      await render(hbs`<LearningMorePanel @learningMoreTutorials={{this.learningMoreTutorials}}/>`);

      // then
      expect(findAll('.learning-more-panel__container')).to.have.length(1);
      expect(findAll('.learning-more-panel__list-container')).to.have.length(1);
      expect(find('.learning-more-panel__container').textContent).to.contains(this.intl.t('pages.learning-more.title'));
    });

    describe('when newTutorials FT is enabled', function () {
      it('should display a list of new tutorial cards', async function () {
        // given
        const tuto1 = EmberObject.create({
          title: 'Tuto 1.1',
          tubeName: '@first_tube',
          tubePracticalTitle: 'Practical Title',
          duration: '00:15:10',
        });

        const tutorials = A([tuto1]);

        this.set('learningMoreTutorials', tutorials);

        // when
        await render(hbs`<LearningMorePanel @learningMoreTutorials={{this.learningMoreTutorials}} />`);

        // then
        expect(findAll('.tutorial-card-v2')).to.have.lengthOf(1);
      });
    });
  });

  it('should not render a list when there is no LearningMore elements', async function () {
    // given
    this.set('learningMoreTutorials', null);

    // when
    await render(hbs`<LearningMorePanel @learningMoreTutorials={{this.learningMoreTutorials}}/>`);

    // then
    expect(findAll('.learning-more-panel__container')).to.have.lengthOf(0);
  });
});
