import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import dayjs from 'dayjs';
import CustomParseFormat from 'dayjs/plugin/customParseFormat';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import { t } from 'ember-intl/test-support';
import EvaluationResultsHero from 'mon-pix/components/campaigns/assessment/results/evaluation-results-hero/index';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubCurrentUserService } from '../../../../../../helpers/service-stubs';
import setupIntlRenderingTest from '../../../../../../helpers/setup-intl-rendering';

dayjs.extend(LocalizedFormat);
dayjs.extend(CustomParseFormat);

module('Integration | Components | Campaigns | Assessment | Results | Evaluation Results Hero', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('global behaviour', function (hooks) {
    let screen;

    hooks.beforeEach(async function () {
      // given
      const campaign = { organizationId: 1 };
      const campaignParticipationResult = { masteryRate: 0.755, sharedAt: new Date('2024-01-01T14:03:00Z') };
      stubCurrentUserService(this.owner, { id: 1, firstName: 'Hermione' });

      // when
      screen = await render(
        <template>
          <EvaluationResultsHero @campaign={{campaign}} @campaignParticipationResult={{campaignParticipationResult}} />
        </template>,
      );
    });

    test('it should display a congratulation title', async function (assert) {
      // then
      const title = screen.getByRole('heading', {
        name: t('pages.skill-review.hero.thanks', { name: 'Hermione' }).replace('\n', ''),
      });
      assert.dom(title).exists();
    });

    test('it should display a rounded mastery rate', async function (assert) {
      // then
      const masteryRateElement = screen.getByText('76');
      assert.strictEqual(masteryRateElement.textContent, '76%');

      assert.dom(screen.getByText(t('pages.skill-review.hero.mastery-rate'))).exists();
    });
  });

  module('display quests results', function () {
    module('isQuestEnabled feature flag', function () {
      module('user is Anonymous', function () {
        test('it should not display the quest result if the flag is false', async function (assert) {
          // given
          stubCurrentUserService(this.owner, { id: 1, firstName: 'Hermione', isAnonymous: true });
          const featureToggles = this.owner.lookup('service:featureToggles');
          sinon.stub(featureToggles, 'featureToggles').value({ isQuestEnabled: false });

          const campaign = {
            customResultPageText: 'My custom result page text',
            organizationId: 1,
          };
          const campaignParticipationResult = {
            campaignParticipationBadges: [],
            masteryRate: 0.75,
            reachedStage: { acquired: 4, total: 5 },
          };
          const questResults = [
            {
              obtained: true,
              profileRewardId: 12,
              reward: { key: 'SIXTH_GRADE' },
            },
          ];

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHero
                @campaign={{campaign}}
                @questResults={{questResults}}
                @campaignParticipationResult={{campaignParticipationResult}}
              />
            </template>,
          );

          // then
          assert.notOk(screen.queryByText(t('components.campaigns.attestation-result.obtained')));
        });
      });

      module('user is not anonymous', function (hooks) {
        hooks.beforeEach(function () {
          class CurrentUserStub extends Service {
            user = { id: 2, isAnonymous: false };
          }

          this.owner.register('service:currentUser', CurrentUserStub);

          test('it should not display the quest result if the flag is true', async function (assert) {
            // given
            const featureToggles = this.owner.lookup('service:featureToggles');
            sinon.stub(featureToggles, 'featureToggles').value({ isQuestEnabled: true });

            const campaign = {
              customResultPageText: 'My custom result page text',
              organizationId: 1,
            };
            const campaignParticipationResult = {
              campaignParticipationBadges: [],
              masteryRate: 0.75,
              reachedStage: { acquired: 4, total: 5 },
            };
            const questResults = [
              {
                obtained: true,
                profileRewardId: 12,
                reward: { key: 'SIXTH_GRADE' },
              },
            ];

            // when
            const screen = await render(
              <template>
                <EvaluationResultsHero
                  @campaign={{campaign}}
                  @questResults={{questResults}}
                  @campaignParticipationResult={{campaignParticipationResult}}
                />
              </template>,
            );

            // then
            assert.notOk(screen.queryByText(t('components.campaigns.attestation-result.obtained')));
          });

          test('it should display the quest result if the flag is true', async function (assert) {
            // given
            const featureToggles = this.owner.lookup('service:featureToggles');
            sinon.stub(featureToggles, 'featureToggles').value({ isQuestEnabled: true });

            const campaign = {
              customResultPageText: 'My custom result page text',
              organizationId: 1,
            };

            const campaignParticipationResult = {
              campaignParticipationBadges: [],
              masteryRate: 0.75,
              reachedStage: { acquired: 4, total: 5 },
            };
            const questResults = [
              {
                obtained: true,
                profileRewardId: 12,
                reward: { key: 'SIXTH_GRADE' },
              },
            ];

            // when
            const screen = await render(
              <template>
                <EvaluationResultsHero
                  @campaign={{campaign}}
                  @questResults={{questResults}}
                  @campaignParticipationResult={{campaignParticipationResult}}
                />
              </template>,
            );

            // then
            assert.ok(screen.getByText(t('components.campaigns.attestation-result.obtained')));
          });
        });
      });
    });
  });

  module('when campaign is for absolute novice or is an autonomous course', function () {
    module('when there is no custom link', function () {
      module('when user is anonymous', function () {
        test('it should display only an inscription link', async function (assert) {
          // given
          stubCurrentUserService(this.owner, { isAnonymous: true });

          const campaign = { hasCustomResultPageButton: false };
          const campaignParticipationResult = { masteryRate: 0.75 };

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHero
                @campaign={{campaign}}
                @campaignParticipationResult={{campaignParticipationResult}}
              />
            </template>,
          );

          // then
          assert.dom(screen.queryByText(t('pages.signup.save-progress-message'))).exists();
          assert.dom(screen.getByRole('link', { name: t('pages.signup.actions.sign-up-on-pix') })).exists();
          assert.dom(screen.queryByRole('button', { name: t('pages.skill-review.hero.see-trainings') })).doesNotExist();
          assert.dom(screen.queryByText(t('pages.skill-review.hero.explanations.send-results'))).doesNotExist();
          assert.dom(screen.queryByRole('button', { name: t('pages.skill-review.actions.send') })).doesNotExist();
        });
      });

      module('when user is connected', function () {
        test('it should display only a connection link', async function (assert) {
          // given
          stubCurrentUserService(this.owner, { firstName: 'Hermione' });

          const campaign = { hasCustomResultPageButton: false };
          const campaignParticipationResult = { masteryRate: 0.75 };

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHero
                @campaign={{campaign}}
                @campaignParticipationResult={{campaignParticipationResult}}
              />
            </template>,
          );

          // then
          assert.dom(screen.getByRole('link', { name: t('navigation.back-to-homepage') })).exists();
          assert.dom(screen.queryByText(t('pages.skill-review.hero.explanations.send-results'))).doesNotExist();
          assert.dom(screen.queryByRole('button', { name: t('pages.skill-review.hero.see-trainings') })).doesNotExist();
          assert.dom(screen.queryByRole('button', { name: t('pages.skill-review.actions.send') })).doesNotExist();
          assert.dom(screen.queryByText(t('pages.signup.save-progress-message'))).doesNotExist();
          assert.dom(screen.queryByRole('link', { name: t('pages.signup.actions.sign-up-on-pix') })).doesNotExist();
        });
      });
    });

    module('when there is a custom link', function () {
      test('it should not display a homepage link', async function (assert) {
        // given
        const campaign = { hasCustomResultPageButton: true };
        const campaignParticipationResult = { masteryRate: 0.75 };

        // when
        const screen = await render(
          <template>
            <EvaluationResultsHero
              @campaign={{campaign}}
              @campaignParticipationResult={{campaignParticipationResult}}
            />
          </template>,
        );

        // then
        assert.dom(screen.queryByText(t('pages.skill-review.hero.explanations.send-results'))).doesNotExist();

        assert.dom(screen.queryByRole('link', { name: t('navigation.back-to-homepage') })).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: t('pages.skill-review.hero.see-trainings') })).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: t('pages.skill-review.actions.send') })).doesNotExist();
      });
    });
  });

  module('stages', function () {
    module('when there are stages', function () {
      test('displays reached stage stars and message', async function (assert) {
        // given
        const campaign = { organizationId: 1 };
        const campaignParticipationResult = {
          hasReachedStage: true,
          reachedStage: {
            reachedStage: 4,
            totalStage: 5,
            message: 'existing message stages',
            title: 'existing title stages',
          },
        };

        // when
        const screen = await render(
          <template>
            <EvaluationResultsHero
              @campaign={{campaign}}
              @campaignParticipationResult={{campaignParticipationResult}}
            />
          </template>,
        );

        // then
        const stars = {
          acquired: campaignParticipationResult.reachedStage.reachedStage - 1,
          total: campaignParticipationResult.reachedStage.totalStage - 1,
        };
        assert.strictEqual(screen.getAllByText(t('pages.skill-review.stage.starsAcquired', stars)).length, 2);

        assert.ok(screen.getByText(campaignParticipationResult.reachedStage.title));
        assert.ok(screen.getByText(campaignParticipationResult.reachedStage.message));
      });
    });

    module('when there is only one stage', function () {
      test('displays the stage 0 message but no stars', async function (assert) {
        // given
        const campaign = { organizationId: 1 };
        const campaignParticipationResult = {
          hasReachedStage: true,
          reachedStage: { reachedStage: 1, totalStage: 1, message: 'Stage 0 message' },
        };

        // when
        const screen = await render(
          <template>
            <EvaluationResultsHero
              @campaign={{campaign}}
              @campaignParticipationResult={{campaignParticipationResult}}
            />
          </template>,
        );

        // then
        const stars = {
          acquired: campaignParticipationResult.reachedStage.reachedStage - 1,
          total: campaignParticipationResult.reachedStage.totalStage - 1,
        };
        assert.dom(screen.queryByText(t('pages.skill-review.stage.starsAcquired', stars))).doesNotExist();

        assert.dom(screen.getByText(campaignParticipationResult.reachedStage.message)).exists();
      });
    });

    module('when there is no stage', function () {
      test('not display stars and message', async function (assert) {
        // given
        const campaign = { organizationId: 1 };
        const campaignParticipationResult = {
          hasReachedStage: false,
          reachedStage: { message: 'not existing message', title: 'not existing title' },
        };

        // when
        const screen = await render(
          <template>
            <EvaluationResultsHero
              @campaign={{campaign}}
              @campaignParticipationResult={{campaignParticipationResult}}
            />
          </template>,
        );

        // then
        const stars = { acquired: 0, total: 0 };
        assert.notOk(screen.queryByText(t('pages.skill-review.stage.starsAcquired', stars)));

        assert.notOk(screen.queryByText(campaignParticipationResult.reachedStage.message));
        assert.notOk(screen.queryByText(campaignParticipationResult.reachedStage.title));
      });
    });

    module('when stage message contains a link', function (hooks) {
      let pixMetrics;
      let screen;

      hooks.beforeEach(async function () {
        // given
        pixMetrics = this.owner.lookup('service:pix-metrics');
        pixMetrics.trackEvent = sinon.stub();

        const campaign = { id: 123, organizationId: 1 };
        const campaignParticipationResult = {
          hasReachedStage: true,
          reachedStage: {
            reachedStage: 4,
            totalStage: 5,
            message: 'Bravo ! [Découvrir le contenu](https://example.net/contenu)',
            title: 'existing title stages',
          },
        };

        screen = await render(
          <template>
            <EvaluationResultsHero
              @campaign={{campaign}}
              @campaignParticipationResult={{campaignParticipationResult}}
            />
          </template>,
        );
        pixMetrics.trackEvent.resetHistory();
      });

      test('it should send a tracking event when clicking on the link', async function (assert) {
        // when
        const link = screen.getByRole('link', { name: 'Découvrir le contenu' });
        link.addEventListener('click', (event) => {
          event.preventDefault();
        });
        await click(link);

        // then
        sinon.assert.calledOnceWithExactly(
          pixMetrics.trackEvent,
          'Fin de parcours - Clic sur un lien du message de palier',
          { url: 'https://example.net/contenu', campaignId: 123, reachedStage: 4, totalStage: 5 },
        );
        assert.ok(true);
      });

      test('it should not send a tracking event when clicking elsewhere in the message', async function (assert) {
        // when
        await click(screen.getByText('Bravo !', { exact: false }));

        // then
        sinon.assert.notCalled(pixMetrics.trackEvent);
        assert.ok(true);
      });
    });
  });

  module('acquired badges', function () {
    module('when there is at least one acquired badge', function () {
      test('should display the acquired badges block', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const acquiredBadge = store.createRecord('campaign-participation-badge', { isAcquired: true });
        const campaignParticipationResult = store.createRecord('campaign-participation-result', {
          campaignParticipationBadges: [acquiredBadge],
        });

        const campaign = { organizationId: 1 };

        // when
        const screen = await render(
          <template>
            <EvaluationResultsHero
              @campaign={{campaign}}
              @campaignParticipationResult={{campaignParticipationResult}}
            />
          </template>,
        );

        // then
        const badgesTitle = screen.getByRole('heading', {
          name: t('pages.skill-review.hero.acquired-badges-title'),
        });
        assert.dom(badgesTitle).exists();
      });
    });

    module('when there is no acquired badge', function () {
      test('should not display the acquired badges block', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const notAquiredBadge = store.createRecord('campaign-participation-badge', { isAcquired: false });
        const campaignParticipationResult = store.createRecord('campaign-participation-result', {
          campaignParticipationBadges: [notAquiredBadge],
        });
        const campaign = { organizationId: 1 };

        // when
        const screen = await render(
          <template>
            <EvaluationResultsHero
              @campaign={{campaign}}
              @campaignParticipationResult={{campaignParticipationResult}}
            />
          </template>,
        );

        // then
        const badgesTitle = screen.queryByRole('heading', {
          name: t('pages.skill-review.hero.acquired-badges-title'),
        });
        assert.dom(badgesTitle).doesNotExist();
      });
    });
  });

  module('custom organization block', function () {
    module('when campaign is with simplified access', function () {
      module('when customResultPageText if defined', function () {
        test('displays the organization block with the text', async function (assert) {
          // given
          const campaign = {
            customResultPageText: 'My custom result page text',
            organizationId: 1,
            isSimplifiedAccess: true,
          };
          const campaignParticipationResult = { masteryRate: 0.75 };

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHero
                @campaign={{campaign}}
                @campaignParticipationResult={{campaignParticipationResult}}
              />
            </template>,
          );

          // then
          assert.dom(screen.getByText('My custom result page text')).exists();
        });
      });

      module('when campaign has customResultPageButton', function () {
        test('displays the organization block with the custom button', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const campaign = await store.createRecord('campaign', {
            customResultPageButtonUrl: 'https://example.net',
            customResultPageButtonText: 'Custom result page button text',
            organizationId: 1,
          });
          const campaignParticipationResult = { masteryRate: 0.75 };

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHero
                @campaign={{campaign}}
                @campaignParticipationResult={{campaignParticipationResult}}
              />
            </template>,
          );

          // then
          assert.dom(screen.getByRole('link', { name: 'Custom result page button text' })).exists();
        });
      });

      module('when campaign has no custom result page button or text', function () {
        test('no display the organization block', async function (assert) {
          // given
          const campaign = { organizationId: 1 };
          const campaignParticipationResult = { masteryRate: 0.75 };

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHero
                @campaign={{campaign}}
                @campaignParticipationResult={{campaignParticipationResult}}
              />
            </template>,
          );

          // then
          assert.dom(screen.queryByText('My custom result page text')).doesNotExist();
        });
      });
    });

    module('when campaign is sharable', function () {
      module('when results are not shared', function () {
        test('it should not display the organization block', async function (assert) {
          // given
          const campaign = { organizationId: 1 };
          const campaignParticipationResult = { masteryRate: 0.75 };

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHero
                @campaign={{campaign}}
                @campaignParticipationResult={{campaignParticipationResult}}
              />
            </template>,
          );

          // then
          assert.dom(screen.queryByText('My custom result page text')).doesNotExist();
        });
      });

      module('when results are shared', function () {
        module('when customResultPageText if defined', function () {
          test('displays the organization block with the text', async function (assert) {
            // given
            const campaign = {
              customResultPageText: 'My custom result page text',
              organizationId: 1,
            };

            const campaignParticipationResult = { masteryRate: 0.75 };

            // when
            const screen = await render(
              <template>
                <EvaluationResultsHero
                  @campaign={{campaign}}
                  @campaignParticipationResult={{campaignParticipationResult}}
                />
              </template>,
            );

            // then
            assert.dom(screen.getByText('My custom result page text')).exists();
          });
        });

        module('when campaign has customResultPageButton', function () {
          test('displays the organization block with the custom button', async function (assert) {
            // given
            const store = this.owner.lookup('service:store');
            const campaign = await store.createRecord('campaign', {
              customResultPageButtonUrl: 'https://example.net',
              customResultPageButtonText: 'Custom result page button text',
              organizationId: 1,
            });
            const campaignParticipationResult = { masteryRate: 0.75 };

            // when
            const screen = await render(
              <template>
                <EvaluationResultsHero
                  @campaign={{campaign}}
                  @campaignParticipationResult={{campaignParticipationResult}}
                />
              </template>,
            );

            // then
            assert.dom(screen.getByRole('link', { name: 'Custom result page button text' })).exists();
          });
        });

        module('when campaign has no custom result page button or text', function () {
          test('no display the organization block', async function (assert) {
            // given
            const campaign = { organizationId: 1 };
            const campaignParticipationResult = { masteryRate: 0.75 };

            // when
            const screen = await render(
              <template>
                <EvaluationResultsHero
                  @campaign={{campaign}}
                  @campaignParticipationResult={{campaignParticipationResult}}
                />
              </template>,
            );

            // then
            assert.dom(screen.queryByText('My custom result page text')).doesNotExist();
          });
        });
      });
    });
  });

  module('retry or reset block', function () {
    test('displays the retry or reset block when the user can retry and reset the campaign', async function (assert) {
      // given
      const campaign = { organizationId: 1, multipleSendings: true };
      const campaignParticipationResult = { masteryRate: 0.1, canRetry: true, canReset: true };

      // when
      const screen = await render(
        <template>
          <EvaluationResultsHero @campaign={{campaign}} @campaignParticipationResult={{campaignParticipationResult}} />
        </template>,
      );

      // then
      assert.dom(screen.getByText(t('pages.skill-review.hero.retry.title'))).exists();
    });

    test('displays the retry or reset block when the user can only reset the campaign', async function (assert) {
      // given
      const campaign = { organizationId: 1, multipleSendings: true };
      const campaignParticipationResult = { masteryRate: 1, canRetry: false, canReset: true };

      // when
      const screen = await render(
        <template>
          <EvaluationResultsHero @campaign={{campaign}} @campaignParticipationResult={{campaignParticipationResult}} />
        </template>,
      );

      // then
      assert.dom(screen.getByText(t('pages.skill-review.hero.retry.title'))).exists();
    });

    test('displays the retry or reset block when the user can only retry the campaign', async function (assert) {
      // given
      const campaign = { organizationId: 1, multipleSendings: true };
      const campaignParticipationResult = { masteryRate: 1, canRetry: true, canReset: false };

      // when
      const screen = await render(
        <template>
          <EvaluationResultsHero @campaign={{campaign}} @campaignParticipationResult={{campaignParticipationResult}} />
        </template>,
      );

      // then
      assert.dom(screen.getByText(t('pages.skill-review.hero.retry.title'))).exists();
    });

    test('not display the retry or reset block when the user can not retry or reset the campaign', async function (assert) {
      // given
      const campaign = { organizationId: 1, multipleSendings: false };
      const campaignParticipationResult = { masteryRate: 0.1, canRetry: false, canReset: false };

      // when
      const screen = await render(
        <template>
          <EvaluationResultsHero @campaign={{campaign}} @campaignParticipationResult={{campaignParticipationResult}} />
        </template>,
      );

      // then
      assert.dom(screen.queryByText(t('pages.skill-review.hero.retry.title'))).doesNotExist();
    });
  });
});
