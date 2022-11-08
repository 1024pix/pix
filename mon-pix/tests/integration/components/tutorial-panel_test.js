import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | Tutorial Panel', function () {
  setupIntlRenderingTest();

  context('when the result is not ok', function () {
    context('and a hint is present', function () {
      beforeEach(function () {
        this.set('hint', 'Ceci est un indice.');
        this.set('tutorials', []);
      });

      it('should render the hint', async function () {
        // when
        await render(hbs`<TutorialPanel @hint={{this.hint}} @tutorials={{this.tutorials}} />`);

        // then
        expect(find('.tutorial-panel')).to.exist;
        expect(find('.tutorial-panel__hint-container')).to.exist;
        expect(find('.tutorial-panel__hint-title')).to.exist;
        expect(find('.tutorial-panel__hint-picto-container')).to.exist;
        expect(find('.tutorial-panel__hint-picto')).to.exist;
        expect(find('.tutorial-panel__hint-content')).to.exist;
        expect(find('.tutorial-panel__hint-content').textContent.trim()).to.equal('Ceci est un indice.');
      });
    });

    context('and a tutorial is present', function () {
      beforeEach(function () {
        this.set('hint', 'Ceci est un indice');
        this.set('tutorials', [
          {
            title: 'Ceci est un tuto',
            duration: '20:00:00',
          },
        ]);
      });

      context('when the user is logged in', function () {
        it('should render the tutorial with actions', async function () {
          // given
          class CurrentUserStub extends Service {
            user = {
              firstName: 'Banana',
              email: 'banana.split@example.net',
              fullName: 'Banana Split',
            };
          }
          this.owner.register('service:currentUser', CurrentUserStub);

          // when
          await render(hbs`<TutorialPanel @hint={{this.hint}} @tutorials={{this.tutorials}} />`);

          // then
          expect(find('.tutorial-card')).to.exist;
          expect(find('.tutorial-card__content')).to.exist;
          expect(find('.tutorial-card-content__details')).to.exist;
          expect(find('.tutorial-card-content__actions')).to.exist;
          expect(find('[aria-label="Marquer ce tuto comme utile"]')).to.exist;
          expect(find('[aria-label="Enregistrer dans ma liste de tutos"]')).to.exist;
          expect(find('[title="Marquer ce tuto comme utile"]')).to.exist;
        });
      });

      context('when the user is not logged in', function () {
        it('should render the tutorial without actions', async function () {
          // given
          class CurrentUserStub extends Service {
            user = null;
          }
          this.owner.register('service:currentUser', CurrentUserStub);

          // when
          await render(hbs`<TutorialPanel @hint={{this.hint}} @tutorials={{this.tutorials}} />`);

          // then
          expect(find('.tutorial-card')).to.exist;
          expect(find('.tutorial-card__content')).to.exist;
          expect(find('.tutorial-card-content__details')).to.exist;
          expect(find('.tutorial-card-content__actions')).to.not.exist;
        });
      });
    });
  });
});
