import { describe, it } from 'mocha';
import { expect } from 'chai';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

describe('Integration | Component | Tutorials | Card', function () {
  setupIntlRenderingTest();

  describe('when user is logged', function () {
    it('should render the component with actions', async function () {
      // given
      class CurrentUserStub extends Service {
        user = { firstName: 'John' };
      }
      this.owner.register('service:currentUser', CurrentUserStub);
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
      expect(find('.tutorial-card-v2__content')).to.exist;
      expect(find('.tutorial-card-v2-content__link'))
        .to.have.property('textContent')
        .that.contains('Mon super tutoriel');
      expect(find('.tutorial-card-v2-content__link')).to.have.property('href').that.equals('https://exemple.net/');
      expect(find('.tutorial-card-v2-content__details'))
        .to.have.property('textContent')
        .that.contains('mon-tuto')
        .and.contains('vidéo')
        .and.contains('une minute');
      expect(find('.tutorial-card-v2-content__actions')).to.exist;
      expect(find('[aria-label="Ne plus considérer ce tuto comme utile"]')).to.exist;
      expect(find('[aria-label="Retirer de ma liste de tutos"]')).to.exist;
      expect(find('[title="Ne plus considérer ce tuto comme utile"]')).to.exist;
    });
  });

  describe('when user is not logged', function () {
    it('should render the component without actions', async function () {
      // given
      class CurrentUserStub extends Service {
        user = null;
      }
      this.owner.register('service:currentUser', CurrentUserStub);
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
      expect(find('.tutorial-card-v2__content')).to.exist;
      expect(find('.tutorial-card-v2-content__link'))
        .to.have.property('textContent')
        .that.contains('Mon super tutoriel');
      expect(find('.tutorial-card-v2-content__link')).to.have.property('href').that.equals('https://exemple.net/');
      expect(find('.tutorial-card-v2-content__details'))
        .to.have.property('textContent')
        .that.contains('mon-tuto')
        .and.contains('vidéo')
        .and.contains('une minute');
      expect(find('.tutorial-card-v2-content__actions')).to.not.exist;
    });
  });
});
