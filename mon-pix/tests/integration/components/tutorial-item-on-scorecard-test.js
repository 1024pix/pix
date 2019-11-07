import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | tutorial-item-on-scorecard', function() {
  setupRenderingTest();

  describe('Component rendering', function() {

    it('should render component', async function() {
      // given
      const tutorial = {};

      this.set('tutorial-item-on-scorecard', tutorial);

      // when
      await render(hbs`{{tutorial-item-on-scorecard tutorial=tutorial}}`);

      // then
      expect(this.element.querySelector('.tutorial')).to.exist;
    });

    it('should display the tutorial item with related information', async function() {
      // given
      const expectedImage = '/images/icons/icon-video-on-scorecard.svg';
      const tutorial = {
        title: 'Lorem Ipsum',
        format: 'vidéo',
        duration: '00:01:31',
      };

      this.set('tutorial', tutorial);

      // when
      await render(hbs`{{tutorial-item-on-scorecard tutorial=tutorial}}`);

      // then
      expect(find('.tutorial-header__title').textContent.trim()).to.contains(tutorial.title);
      expect(find('.tutorial-statistics__duration').textContent.trim()).to.contains('2 minutes');
      expect(findAll('img')).to.have.lengthOf(1);
      expect(find('img').getAttribute('src')).to.equal(expectedImage);
    });
  });
});
