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
      expect(find('.tutorial-card')).to.exist;
      expect(find('.tutorial-card__content')).to.exist;
      expect(find('.tutorial-card-content__link').textContent).to.contains('Mon super tutoriel');
      expect(find('.tutorial-card-content__link').href).to.equals('https://exemple.net/');
      expect(find('.tutorial-card-content__details').textContent).to.contains('mon-tuto');
      expect(find('.tutorial-card-content__details').textContent).to.contains('vidéo');
      expect(find('.tutorial-card-content__details').textContent).to.contains('une minute');
      expect(find('.tutorial-card-content__actions')).to.exist;
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
      expect(find('.tutorial-card')).to.exist;
      expect(find('.tutorial-card__content')).to.exist;
      expect(find('.tutorial-card-content__link').textContent).to.contains('Mon super tutoriel');
      expect(find('.tutorial-card-content__link').href).to.equals('https://exemple.net/');
      expect(find('.tutorial-card-content__details').textContent).to.contains('mon-tuto');
      expect(find('.tutorial-card-content__details').textContent).to.contains('vidéo');
      expect(find('.tutorial-card-content__details').textContent).to.contains('une minute');
      expect(find('.tutorial-card-content__actions')).to.not.exist;
    });
  });
});
