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

function sharedAtDate(date) {
  return dayjs(date).format('LL');
}

function sharedAtTime(date) {
  return dayjs(date).format('LT');
}

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
          <EvaluationResultsHero
            @campaign={{campaign}}
            @campaignParticipationResult={{campaignParticipationResult}}
            @isSharableCampaign={{true}}
          />
        </template>,
      );
    });

    test('it should display a congratulation title', async function (assert) {
      // then
      const title = screen.getByRole('heading', {
        name: t('pages.skill-review.hero.thanks', { name: 'Hermione' }),
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
            isShared: false,
            canImprove: false,
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
                @isSharableCampaign={{true}}
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
              isShared: false,
              canImprove: false,
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
                  @isSharableCampaign={{true}}
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
              isShared: false,
              canImprove: false,
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
                  @isSharableCampaign={{true}}
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

  module('results sharing', function (hooks) {
    let clock, now;

    hooks.beforeEach(function () {
      now = new Date('2024-01-01T14:03:00Z');
      clock = sinon.useFakeTimers(now, { toFake: ['Date'] });

      stubCurrentUserService(this.owner, { id: 1, firstName: 'Hermione' });
    });

    hooks.afterEach(function () {
      clock.restore();
    });

    module('when results are not shared', function () {
      test('it should display specific explanation and button', async function (assert) {
        // given
        const campaign = {
          customResultPageText: 'My custom result page text',
          organizationId: 1,
        };

        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          isShared: false,
          canImprove: false,
          masteryRate: 0.75,
          reachedStage: { acquired: 4, total: 5 },
        };

        // when
        const screen = await render(
          <template>
            <EvaluationResultsHero
              @campaign={{campaign}}
              @campaignParticipationResult={{campaignParticipationResult}}
              @isSharableCampaign={{true}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText(t('pages.skill-review.hero.explanations.send-results'))).exists();
        assert.dom(screen.getByRole('button', { name: t('pages.skill-review.actions.send') })).exists();
      });

      test('it should display disabled notation', async function (assert) {
        // given
        const campaign = {
          customResultPageText: 'My custom result page text',
          organizationId: 1,
        };

        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          isShared: false,
          isDisabled: true,
          canImprove: false,
          masteryRate: 0.75,
          reachedStage: { acquired: 4, total: 5 },
        };

        // when
        const screen = await render(
          <template>
            <EvaluationResultsHero
              @campaign={{campaign}}
              @campaignParticipationResult={{campaignParticipationResult}}
              @isSharableCampaign={{true}}
            />
          </template>,
        );

        // then
        assert.ok(screen.getByText(t('pages.skill-review.disabled-share')));
        assert.notOk(screen.queryByText(t('pages.skill-review.hero.explanations.send-results')));
        assert.notOk(screen.queryByRole('button', { name: t('pages.skill-review.actions.send') }));
      });

      module('when user is anonymous', function () {
        test('it should not display a sign in button', async function (assert) {
          //given
          stubCurrentUserService(this.owner, { id: 1, firstName: 'Hermione', isAnonymous: true });
          const campaign = {
            customResultPageText: 'My custom result page text',
            organizationId: 1,
          };

          const campaignParticipationResult = {
            campaignParticipationBadges: [],
            isShared: false,
            canImprove: false,
            masteryRate: 0.75,
            reachedStage: { acquired: 4, total: 5 },
          };

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHero
                @campaign={{campaign}}
                @questResults={{this.questResults}}
                @campaignParticipationResult={{campaignParticipationResult}}
                @isSharableCampaign={{true}}
              />
            </template>,
          );

          // then
          assert.ok(screen.getByRole('button', { name: t('pages.skill-review.actions.send') }));
          assert.notOk(screen.queryByText(t('pages.signup.save-progress-message')));
          assert.notOk(screen.queryByText(t('pages.signup.actions.sign-up-on-pix')));
        });
      });

      module('on click on the share button', function () {
        let shareStub;

        const campaign = {
          id: 1,
          customResultPageText: 'My custom result page text',
          organizationId: 1,
        };

        test('on success, it should display a notification and hide improve elements', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const adapter = store.adapterFor('campaign-participation-result');
          shareStub = sinon.stub(adapter, 'share');
          const onResultsSharedStub = sinon.stub().resolves();
          const campaignParticipationResult = store.createRecord('campaign-participation-result', {
            campaignParticipationBadges: [],
            isShared: true,
            canImprove: false,
            masteryRate: 0.75,
            sharedAt: now,
            id: 'campaignParticipationResultId',
          });
          sinon.stub(campaignParticipationResult, 'reload').resolves();

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHero
                @campaign={{campaign}}
                @campaignParticipationResult={{campaignParticipationResult}}
                @isSharableCampaign={{true}}
                @onResultsShared={{onResultsSharedStub}}
              />
            </template>,
          );

          // then
          assert.ok(
            screen.queryByText(
              t('pages.skill-review.hero.shared-message', { date: sharedAtDate(now), time: sharedAtTime(now) }),
            ),
          );
          assert.dom(screen.queryByText(t('pages.skill-review.error'))).doesNotExist();
          assert.dom(screen.queryByText(t('pages.skill-review.hero.explanations.improve'))).doesNotExist();
          assert.dom(screen.queryByRole('button', { name: t('pages.skill-review.actions.improve') })).doesNotExist();
        });

        test('on success, it should call the onResultsShared function', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const adapter = store.adapterFor('campaign-participation-result');
          shareStub = sinon.stub(adapter, 'share');
          const onResultsSharedStub = sinon.stub().resolves();
          const campaignParticipationResult = store.createRecord('campaign-participation-result', {
            campaignParticipationBadges: [],
            isShared: false,
            canImprove: true,
            masteryRate: 0.75,
            id: 'campaignParticipationResultId',
          });
          sinon.stub(campaignParticipationResult, 'reload').resolves();
          shareStub.resolves();

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHero
                @campaign={{campaign}}
                @campaignParticipationResult={{campaignParticipationResult}}
                @isSharableCampaign={{true}}
                @onResultsShared={{onResultsSharedStub}}
              />
            </template>,
          );
          await click(screen.getByRole('button', { name: t('pages.skill-review.actions.send') }));

          // then
          assert.true(onResultsSharedStub.calledOnce);
        });

        test('on fail, it should display an error', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          const adapter = store.adapterFor('campaign-participation-result');
          shareStub = sinon.stub(adapter, 'share');
          const onResultsSharedStub = sinon.stub().resolves();
          const campaignParticipationResult = store.createRecord('campaign-participation-result', {
            campaignParticipationBadges: [],
            isShared: false,
            canImprove: true,
            masteryRate: 0.75,
            id: 'campaignParticipationResultId',
          });
          sinon.stub(campaignParticipationResult, 'reload').resolves();
          shareStub.rejects();

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHero
                @campaign={{campaign}}
                @campaignParticipationResult={{campaignParticipationResult}}
                @isSharableCampaign={{true}}
                @onResultsShared={{onResultsSharedStub}}
              />
            </template>,
          );
          await click(screen.getByRole('button', { name: t('pages.skill-review.actions.send') }));

          // then
          assert.dom(screen.queryByText(t('pages.skill-review.error'))).exists();

          assert.dom(screen.getByText(t('pages.skill-review.hero.explanations.improve'))).exists();
          assert.dom(screen.getByRole('button', { name: t('pages.skill-review.actions.improve') })).exists();
        });
      });
    });

    module('when results are shared', function () {
      test('it should not display disabled notation', async function (assert) {
        // given
        const campaign = {
          customResultPageText: 'My custom result page text',
          organizationId: 1,
        };
        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          isShared: true,
          isDisabled: true,
          canImprove: false,
          masteryRate: 0.75,
          reachedStage: { acquired: 4, total: 5 },
        };

        // when
        const screen = await render(
          <template>
            <EvaluationResultsHero
              @campaign={{campaign}}
              @campaignParticipationResult={{campaignParticipationResult}}
              @isSharableCampaign={{true}}
            />
          </template>,
        );

        // then
        assert.notOk(screen.queryByText(t('pages.skill-review.disabled-share')));
      });

      test('it should display the shared date', async function (assert) {
        // given
        const campaign = {
          customResultPageText: 'My custom result page text',
          organizationId: 1,
        };

        const campaignParticipationResult = {
          campaignParticipationBadges: [],
          isShared: true,
          sharedAt: now,
        };

        const screen = await render(
          <template>
            <EvaluationResultsHero
              @campaign={{campaign}}
              @campaignParticipationResult={{campaignParticipationResult}}
              @isSharableCampaign={{true}}
            />
          </template>,
        );

        // then
        assert.ok(
          screen.queryByText(
            t('pages.skill-review.hero.shared-message', { date: sharedAtDate(now), time: sharedAtTime(now) }),
          ),
        );
      });

      module('when there are no trainings and no custom link', function () {
        test('it should display a message and a homepage link', async function (assert) {
          // given
          const campaign = { organizationId: 1 };
          const campaignParticipationResult = { masteryRate: 0.75, isShared: true };

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHero
                @campaign={{campaign}}
                @campaignParticipationResult={{campaignParticipationResult}}
                @isSharableCampaign={{true}}
              />
            </template>,
          );

          // the
          assert.ok(
            screen.queryByText(
              t('pages.skill-review.hero.shared-message', { date: sharedAtDate(now), time: sharedAtTime(now) }),
            ),
          );
          assert.dom(screen.getByRole('link', { name: t('navigation.back-to-homepage') })).exists();
        });
      });

      module('when there are no trainings and a custom link', function () {
        test('it should display a message but no homepage link', async function (assert) {
          // given
          const campaign = {
            organizationId: 1,
            hasCustomResultPageButton: true,
          };
          const campaignParticipationResult = { masteryRate: 0.75, isShared: true };

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHero
                @campaign={{campaign}}
                @campaignParticipationResult={{campaignParticipationResult}}
                @isSharableCampaign={{true}}
              />
            </template>,
          );

          // then
          assert.ok(
            screen.queryByText(
              t('pages.skill-review.hero.shared-message', { date: sharedAtDate(now), time: sharedAtTime(now) }),
            ),
          );
          assert.dom(screen.queryByRole('link', { name: t('navigation.back-to-homepage') })).doesNotExist();
        });
      });

      module('when there are trainings', function (hooks) {
        let screen;
        const showTrainingsStub = sinon.stub();

        hooks.beforeEach(async function () {
          // given
          const hasTrainings = true;
          const campaign = { organizationId: 1 };
          const campaignParticipationResult = { masteryRate: 0.75, isShared: true };

          // when
          screen = await render(
            <template>
              <EvaluationResultsHero
                @hasTrainings={{hasTrainings}}
                @showTrainings={{showTrainingsStub}}
                @campaign={{campaign}}
                @campaignParticipationResult={{campaignParticipationResult}}
                @isSharableCampaign={{true}}
              />
            </template>,
          );
        });

        test('it should display specific explanation and a see trainings button', async function (assert) {
          // then
          assert.dom(screen.getByText(t('pages.skill-review.hero.explanations.trainings'))).exists();
          assert.dom(screen.getByRole('button', { name: t('pages.skill-review.hero.see-trainings') })).exists();
        });

        test('on see trainings click, it should trigger a specific action', async function (assert) {
          // then
          await click(screen.getByRole('button', { name: t('pages.skill-review.hero.see-trainings') }));

          sinon.assert.calledOnce(showTrainingsStub);
          assert.ok(true);
        });
      });

      module('when user is anonymous', function () {
        test('it should display a sign in button', async function (assert) {
          // given
          stubCurrentUserService(this.owner, { id: 1, firstName: 'Hermione', isAnonymous: true });
          const campaign = {
            customResultPageText: 'My custom result page text',
            organizationId: 1,
          };
          const campaignParticipationResult = {
            campaignParticipationBadges: [],
            isShared: true,
            canImprove: false,
            masteryRate: 0.75,
            reachedStage: { acquired: 4, total: 5 },
          };

          // when
          const screen = await render(
            <template>
              <EvaluationResultsHero
                @campaign={{campaign}}
                @questResults={{this.questResults}}
                @campaignParticipationResult={{campaignParticipationResult}}
                @isSharableCampaign={{true}}
              />
            </template>,
          );
          // then
          assert.ok(screen.queryByText(t('pages.signup.save-progress-message')));
          assert.ok(screen.queryByText(t('pages.signup.actions.sign-up-on-pix')));
        });
      });
    });
  });

  module('when campaign results should not be shared', function () {
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
                @isSharableCampaign={{false}}
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
                @isSharableCampaign={{false}}
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
              @isSharableCampaign={{false}}
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

  module('improve results', function () {
    module('when user can improve results', function (hooks) {
      let beginImprovementStub, router, screen, shareStub;
      const onResultsShared = sinon.stub();
      const campaignCode = 'ABC';
      const campaignParticipationResultId = 'campaignParticipationResultId';

      hooks.beforeEach(async function () {
        // given
        stubCurrentUserService(this.owner, { id: 1, firstName: 'Hermione' });
        const store = this.owner.lookup('service:store');

        router = this.owner.lookup('service:router');
        router.transitionTo = sinon.stub();

        const adapter = store.adapterFor('campaign-participation-result');
        shareStub = sinon.stub(adapter, 'share');
        beginImprovementStub = sinon.stub(adapter, 'beginImprovement');

        const campaign = { organizationId: 1, code: campaignCode };
        const campaignParticipationResult = store.createRecord('campaign-participation-result', {
          masteryRate: 0.75,
          canImprove: true,
          id: campaignParticipationResultId,
        });
        sinon.stub(campaignParticipationResult, 'reload').resolves();

        // when
        screen = await render(
          <template>
            <EvaluationResultsHero
              @campaign={{campaign}}
              @campaignParticipationResult={{campaignParticipationResult}}
              @isSharableCampaign={{true}}
              @onResultsShared={{onResultsShared}}
            />
          </template>,
        );
      });

      test('it should display specific explanation and button', async function (assert) {
        // then
        assert.dom(screen.getByText(t('pages.skill-review.hero.explanations.improve'))).exists();
        assert.dom(screen.getByRole('button', { name: t('pages.skill-review.actions.improve') })).exists();
      });

      module('loading button', function () {
        test('should not be able to share the campaign at the same time', async function (assert) {
          // given
          const pendingPromise = new Promise(() => {});
          beginImprovementStub.resolves(pendingPromise);

          // when
          await click(screen.getByRole('button', { name: t('pages.skill-review.actions.improve') }));

          // then
          assert.notOk(screen.queryByRole('button', { name: t('pages.skill-review.actions.send') }));
          assert.notOk(screen.queryByRole('button', { name: t('pages.skill-review.actions.improve') }));
        });

        test('should not be able to improve the campaign at the same time', async function (assert) {
          // given
          const pendingPromise = new Promise(() => {});
          shareStub.resolves(pendingPromise);

          // when
          await click(screen.getByRole('button', { name: t('pages.skill-review.actions.send') }));

          // then
          assert.notOk(screen.queryByRole('button', { name: t('pages.skill-review.actions.send') }));
          assert.notOk(screen.queryByRole('button', { name: t('pages.skill-review.actions.improve') }));
        });
      });

      module('on improve button click', function () {
        test('on success, it should restart the campaign', async function (assert) {
          // when
          await click(screen.getByRole('button', { name: t('pages.skill-review.actions.improve') }));

          // then
          sinon.assert.calledWithExactly(beginImprovementStub, campaignParticipationResultId);
          assert.ok(beginImprovementStub.calledOnce);

          sinon.assert.calledWithExactly(router.transitionTo, 'campaigns.entry-point', campaignCode);
          assert.ok(router.transitionTo.calledOnce);
        });

        test('on fail, it should display an error', async function (assert) {
          // given
          beginImprovementStub.withArgs('campaignParticipationResultId').rejects();

          // when
          await click(screen.getByRole('button', { name: t('pages.skill-review.actions.improve') }));

          // then
          assert.dom(screen.queryByText(t('pages.skill-review.error'))).exists();
          assert.dom(screen.getByText(t('pages.skill-review.hero.explanations.improve'))).exists();
          assert.dom(screen.getByRole('button', { name: t('pages.skill-review.actions.improve') })).exists();

          assert.notOk(router.transitionTo.calledOnce);
        });
      });
    });

    module('when user can not improve results', function () {
      test('it should not display specific explanation and button', async function (assert) {
        // given
        const campaign = { organizationId: 1 };
        const campaignParticipationResult = { masteryRate: 0.75, canImprove: false };

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
        assert.dom(screen.queryByText(t('pages.skill-review.hero.explanations.improve'))).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: t('pages.skill-review.actions.improve') })).doesNotExist();
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
          reachedStage: { reachedStage: 4, totalStage: 5, message: 'lorem ipsum dolor sit amet' },
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

        assert.dom(screen.getByText(campaignParticipationResult.reachedStage.message)).exists();
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
          reachedStage: { message: 'not existing message' },
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
        assert.dom(screen.queryByText(t('pages.skill-review.stage.starsAcquired', stars))).doesNotExist();

        assert.dom(screen.queryByTestId('stage-message')).doesNotExist();
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
          const campaignParticipationResult = { masteryRate: 0.75, isShared: false };

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
          const campaignParticipationResult = { masteryRate: 0.75, isShared: true };

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
          const campaignParticipationResult = { masteryRate: 0.75, isShared: true };

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

            const campaignParticipationResult = { masteryRate: 0.75, isShared: true };

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
            const campaignParticipationResult = { masteryRate: 0.75, isShared: true };

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
            const campaignParticipationResult = { masteryRate: 0.75, isShared: true };

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
      const campaignParticipationResult = { masteryRate: 1, canImprove: false, canRetry: false, canReset: true };

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
      const campaignParticipationResult = { masteryRate: 1, canImprove: false, canRetry: true, canReset: false };

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
