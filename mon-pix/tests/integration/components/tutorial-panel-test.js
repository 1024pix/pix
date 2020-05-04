import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | tutorial panel', function() {
  setupRenderingTest();

  context('when the result is not ok', function() {
    context('and a hint is present', function() {
      beforeEach(function() {
        this.set('hint', 'Ceci est un indice.');
        this.set('tutorials', []);
      });

      it('should render the hint', async function() {
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

    context('and a tutorial is present', function() {
      beforeEach(function() {
        this.set('hint', 'Ceci est un indice');
        this.set('tutorials', [
          {
            title: 'Ceci est un tuto',
            duration: '20:00:00'
          }
        ]);
      });

      context('when the user is logged in', function() {
        beforeEach(function() {
          this.owner.register('service:currentUser', Service.extend({
            user: {
              firstName: 'Banana',
              email: 'banana.split@example.net',
              fullName: 'Banana Split',
            }
          }));
        });

        it('should render the tutorial with actions', async function() {
          // when
          await render(hbs`<TutorialPanel @hint={{this.hint}} @tutorials={{this.tutorials}} />`);

          // then
          expect(find('.tutorial-item')).to.exist;
          expect(find('.tutorial__content')).to.exist;
          expect(find('.tutorial-content__title')).to.exist;
          expect(find('.tutorial-content__duration')).to.exist;
          expect(find('.tutorial-content-actions__save')).to.exist;
          expect(find('.tutorial-content-actions__evaluate')).to.exist;
        });
      });

      context('when the user is not logged in', function() {
        it('should render the tutorial without actions', async function() {
          // when
          await render(hbs`<TutorialPanel @hint={{this.hint}} @tutorials={{this.tutorials}} />`);

          // then
          expect(find('.tutorial-item')).to.exist;
          expect(find('.tutorial__content')).to.exist;
          expect(find('.tutorial-content__title')).to.exist;
          expect(find('.tutorial-content__duration')).to.exist;
          expect(find('.tutorial-content-actions')).to.not.exist;
        });
      });
    });
  });
});
