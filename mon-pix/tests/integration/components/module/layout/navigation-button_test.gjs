import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, triggerEvent } from '@ember/test-helpers';
import NavigationButton from 'mon-pix/components/module/layout/navigation-button';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | NavigationButton', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when screen is desktop', function (hooks) {
    hooks.beforeEach(function () {
      class MediaServiceStub extends Service {
        isMobile = false;
      }
      this.owner.register('service:media', MediaServiceStub);
    });

    test('should display a button with an icon', async function (assert) {
      const type = 'question-yourself';
      const section = {
        type,
      };
      const sectionsLength = [section].length;
      const currentSectionIndex = 1;
      const handleArrowKeyNavigation = sinon.stub();

      // when
      const screen = await render(
        <template>
          <NavigationButton
            @section={{section}}
            @sectionsLength={{sectionsLength}}
            @currentSectionIndex={{currentSectionIndex}}
            @isPastSection={{false}}
            @isCurrentSection={{true}}
            @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
          />
        </template>,
      );

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: `${t('pages.modulix.navigation.buttons.aria-label.steps', {
              indexSection: currentSectionIndex,
              totalSections: sectionsLength,
            })} ${t('pages.modulix.navigation.buttons.aria-label.enabled', {
              sectionTitle: 'Se questionner',
            })}`,
          }),
        )
        .exists();
      assert.dom(screen.getByRole('img', { hidden: true })).exists();
    });

    module('when isCurrentSection and isPastSection arguments are false', function () {
      test('should disable the navigation button', async function (assert) {
        // given
        const section = {
          type: 'question-yourself',
        };
        const sectionsLength = [section].length;
        const currentSectionIndex = 1;
        const handleArrowKeyNavigation = sinon.stub();

        // when
        const screen = await render(
          <template>
            <NavigationButton
              @section={{section}}
              @sectionsLength={{sectionsLength}}
              @currentSectionIndex={{currentSectionIndex}}
              @isPastSection={{false}}
              @isCurrentSection={{false}}
              @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByRole('button')).hasAttribute('aria-disabled', 'true');
      });

      test('should display a specific tooltip message', async function (assert) {
        const section = {
          type: 'question-yourself',
        };
        const sectionsLength = [section].length;
        const currentSectionIndex = 1;
        const handleArrowKeyNavigation = sinon.stub();

        // when
        const screen = await render(
          <template>
            <NavigationButton
              @section={{section}}
              @sectionsLength={{sectionsLength}}
              @currentSectionIndex={{currentSectionIndex}}
              @isPastSection={{false}}
              @isCurrentSection={{false}}
              @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
            />
          </template>,
        );

        // then
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        const tooltipText = t('pages.modulix.navigation.tooltip.disabled', {
          sectionTitle: t('pages.modulix.section.question-yourself'),
        });
        assert.dom(tooltip).hasText(tooltipText);
      });
    });

    module('when isCurrentSection argument is true', function () {
      test('should enable the navigation button', async function (assert) {
        // given
        const section = {
          type: 'question-yourself',
        };
        const sectionsLength = [section].length;
        const currentSectionIndex = 1;
        const handleArrowKeyNavigation = sinon.stub();

        // when
        const screen = await render(
          <template>
            <NavigationButton
              @section={{section}}
              @sectionsLength={{sectionsLength}}
              @currentSectionIndex={{currentSectionIndex}}
              @isPastSection={{false}}
              @isCurrentSection={{true}}
              @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByRole('button')).hasNoAttribute('aria-disabled');
      });

      test('should display section title as tooltip message', async function (assert) {
        // given
        const section = {
          type: 'question-yourself',
        };
        const sectionsLength = [section].length;
        const currentSectionIndex = 1;
        const handleArrowKeyNavigation = sinon.stub();

        // when
        const screen = await render(
          <template>
            <NavigationButton
              @section={{section}}
              @sectionsLength={{sectionsLength}}
              @currentSectionIndex={{currentSectionIndex}}
              @isPastSection={{false}}
              @isCurrentSection={{true}}
              @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
            />
          </template>,
        );

        // then
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        const tooltipText = t('pages.modulix.section.question-yourself');
        assert.dom(tooltip).hasText(tooltipText);
      });
    });

    module('when isPastSection argument is true', function () {
      test('should enable the navigation button', async function (assert) {
        // given
        const section = {
          type: 'question-yourself',
        };
        const sectionsLength = [section].length;
        const currentSectionIndex = 1;
        const handleArrowKeyNavigation = sinon.stub();

        // when
        const screen = await render(
          <template>
            <NavigationButton
              @section={{section}}
              @sectionsLength={{sectionsLength}}
              @currentSectionIndex={{currentSectionIndex}}
              @isPastSection={{true}}
              @isCurrentSection={{false}}
              @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByRole('button')).hasNoAttribute('aria-disabled');
      });

      test('should display section title as tooltip message', async function (assert) {
        // given
        const section = {
          type: 'question-yourself',
        };
        const sectionsLength = [section].length;
        const currentSectionIndex = 1;
        const handleArrowKeyNavigation = sinon.stub();

        // when
        const screen = await render(
          <template>
            <NavigationButton
              @section={{section}}
              @sectionsLength={{sectionsLength}}
              @currentSectionIndex={{currentSectionIndex}}
              @isPastSection={{true}}
              @isCurrentSection={{false}}
              @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
            />
          </template>,
        );

        // then
        const tooltip = screen.getByRole('tooltip', { hidden: true });
        const tooltipText = t('pages.modulix.section.question-yourself');
        assert.dom(tooltip).hasText(tooltipText);
      });
    });

    module('on tooltip', function () {
      test('should not vocalise the tooltip for screen readers', async function (assert) {
        // given
        const section = {
          id: 'section1',
          type: 'question-yourself',
        };
        const sectionsLength = [section].length;
        const currentSectionIndex = 1;
        const handleArrowKeyNavigation = sinon.stub();

        //  when
        await render(
          <template>
            <NavigationButton
              @section={{section}}
              @sectionsLength={{sectionsLength}}
              @currentSectionIndex={{currentSectionIndex}}
              @isCurrentSection={{true}}
              @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
            />
          </template>,
        );

        // then
        assert.dom('.navigation-tooltip__content').hasAttribute('aria-hidden', 'true');
      });

      module('when a button is hovered', function () {
        test('should display tooltip', async function (assert) {
          // given
          const section = {
            id: 'section1',
            type: 'question-yourself',
          };
          const sectionsLength = [section].length;
          const currentSectionIndex = 1;
          const handleArrowKeyNavigation = sinon.stub();

          //  when
          await render(
            <template>
              <NavigationButton
                @section={{section}}
                @sectionsLength={{sectionsLength}}
                @currentSectionIndex={{currentSectionIndex}}
                @isCurrentSection={{true}}
                @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
              />
            </template>,
          );

          // then
          assert.dom('.navigation-tooltip').doesNotHaveClass('navigation-tooltip--visible');
          await triggerEvent('.navigation-tooltip', 'mouseenter');
          assert.dom('.navigation-tooltip').hasClass('navigation-tooltip--visible');
        });

        module('then when a button is left', function () {
          test('should not display tooltip anymore', async function (assert) {
            // given
            const section = {
              id: 'section1',
              type: 'question-yourself',
              grains: [
                { title: 'Grain title', type: 'discovery', id: '123-abc' },
                { title: 'Grain title', type: 'activity', id: '234-abc' },
              ],
            };
            const sectionsLength = [section].length;
            const currentSectionIndex = 1;
            const handleArrowKeyNavigation = sinon.stub();

            //  when
            await render(
              <template>
                <NavigationButton
                  @section={{section}}
                  @sectionsLength={{sectionsLength}}
                  @currentSectionIndex={{currentSectionIndex}}
                  @isCurrentSection={{true}}
                  @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
                />
              </template>,
            );

            // then
            await triggerEvent('.navigation-tooltip', 'mouseenter');
            assert.dom('.navigation-tooltip').hasClass('navigation-tooltip--visible');
            await triggerEvent('.navigation-tooltip', 'mouseleave');
            assert.dom('.navigation-tooltip').doesNotHaveClass('navigation-tooltip--visible');
          });
        });
      });

      module('when a button is focused', function () {
        test('should display tooltip', async function (assert) {
          // given
          const section = {
            id: 'section1',
            type: 'question-yourself',
            grains: [
              { title: 'Grain title', type: 'discovery', id: '123-abc' },
              { title: 'Grain title', type: 'activity', id: '234-abc' },
            ],
          };
          const sectionsLength = [section].length;
          const currentSectionIndex = 1;
          const handleArrowKeyNavigation = sinon.stub();

          //  when
          await render(
            <template>
              <NavigationButton
                @section={{section}}
                @sectionsLength={{sectionsLength}}
                @currentSectionIndex={{currentSectionIndex}}
                @isCurrentSection={{true}}
                @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
              />
            </template>,
          );

          // then
          assert.dom('.navigation-tooltip').doesNotHaveClass('navigation-tooltip--visible');
          await triggerEvent('.navigation-tooltip', 'focusin');
          assert.dom('.navigation-tooltip').hasClass('navigation-tooltip--visible');
        });

        module('then when a button is not focused anymore', function () {
          test('should not display tooltip anymore', async function (assert) {
            // given
            const section = {
              id: 'section1',
              type: 'question-yourself',
              grains: [
                { title: 'Grain title', type: 'discovery', id: '123-abc' },
                { title: 'Grain title', type: 'activity', id: '234-abc' },
              ],
            };
            const sectionsLength = [section].length;
            const currentSectionIndex = 1;
            const handleArrowKeyNavigation = sinon.stub();

            //  when
            await render(
              <template>
                <NavigationButton
                  @section={{section}}
                  @sectionsLength={{sectionsLength}}
                  @currentSectionIndex={{currentSectionIndex}}
                  @isCurrentSection={{true}}
                  @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
                />
              </template>,
            );

            // then
            await triggerEvent('.navigation-tooltip', 'focusin');
            assert.dom('.navigation-tooltip').hasClass('navigation-tooltip--visible');
            await triggerEvent('.navigation-tooltip', 'focusout');
            assert.dom('.navigation-tooltip').doesNotHaveClass('navigation-tooltip--visible');
          });
        });
      });
    });
  });

  module('when screen is mobile', function (hooks) {
    hooks.beforeEach(function () {
      class MediaServiceStub extends Service {
        isMobile = true;
      }
      this.owner.register('service:media', MediaServiceStub);
    });

    test('should display a button with an icon', async function (assert) {
      // given
      const type = 'question-yourself';
      const section = {
        type,
      };
      const sectionsLength = [section].length;
      const currentSectionIndex = 1;
      const handleArrowKeyNavigation = sinon.stub();

      // when
      const screen = await render(
        <template>
          <NavigationButton
            @section={{section}}
            @sectionsLength={{sectionsLength}}
            @currentSectionIndex={{currentSectionIndex}}
            @isPastSection={{false}}
            @isCurrentSection={{true}}
            @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('button')).hasText(t('pages.modulix.section.question-yourself'));
    });

    module('when isCurrentSection and isPastSection arguments are false', function () {
      test('should disable the navigation link', async function (assert) {
        // given
        const section = {
          type: 'question-yourself',
        };
        const sectionsLength = [section].length;
        const currentSectionIndex = 1;
        const handleArrowKeyNavigation = sinon.stub();

        // when
        const screen = await render(
          <template>
            <NavigationButton
              @section={{section}}
              @sectionsLength={{sectionsLength}}
              @currentSectionIndex={{currentSectionIndex}}
              @isPastSection={{false}}
              @isCurrentSection={{false}}
              @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByRole('button')).hasAria('disabled', 'true');
      });

      test('should display a button with a specific text', async function (assert) {
        // given
        const section = {
          type: 'question-yourself',
        };
        const sectionsLength = [section].length;
        const currentSectionIndex = 1;
        const handleArrowKeyNavigation = sinon.stub();

        // when
        const screen = await render(
          <template>
            <NavigationButton
              @section={{section}}
              @sectionsLength={{sectionsLength}}
              @currentSectionIndex={{currentSectionIndex}}
              @isPastSection={{false}}
              @isCurrentSection={{false}}
              @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
            />
          </template>,
        );

        // then
        const buttonText = t('pages.modulix.navigation.tooltip.disabled', {
          sectionTitle: t('pages.modulix.section.question-yourself'),
        });
        assert.dom(screen.getByRole('button')).hasText(buttonText);
      });
    });

    module('when isCurrentSection argument is true', function () {
      test('should enable the navigation link', async function (assert) {
        // given
        const section = {
          type: 'question-yourself',
        };
        const sectionsLength = [section].length;
        const currentSectionIndex = 1;
        const handleArrowKeyNavigation = sinon.stub();

        // when
        const screen = await render(
          <template>
            <NavigationButton
              @section={{section}}
              @sectionsLength={{sectionsLength}}
              @currentSectionIndex={{currentSectionIndex}}
              @isPastSection={{false}}
              @isCurrentSection={{true}}
              @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByRole('button')).hasNoAttribute('aria-disabled');
      });

      test('should display a button with section title as text', async function (assert) {
        // given
        const section = {
          type: 'question-yourself',
        };
        const sectionsLength = [section].length;
        const currentSectionIndex = 1;
        const handleArrowKeyNavigation = sinon.stub();

        // when
        const screen = await render(
          <template>
            <NavigationButton
              @section={{section}}
              @sectionsLength={{sectionsLength}}
              @currentSectionIndex={{currentSectionIndex}}
              @isPastSection={{false}}
              @isCurrentSection={{true}}
              @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
            />
          </template>,
        );

        // then
        const buttonText = t('pages.modulix.section.question-yourself');
        assert.dom(screen.getByRole('button')).hasText(buttonText);
      });
    });

    module('when isPastSection argument is true', function () {
      test('should enable the navigation link', async function (assert) {
        // given
        const section = {
          type: 'question-yourself',
        };
        const sectionsLength = [section].length;
        const currentSectionIndex = 1;
        const handleArrowKeyNavigation = sinon.stub();

        // when
        const screen = await render(
          <template>
            <NavigationButton
              @section={{section}}
              @sectionsLength={{sectionsLength}}
              @currentSectionIndex={{currentSectionIndex}}
              @isPastSection={{true}}
              @isCurrentSection={{false}}
              @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByRole('button')).hasNoAttribute('aria-disabled');
      });

      test('should display a button with section title as text', async function (assert) {
        // given
        const section = {
          type: 'question-yourself',
        };
        const sectionsLength = [section].length;
        const currentSectionIndex = 1;
        const handleArrowKeyNavigation = sinon.stub();

        // when
        const screen = await render(
          <template>
            <NavigationButton
              @section={{section}}
              @sectionsLength={{sectionsLength}}
              @currentSectionIndex={{currentSectionIndex}}
              @isPastSection={{true}}
              @isCurrentSection={{false}}
              @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
            />
          </template>,
        );

        // then
        const buttonText = t('pages.modulix.section.question-yourself');
        assert.dom(screen.getByRole('button')).hasText(buttonText);
      });
    });

    test('should set aria-current attribute to NavigationButton element', async function (assert) {
      // given
      const section = {
        type: 'question-yourself',
      };
      const sectionsLength = [section].length;
      const currentSectionIndex = 1;
      const handleArrowKeyNavigation = sinon.stub();

      // when
      const screen = await render(
        <template>
          <NavigationButton
            @section={{section}}
            @sectionsLength={{sectionsLength}}
            @currentSectionIndex={{currentSectionIndex}}
            @isPastSection={{true}}
            @isCurrentSection={{true}}
            @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
          />
        </template>,
      );

      // then
      assert
        .dom(
          screen.getByRole('button', {
            name: `${t('pages.modulix.navigation.buttons.aria-label.steps', {
              indexSection: currentSectionIndex,
              totalSections: sectionsLength,
            })} ${t('pages.modulix.navigation.buttons.aria-label.enabled', {
              sectionTitle: 'Se questionner',
            })}`,
          }),
        )
        .hasAria('current', 'step');
    });
  });

  module('when user click on navigation button', function () {
    test('should call focusAndScroll service', async function (assert) {
      // given
      const section = {
        type: 'question-yourself',
      };
      const sectionsLength = [section].length;
      const currentSectionIndex = 1;
      const focusAndScroll = sinon.stub();
      class ModulixAutoScrollService extends Service {
        focusAndScroll = focusAndScroll;
      }
      this.owner.register('service:modulix-auto-scroll', ModulixAutoScrollService);
      const handleArrowKeyNavigation = sinon.stub();

      // when
      const screen = await render(
        <template>
          <NavigationButton
            @section={{section}}
            @sectionsLength={{sectionsLength}}
            @currentSectionIndex={{currentSectionIndex}}
            @isPastSection={{false}}
            @isCurrentSection={{true}}
            @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
          />
        </template>,
      );
      await click(
        screen.getByRole('button', {
          name: `${t('pages.modulix.navigation.buttons.aria-label.steps', {
            indexSection: currentSectionIndex,
            totalSections: sectionsLength,
          })} ${t('pages.modulix.navigation.buttons.aria-label.enabled', {
            sectionTitle: 'Se questionner',
          })}`,
        }),
      );

      // then
      sinon.assert.called(focusAndScroll);
      assert.ok(true);
    });

    test('should push analytics event', async function (assert) {
      // given
      const section = {
        id: 'section1',
        type: 'question-yourself',
      };
      const sectionsLength = [section].length;
      const currentSectionIndex = 1;
      const trackEvent = sinon.stub();
      const handleArrowKeyNavigation = sinon.stub();

      class MetricsStubService extends Service {
        trackEvent = trackEvent;
      }
      this.owner.register('service:pix-metrics', MetricsStubService);
      const focusAndScroll = sinon.stub();
      class ModulixAutoScrollService extends Service {
        focusAndScroll = focusAndScroll;
      }
      this.owner.register('service:modulix-auto-scroll', ModulixAutoScrollService);

      //  when
      const screen = await render(
        <template>
          <NavigationButton
            @section={{section}}
            @sectionsLength={{sectionsLength}}
            @currentSectionIndex={{currentSectionIndex}}
            @isCurrentSection={{true}}
            @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
          />
        </template>,
      );
      await click(
        screen.getByRole('button', {
          name: `${t('pages.modulix.navigation.buttons.aria-label.steps', {
            indexSection: currentSectionIndex,
            totalSections: sectionsLength,
          })} ${t('pages.modulix.navigation.buttons.aria-label.enabled', {
            sectionTitle: 'Se questionner',
          })}`,
        }),
      );

      // then
      sinon.assert.calledWithExactly(trackEvent, 'Clic sur le bouton de la navigation', {
        category: 'Modulix',
        sectionId: 'section1',
      });
      assert.ok(true);
    });
  });

  module('when user click on a disabled navigation button', function () {
    test('should not call focusAndScroll service', async function (assert) {
      // given
      const section = {
        type: 'question-yourself',
      };
      const sectionsLength = [section].length;
      const currentSectionIndex = 1;
      const focusAndScroll = sinon.stub();
      const handleArrowKeyNavigation = sinon.stub();
      class ModulixAutoScrollService extends Service {
        focusAndScroll = focusAndScroll;
      }
      this.owner.register('service:modulix-auto-scroll', ModulixAutoScrollService);

      // when
      const screen = await render(
        <template>
          <NavigationButton
            @section={{section}}
            @sectionsLength={{sectionsLength}}
            @currentSectionIndex={{currentSectionIndex}}
            @isPastSection={{false}}
            @isCurrentSection={{false}}
            @handleArrowKeyNavigation={{handleArrowKeyNavigation}}
          />
        </template>,
      );
      await click(
        screen.getByRole('button', {
          name: `${t('pages.modulix.navigation.buttons.aria-label.steps', {
            indexSection: currentSectionIndex,
            totalSections: sectionsLength,
          })} ${t('pages.modulix.navigation.buttons.aria-label.disabled')}`,
        }),
      );

      // then
      sinon.assert.notCalled(focusAndScroll);
      assert.ok(true);
    });
  });
});
