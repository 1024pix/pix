import Service from '@ember/service';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { click, find, render, triggerEvent, triggerKeyEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

describe('Integration | Component | Tooltip', function () {
  setupIntlRenderingTest();

  const tooltip = '.tooltip-tag__information';
  const tooltipTitle = '.tooltip-tag-information__title';
  const confirmationButton = '.tooltip-tag-information__button';

  describe('when challenge is focused', function () {
    describe('when user has not seen the tooltip yet', function () {
      beforeEach(async function () {
        // given
        class currentUser extends Service {
          user = {
            hasSeenFocusedChallengeTooltip: false,
            save: () => {},
          };
        }
        this.owner.unregister('service:currentUser');
        this.owner.register('service:currentUser', currentUser);

        this.set('challenge', {
          instruction: 'La consigne de mon test',
          id: 'rec_challenge',
          focused: true,
        });
        await render(hbs`<Challenge::Statement::Tooltip @challenge={{this.challenge}}/>`);
      });

      it('should render the tooltip with a confirmation button', async function () {
        // then
        expect(find(tooltip)).to.be.displayed;
        expect(find(tooltipTitle)).to.exist;
        expect(find('.tooltip__tag--focused')).to.be.displayed;
        expect(find(confirmationButton)).to.exist;
      });

      it('should remove the tooltip when confirmation button has been clicked', async function () {
        // when
        await click('.tooltip-tag-information__button');
        // then
        expect(find(tooltip)).not.to.be.displayed;
      });
    });

    describe('when user has seen the tooltip', function () {
      beforeEach(async function () {
        // given
        class currentUser extends Service {
          user = {
            hasSeenFocusedChallengeTooltip: true,
          };
        }

        this.owner.unregister('service:currentUser');
        this.owner.register('service:currentUser', currentUser);

        this.set('challenge', {
          instruction: 'La consigne de mon test',
          id: 'rec_challenge',
          focused: true,
        });
        await render(hbs`<Challenge::Statement::Tooltip @challenge={{this.challenge}}/>`);
      });

      describe('when the challenge starts', function () {
        it('should not render the tooltip', async function () {
          // then
          expect(find(tooltip)).not.to.be.displayed;
        });
      });

      describe('when the user hovers the challenge icon', function () {
        describe('when using a mouse', function () {
          it('should display the tooltip without a confirmation button when entering the icon', async function () {
            // when
            await triggerEvent('.tooltip-tag__icon-button', 'mouseenter');

            // then
            expect(find(tooltip)).to.be.displayed;
            expect(find(tooltipTitle)).to.exist;
            expect(find(confirmationButton)).to.not.exist;
          });

          it('should the hide tooltip when mouse leaves the icon', async function () {
            // when
            await triggerEvent('.tooltip-tag__icon-button', 'mouseenter');
            await triggerEvent('.tooltip-tag__icon-button', 'mouseleave');

            // then
            expect(find(tooltip)).not.to.be.displayed;
          });
        });

        describe('when using a keyboard', function () {
          it('should hide the tooltip button when escaping', async function () {
            // given
            await triggerEvent('.tooltip-tag__icon-button', 'mouseenter');
            expect(find(tooltip)).to.be.displayed;

            // when
            const escapeKeyCode = 27;
            await triggerKeyEvent('.tooltip-tag__icon-button', 'keyup', escapeKeyCode);

            // then
            expect(find(tooltip)).not.to.be.displayed;
          });
        });
      });

      describe('when the user clicks on the challenge icon', function () {
        it('should display the tooltip without a confirmation button when entering the icon', async function () {
          // when
          await click('.tooltip-tag__icon-button');

          // then
          expect(find(tooltip)).to.be.displayed;
          expect(find(tooltipTitle)).to.exist;
          expect(find(confirmationButton)).to.not.exist;
        });
      });
    });
  });

  describe('when challenge is not focused', function () {
    describe('when user has not seen the tooltip yet', function () {
      beforeEach(async function () {
        // given
        class currentUser extends Service {
          user = {
            hasSeenOtherChallengesTooltip: false,
            save: () => {},
          };
        }
        this.owner.unregister('service:currentUser');
        this.owner.register('service:currentUser', currentUser);

        this.set('challenge', {
          instruction: 'La consigne de mon test',
          id: 'rec_challenge',
          focused: false,
        });
        await render(hbs`<Challenge::Statement::Tooltip @challenge={{this.challenge}}/>`);
      });

      it('should render the tooltip with a confirmation button', async function () {
        // then
        expect(find(tooltip)).to.be.displayed;
        expect(find('.tooltip__tag--regular')).to.be.displayed;
        expect(find(confirmationButton)).to.exist;
      });

      it('should remove the tooltip when confirmation button has been clicked', async function () {
        // when
        await click('.tooltip-tag-information__button');

        // then
        expect(find(tooltip)).not.to.be.displayed;
      });
    });

    describe('when user has seen the tooltip', function () {
      beforeEach(async function () {
        // given
        class currentUser extends Service {
          user = {
            hasSeenOtherChallengesTooltip: true,
          };
        }

        this.owner.unregister('service:currentUser');
        this.owner.register('service:currentUser', currentUser);

        this.set('challenge', {
          instruction: 'La consigne de mon test',
          id: 'rec_challenge',
          focused: false,
        });
        await render(hbs`<Challenge::Statement::Tooltip @challenge={{this.challenge}}/>`);
      });

      describe('when the challenge starts', function () {
        it('should not render the tooltip', async function () {
          // then
          expect(find(tooltip)).not.to.be.displayed;
        });
      });

      describe('when the user hovers the challenge icon', function () {
        describe('when using a mouse', function () {
          it('should display the tooltip without a confirmation button when entering the icon', async function () {
            // when
            await triggerEvent('.tooltip-tag__icon-button', 'mouseenter');

            // then
            expect(find(tooltip)).to.be.displayed;
            expect(find(confirmationButton)).to.not.exist;
          });

          it('should the hide tooltip when mouse leaves the icon', async function () {
            // when
            await triggerEvent('.tooltip-tag__icon-button', 'mouseenter');
            await triggerEvent('.tooltip-tag__icon-button', 'mouseleave');

            // then
            expect(find(tooltip)).not.to.be.displayed;
          });
        });

        describe('when using a keyboard', function () {
          it('should hide the tooltip button when escaping', async function () {
            // given
            await triggerEvent('.tooltip-tag__icon-button', 'mouseenter');
            expect(find(tooltip)).to.be.displayed;

            // when
            const escapeKeyCode = 27;
            await triggerKeyEvent('.tooltip-tag__icon-button', 'keyup', escapeKeyCode);

            // then
            expect(find(tooltip)).not.to.be.displayed;
          });
        });
      });

      describe('when the user clicks on the challenge icon', function () {
        it('should display the tooltip without a confirmation button when entering the icon', async function () {
          // when
          await click('.tooltip-tag__icon-button');

          // then
          expect(find(tooltip)).to.be.displayed;
          expect(find(confirmationButton)).to.not.exist;
        });
      });
    });
  });
});
