import Service from '@ember/service';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { click, find, render, triggerEvent, triggerKeyEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

describe('Integration | Component | FocusedTooltip', function() {

  setupIntlRenderingTest();

  function addChallengeToContext(component, challenge) {
    component.set('challenge', challenge);
  }

  function renderFocusedTooltip(component) {
    component.set('onTooltipClose', () => {});
    return render(hbs`<Challenge::ChallengeStatement::FocusedTooltip @challenge={{this.challenge}} @onTooltipClose={{this.onTooltipClose}}/>`);
  }

  const tooltip = '.challenge-statement__tag-information';
  const confirmationButton = '.challenge-statement-tag-information__button';

  describe('when user has not seen the tooltip yet', function() {
    it('should render the tooltip with a confirmation button', async function() {
      // given
      class currentUser extends Service {
        user = {
          hasSeenFocusedChallengeTooltip: false,
        }
      }
      this.owner.unregister('service:currentUser');
      this.owner.register('service:currentUser', currentUser);

      addChallengeToContext(this, {
        instruction: 'La consigne de mon test',
        id: 'rec_challenge',
        focused: true,
      });

      // when
      await renderFocusedTooltip(this);

      // then
      expect(find(tooltip)).to.exist;
      expect(find(confirmationButton)).to.exist;
    });

    it('should remove the tooltip when confirmation button has been clicked', async function() {
      // given
      class currentUser extends Service {
        user = {
          hasSeenFocusedChallengeTooltip: false,
        }
      }
      this.owner.unregister('service:currentUser');
      this.owner.register('service:currentUser', currentUser);

      addChallengeToContext(this, {
        instruction: 'La consigne de mon test',
        id: 'rec_challenge',
        focused: true,
      });
      await renderFocusedTooltip(this);

      // when
      await click('.challenge-statement-tag-information__button');

      // then
      expect(find(tooltip)).to.not.exist;
    });
  });

  describe('when user has seen the tooltip', function() {
    describe('when the challenge starts', function() {
      it('should not render the tooltip', async function() {
        // given
        class currentUser extends Service {
          user = {
            hasSeenFocusedChallengeTooltip: true,
          }
        }

        this.owner.unregister('service:currentUser');
        this.owner.register('service:currentUser', currentUser);

        addChallengeToContext(this, {
          instruction: 'La consigne de mon test',
          id: 'rec_challenge',
          focused: true,
        });

        // when
        await renderFocusedTooltip(this);

        // then
        expect(find(tooltip)).to.not.exist;
      });
    });

    describe('when the user hovers the challenge icon', function() {
      describe('when using a mouse', function() {
        it('should display the tooltip without a confirmation button when entering the icon', async function() {
          // given
          class currentUser extends Service {
            user = {
              hasSeenFocusedChallengeTooltip: true,
            }
          }

          this.owner.unregister('service:currentUser');
          this.owner.register('service:currentUser', currentUser);

          addChallengeToContext(this, {
            instruction: 'La consigne de mon test',
            id: 'rec_challenge',
            focused: true,
          });

          // when
          await renderFocusedTooltip(this);
          await triggerEvent('.challenge-statement-tag__icon-button', 'mouseenter');

          // then
          expect(find(tooltip)).to.exist;
          expect(find(confirmationButton)).to.not.exist;
        });

        it('should the hide tooltip when mouse leaves the icon', async function() {
          // given
          class currentUser extends Service {
            user = {
              hasSeenFocusedChallengeTooltip: true,
            }
          }

          this.owner.unregister('service:currentUser');
          this.owner.register('service:currentUser', currentUser);

          addChallengeToContext(this, {
            instruction: 'La consigne de mon test',
            id: 'rec_challenge',
            focused: true,
          });

          // when
          await renderFocusedTooltip(this);
          await triggerEvent('.challenge-statement-tag__icon-button', 'mouseenter');
          await triggerEvent('.challenge-statement-tag__icon-button', 'mouseleave');

          // then
          expect(find(tooltip)).to.not.exist;
        });
      });

      describe('when using a keyboard', function() {

        beforeEach(async function() {
          class currentUser extends Service {
            user = {
              hasSeenFocusedChallengeTooltip: true,
            }
          }

          this.owner.unregister('service:currentUser');
          this.owner.register('service:currentUser', currentUser);

          addChallengeToContext(this, {
            instruction: 'La consigne de mon test',
            id: 'rec_challenge',
            focused: true,
          });

          await renderFocusedTooltip(this);
        });

        it('should hide the tooltip button when escaping', async function() {
          // given
          await triggerEvent('.challenge-statement-tag__icon-button', 'mouseenter');
          expect(find(tooltip)).to.exist;

          // when
          const escapeKeyCode = 27;
          await triggerKeyEvent('.challenge-statement-tag__icon-button', 'keyup', escapeKeyCode);

          // then
          expect(find(tooltip)).to.not.exist;
        });

      });
    });

    describe('when the user clicks on the challenge icon', function() {
      it('should display the tooltip without a confirmation button when entering the icon', async function() {
        // given
        class currentUser extends Service {
          user = {
            hasSeenFocusedChallengeTooltip: true,
          }
        }

        this.owner.unregister('service:currentUser');
        this.owner.register('service:currentUser', currentUser);

        addChallengeToContext(this, {
          instruction: 'La consigne de mon test',
          id: 'rec_challenge',
          focused: true,
        });

        // when
        await renderFocusedTooltip(this);
        await click('.challenge-statement-tag__icon-button');

        // then
        expect(find(tooltip)).to.exist;
        expect(find(confirmationButton)).to.not.exist;
      });
    });
  });
});
