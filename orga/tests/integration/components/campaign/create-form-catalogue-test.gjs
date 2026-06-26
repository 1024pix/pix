import { clickByName, fillByLabel, render, within } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CreateForm from 'pix-orga/components/campaign/create-form';
import { assert, module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::CreateForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  const data = {};
  const createCampaignSpy = (event) => {
    event.preventDefault();
  };
  const cancelSpy = () => {};

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    const prescriber = store.createRecord('prescriber', {
      firstName: 'Adam',
      lastName: 'Troisjour',
      id: '1',
      features: {
        MULTIPLE_SENDING_ASSESSMENT: { active: false, params: null },
        COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY: { active: false, params: null },
      },
    });

    class CurrentUserStub extends Service {
      prescriber = prescriber;
    }
    this.owner.register('service:current-user', CurrentUserStub);

    data.prescriber = prescriber;
    data.defaultMembers = [prescriber];
    data.campaign = store.createRecord('campaign', { ownerId: prescriber.id });
    data.errors = {};
    data.targetProfiles = [];
    data.combinedCourseBlueprints = [];
  });

  test('it should contain inputs, attributes and validation button', async function (assert) {
    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @targetProfiles={{data.targetProfiles}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByLabelText(t('pages.campaign-creation.name.label'), { exact: false })).exists();
    assert.dom('button[type="submit"]').exists();
    assert.dom('input[type=text]').hasAttribute('maxLength', '255');
    assert.dom('textarea').hasAttribute('maxLength', '5000');
  });

  test("it should display campaign's name", async function (assert) {
    // given
    data.campaign.name = 'Campagne de test';

    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @targetProfiles={{data.targetProfiles}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    assert
      .dom(screen.getByLabelText(t('pages.campaign-creation.name.label'), { exact: false }))
      .hasValue('Campagne de test');
  });

  test('[a11y] it should display a message that some inputs are required', async function (assert) {
    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @targetProfiles={{data.targetProfiles}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    // then
    assert
      .dom(
        screen.getByText(t('common.form.mandatory-fields'), {
          exact: false,
        }),
      )
      .exists();
  });

  [
    {
      status: 'ASSESSMENT',
      purpose: 'pages.campaign-creation.purpose.assessment',
      explanation: 'pages.campaign-creation.purpose.assessment-info',
    },
    {
      status: 'EXAM',
      purpose: 'pages.campaign-creation.purpose.exam',
      explanation: 'pages.campaign-creation.purpose.exam-info',
    },
  ].forEach(async function (campaignType) {
    module(`when campaign is of type ${campaignType.status}`, function (hooks) {
      hooks.beforeEach(function () {
        data.prescriber.features.CAMPAIGN_WITHOUT_USER_PROFILE = { active: true, params: null };
      });

      test(`it should have checked ${campaignType.status}`, async function (assert) {
        // given
        data.campaign.type = campaignType.status;
        // when
        const screen = await render(
          <template>
            <CreateForm
              @campaign={{data.campaign}}
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{data.errors}}
              @targetProfiles={{data.targetProfiles}}
              @membersSortedByFullName={{data.defaultMembers}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByLabelText(t(campaignType.purpose))).isChecked();
      });

      test("it should display owner fields and auto complete owner field with owner's full name", async function (assert) {
        // when
        data.campaign.type = campaignType.status;
        const screen = await render(
          <template>
            <CreateForm
              @campaign={{data.campaign}}
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{data.errors}}
              @targetProfiles={{data.targetProfiles}}
              @membersSortedByFullName={{data.defaultMembers}}
            />
          </template>,
        );

        assert.dom(screen.getByText(t('pages.campaign-creation.owner.info'))).exists();
        assert.dom(screen.getAllByText(t('pages.campaign-creation.owner.title'))[0]).exists();
        await click(screen.getByLabelText(t('pages.campaign-creation.owner.label'), { exact: false }));
        await screen.findByRole('listbox');

        // then
        assert.dom(screen.getByRole('option', { name: 'Adam Troisjour', selected: true })).exists();
      });

      test('it should fill target-profile fields', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const targetProfile = store.createRecord('target-profile', {
          id: '1',
          name: 'Target profile 1',
          description: 'Description 1',
          category: 'Category 1',
        });
        data.targetProfiles = [targetProfile];
        data.campaign.type = campaignType.status;
        data.campaign.targetProfile = targetProfile;

        // when
        const screen = await render(
          <template>
            <CreateForm
              @campaign={{data.campaign}}
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{data.errors}}
              @targetProfiles={{data.targetProfiles}}
              @membersSortedByFullName={{data.defaultMembers}}
            />
          </template>,
        );

        // then
        const targetProfileField = screen.getByLabelText(t('pages.campaign-creation.target-profiles-list-label'), {
          exact: false,
        });
        assert.strictEqual(targetProfileField.innerText, targetProfile.name);
      });

      test('it should fill multiple sendings fields', async function (assert) {
        // given
        data.prescriber.features.MULTIPLE_SENDING_ASSESSMENT = { active: true, params: null };
        data.campaign.type = campaignType.status;
        data.campaign.multipleSendings = true;

        // when
        const screen = await render(
          <template>
            <CreateForm
              @campaign={{data.campaign}}
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{data.errors}}
              @targetProfiles={{data.targetProfiles}}
              @membersSortedByFullName={{data.defaultMembers}}
            />
          </template>,
        );

        // then
        const radiogroup = screen.getByRole('radiogroup', {
          name: t('pages.campaign-creation.multiple-sendings.assessments.question-label'),
        });
        assert.dom(within(radiogroup).getByLabelText(t('pages.campaign-creation.yes'))).isChecked();
      });

      test('it should explain which informations will be visible to organization-learners', async function () {
        // given
        data.campaign.type = campaignType.status;

        // when
        const screen = await render(
          <template>
            <CreateForm
              @campaign={{data.campaign}}
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{data.errors}}
              @targetProfiles={{data.targetProfiles}}
              @membersSortedByFullName={{data.defaultMembers}}
            />
          </template>,
        );

        // then
        const testTitleSublabel = screen.getAllByLabelText(t('pages.campaign-creation.landing-page-text.sublabel'), {
          exact: false,
        })[0];
        const landingPageSublabel = screen.getAllByLabelText(t('pages.campaign-creation.landing-page-text.sublabel'), {
          exact: false,
        })[1];

        assert.ok(testTitleSublabel);
        assert.ok(landingPageSublabel);
      });
    });

    module(`when user choose to create a campaign of type ${campaignType.status}`, function (hooks) {
      hooks.beforeEach(function () {
        data.prescriber.features.CAMPAIGN_WITHOUT_USER_PROFILE = { active: true, params: null };
      });

      test('it should display fields for campaign title and target profile', async function (assert) {
        // when
        const screen = await render(
          <template>
            <CreateForm
              @campaign={{data.campaign}}
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{data.errors}}
              @targetProfiles={{data.targetProfiles}}
              @membersSortedByFullName={{data.defaultMembers}}
            />
          </template>,
        );
        await clickByName(t(campaignType.purpose));

        // then
        assert.dom(screen.getByText(t('pages.campaign-creation.test-title.label'))).exists();
        assert.dom(screen.getByText(t('pages.campaign-creation.purpose.label'))).exists();
      });

      test(`it should display the purpose explanation of an ${campaignType.status} campaign`, async function (assert) {
        // when
        const screen = await render(
          <template>
            <CreateForm
              @campaign={{data.campaign}}
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{data.errors}}
              @targetProfiles={{data.targetProfiles}}
              @membersSortedByFullName={{data.defaultMembers}}
            />
          </template>,
        );
        await clickByName(t(campaignType.purpose));

        // then
        assert.dom(screen.getByText(t(campaignType.explanation))).exists();
      });

      module('when the user chose a target profile', function () {
        test('it should display informations about target profile', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          data.targetProfiles = [
            store.createRecord('target-profile', {
              id: '1',
              name: 'targetProfile1',
              description: 'description1',
              tubeCount: 11,
              thematicResultCount: 12,
              hasStage: true,
            }),
            store.createRecord('target-profile', {
              id: '2',
              name: 'targetProfile2',
              description: 'description2',
              tubeCount: 21,
              thematicResultCount: 22,
              hasStage: false,
            }),
          ];

          // when
          const screen = await render(
            <template>
              <CreateForm
                @campaign={{data.campaign}}
                @targetProfiles={{data.targetProfiles}}
                @onSubmit={{createCampaignSpy}}
                @onCancel={{cancelSpy}}
                @errors={{data.errors}}
                @membersSortedByFullName={{data.defaultMembers}}
              />
            </template>,
          );
          await clickByName(t(campaignType.purpose));

          await click(screen.getByLabelText(t('pages.campaign-creation.target-profiles-list-label'), { exact: false }));
          await click(await screen.findByRole('option', { description: 'targetProfile1' }));
          // then
          assert.dom(screen.getByText('description1')).exists();
          assert.dom(screen.getByText(t('common.target-profile-details.subjects', { value: 11 }))).exists();
          assert.dom(screen.getByText(t('common.target-profile-details.thematic-results', { value: 12 }))).exists();
        });

        test('it should display a message about result', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          data.targetProfiles = [
            store.createRecord('target-profile', {
              id: '1',
              name: 'targetProfile1',
              description: 'description1',
              tubeCount: 11,
              thematicResultCount: 12,
              hasStage: true,
            }),
            store.createRecord('target-profile', {
              id: '2',
              name: 'targetProfile2',
              description: 'description2',
              tubeCount: 21,
              thematicResultCount: 22,
              hasStage: false,
            }),
          ];

          // when
          const screen = await render(
            <template>
              <CreateForm
                @campaign={{data.campaign}}
                @targetProfiles={{data.targetProfiles}}
                @onSubmit={{createCampaignSpy}}
                @onCancel={{cancelSpy}}
                @errors={{data.errors}}
                @membersSortedByFullName={{data.defaultMembers}}
              />
            </template>,
          );
          await clickByName(t(campaignType.purpose));

          await click(screen.getByLabelText(t('pages.campaign-creation.target-profiles-list-label'), { exact: false }));
          await click(await screen.findByRole('option', { description: 'targetProfile1' }));

          // then
          assert.dom(screen.getByText(t('common.target-profile-details.results.common'))).exists();
        });

        module('simplified access', function () {
          test('it should display with simplified access label in options list', async function (assert) {
            // given
            const store = this.owner.lookup('service:store');
            data.targetProfiles = [
              store.createRecord('target-profile', {
                id: '1',
                name: 'targetProfile1',
                isSimplifiedAccess: true,
              }),
            ];

            // when
            const screen = await render(
              <template>
                <CreateForm
                  @campaign={{data.campaign}}
                  @targetProfiles={{data.targetProfiles}}
                  @onSubmit={{createCampaignSpy}}
                  @onCancel={{cancelSpy}}
                  @errors={{data.errors}}
                  @membersSortedByFullName={{data.defaultMembers}}
                />
              </template>,
            );

            await clickByName(t(campaignType.purpose));

            await click(
              screen.getByLabelText(t('pages.campaign-creation.target-profiles-list-label'), { exact: false }),
            );

            // then
            assert.ok(screen.getByText(t('common.target-profile-details.simplified-access.without-account')));
          });

          test('it should display without simplified access label in options list', async function (assert) {
            // given
            const store = this.owner.lookup('service:store');
            data.targetProfiles = [
              store.createRecord('target-profile', {
                id: '1',
                name: 'targetProfile1',
                isSimplifiedAccess: false,
              }),
            ];

            // when
            const screen = await render(
              <template>
                <CreateForm
                  @campaign={{data.campaign}}
                  @targetProfiles={{data.targetProfiles}}
                  @onSubmit={{createCampaignSpy}}
                  @onCancel={{cancelSpy}}
                  @errors={{data.errors}}
                  @membersSortedByFullName={{data.defaultMembers}}
                />
              </template>,
            );
            await clickByName(t(campaignType.purpose));

            await click(
              screen.getByLabelText(t('pages.campaign-creation.target-profiles-list-label'), { exact: false }),
            );

            // then
            assert.ok(screen.getByText(t('common.target-profile-details.simplified-access.with-account')));
          });
        });

        module('Displaying options and categories', function () {
          test('it should display options in alphapetical order', async function (assert) {
            // given

            const store = this.owner.lookup('service:store');
            data.targetProfiles = [
              store.createRecord('target-profile', {
                id: '1',
                name: 'targetProfile4',
                description: 'description4',
                tubeCount: 11,
                thematicResultCount: 12,
                hasStage: true,
                category: 'B',
              }),
              store.createRecord('target-profile', {
                id: '2',
                name: 'targetProfile3',
                description: 'description3',
                tubeCount: 21,
                thematicResultCount: 22,
                hasStage: false,
                category: 'B',
              }),
              store.createRecord('target-profile', {
                id: '3',
                name: 'targetProfile2',
                description: 'description2',
                tubeCount: 33,
                thematicResultCount: 12,
                hasStage: true,
                category: 'A',
              }),
              store.createRecord('target-profile', {
                id: '4',
                name: 'targetProfile1',
                description: 'description1',
                tubeCount: 44,
                thematicResultCount: 12,
                hasStage: true,
                category: 'A',
              }),
            ];

            // when
            const screen = await render(
              <template>
                <CreateForm
                  @campaign={{data.campaign}}
                  @targetProfiles={{data.targetProfiles}}
                  @onSubmit={{createCampaignSpy}}
                  @onCancel={{cancelSpy}}
                  @errors={{data.errors}}
                  @membersSortedByFullName={{data.defaultMembers}}
                />
              </template>,
            );
            await clickByName(t(campaignType.purpose));

            await click(
              screen.getByLabelText(t('pages.campaign-creation.target-profiles-list-label'), { exact: false }),
            );
            let options = await screen.findAllByRole('option');

            // then
            options = options.map((option) => {
              return option.innerText;
            });
            assert.deepEqual(options, ['targetProfile1', 'targetProfile2', 'targetProfile3', 'targetProfile4']);
          });

          test('it should display options with OTHER category at last position', async function (assert) {
            // given
            const store = this.owner.lookup('service:store');
            data.targetProfiles = [
              store.createRecord('target-profile', {
                id: '2',
                name: 'targetProfile3',
                description: 'description3',
                tubeCount: 21,
                thematicResultCount: 22,
                hasStage: false,
                category: 'OTHER',
              }),
              store.createRecord('target-profile', {
                id: '1',
                name: 'targetProfile4',
                description: 'description4',
                tubeCount: 11,
                thematicResultCount: 12,
                hasStage: true,
                category: 'A',
              }),
            ];

            // when
            const screen = await render(
              <template>
                <CreateForm
                  @campaign={{data.campaign}}
                  @targetProfiles={{data.targetProfiles}}
                  @onSubmit={{createCampaignSpy}}
                  @onCancel={{cancelSpy}}
                  @errors={{data.errors}}
                  @membersSortedByFullName={{data.defaultMembers}}
                />
              </template>,
            );
            await clickByName(t(campaignType.purpose));

            await click(
              screen.getByLabelText(t('pages.campaign-creation.target-profiles-list-label'), { exact: false }),
            );
            let options = await screen.findAllByRole('option');

            // then
            options = options.map((option) => {
              return option.innerText;
            });
            assert.deepEqual(options, ['targetProfile4', 'targetProfile3']);
          });
        });
      });

      module('when the user wants to clear the content of the target profile input', function (hooks) {
        hooks.beforeEach(function () {
          const store = this.owner.lookup('service:store');
          data.targetProfiles = [
            store.createRecord('target-profile', {
              id: '1',
              name: 'targetProfile1',
              description: 'description1',
            }),
          ];
        });
      });

      module('multiple sending', function () {
        test('it should not display multiple sendings field', async function (assert) {
          // when
          const screen = await render(
            <template>
              <CreateForm
                @campaign={{data.campaign}}
                @onSubmit={{createCampaignSpy}}
                @onCancel={{cancelSpy}}
                @errors={{data.errors}}
                @targetProfiles={{data.targetProfiles}}
                @membersSortedByFullName={{data.defaultMembers}}
              />
            </template>,
          );
          await clickByName(t(campaignType.purpose));

          // then
          assert
            .dom(screen.queryByLabelText(t('pages.campaign-creation.multiple-sendings.assessments.question-label')))
            .doesNotExist();
          assert
            .dom(screen.queryByLabelText(t('pages.campaign-creation.multiple-sendings.assessments.info')))
            .doesNotExist();
        });

        test('it should display multiple sendings field', async function (assert) {
          // given
          const store = this.owner.lookup('service:store');
          data.targetProfiles = [
            store.createRecord('target-profile', {
              id: '1',
              name: 'targetProfile1',
              description: 'description1',
              tubeCount: 11,
              thematicResultCount: 12,
              hasStage: true,
            }),
            store.createRecord('target-profile', {
              id: '2',
              name: 'targetProfile2',
              description: 'description2',
              tubeCount: 21,
              thematicResultCount: 22,
              hasStage: false,
            }),
          ];
          data.prescriber.features.MULTIPLE_SENDING_ASSESSMENT = true;

          // when
          const screen = await render(
            <template>
              <CreateForm
                @campaign={{data.campaign}}
                @targetProfiles={{data.targetProfiles}}
                @onSubmit={{createCampaignSpy}}
                @onCancel={{cancelSpy}}
                @errors={{data.errors}}
                @membersSortedByFullName={{data.defaultMembers}}
              />
            </template>,
          );
          await clickByName(t(campaignType.purpose));

          await click(screen.getByLabelText(t('pages.campaign-creation.target-profiles-list-label'), { exact: false }));
          await click(await screen.findByRole('option', { description: 'targetProfile1' }));

          // then
          assert.dom(screen.getByText(t('common.target-profile-details.results.common'))).exists();
        });

        module('when target profile are knowledge elements resettable', function () {
          test('it should display specific message', async function (assert) {
            // given
            data.prescriber.features.MULTIPLE_SENDING_ASSESSMENT = { active: true, params: null };
            const store = this.owner.lookup('service:store');

            data.targetProfiles = [
              store.createRecord('target-profile', {
                id: '1',
                name: 'targetProfile1',
                description: 'description1',
                tubeCount: 11,
                thematicResultCount: 12,
                hasStage: true,
                areKnowledgeElementsResettable: true,
              }),
              store.createRecord('target-profile', {
                id: '2',
                name: 'targetProfile2',
                description: 'description2',
                tubeCount: 21,
                thematicResultCount: 22,
                hasStage: false,
              }),
            ];

            // when
            const screen = await render(
              <template>
                <CreateForm
                  @campaign={{data.campaign}}
                  @targetProfiles={{data.targetProfiles}}
                  @onSubmit={{createCampaignSpy}}
                  @onCancel={{cancelSpy}}
                  @errors={{data.errors}}
                  @membersSortedByFullName={{data.defaultMembers}}
                />
              </template>,
            );
            await clickByName(t(campaignType.purpose));

            await click(
              screen.getByLabelText(t('pages.campaign-creation.target-profiles-list-label'), { exact: false }),
            );
            await click(await screen.findByRole('option', { description: 'targetProfile1' }));

            // then
            assert
              .dom(
                screen.getByText(t('pages.campaign-creation.multiple-sendings.knowledge-elements-resettable'), {
                  exact: false,
                }),
              )
              .exists();
          });
        });

        module('when target profile are not knowledge elements resettable', function () {
          test('it should not display specific message', async function (assert) {
            // given
            const store = this.owner.lookup('service:store');
            data.targetProfiles = [
              store.createRecord('target-profile', {
                id: '1',
                name: 'targetProfile1',
                description: 'description1',
                tubeCount: 11,
                thematicResultCount: 12,
                hasStage: true,
                areKnowledgeElementsResettable: false,
              }),
              store.createRecord('target-profile', {
                id: '2',
                name: 'targetProfile2',
                description: 'description2',
                tubeCount: 21,
                thematicResultCount: 22,
                hasStage: false,
              }),
            ];
            data.prescriber.features.MULTIPLE_SENDING_ASSESSMENT = true;

            // when
            const screen = await render(
              <template>
                <CreateForm
                  @campaign={{data.campaign}}
                  @targetProfiles={{data.targetProfiles}}
                  @onSubmit={{createCampaignSpy}}
                  @onCancel={{cancelSpy}}
                  @errors={{data.errors}}
                  @membersSortedByFullName={{data.defaultMembers}}
                />
              </template>,
            );
            await clickByName(t(campaignType.purpose));

            await click(
              screen.getByLabelText(t('pages.campaign-creation.target-profiles-list-label'), { exact: false }),
            );
            await click(await screen.findByRole('option', { description: 'targetProfile1' }));

            // then
            assert
              .dom(
                screen.queryByText(t('pages.campaign-creation.multiple-sendings.knowledge-elements-resettable'), {
                  exact: false,
                }),
              )
              .doesNotExist();
          });
        });
      });
    });
  });

  module(`when campaign is of type combined course`, function () {
    test(`it should have checked combined course goal and not display owner fields`, async function (assert) {
      const campaignType = {
        status: 'COMBINED_COURSE',
        purpose: 'pages.campaign-creation.purpose.combined-course',
      };
      // given
      data.campaign.type = campaignType.status;
      data.combinedCourseBlueprints = [{ id: 1, name: 'Mon schéma de parcours combiné' }];
      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @targetProfiles={{data.targetProfiles}}
            @membersSortedByFullName={{data.defaultMembers}}
            @combinedCourseBlueprints={{data.combinedCourseBlueprints}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByLabelText(t(campaignType.purpose))).isChecked();
      assert.dom(screen.queryByText(t('pages.campaign-creation.owner.info'))).doesNotExist();
      assert.dom(screen.queryByText(t('pages.campaign-creation.owner.title'))).doesNotExist();
    });
  });
  test('should not display EXAM type when feature is not enable', async function () {
    // given
    data.prescriber.features.CAMPAIGN_WITHOUT_USER_PROFILE = { active: false, params: null };

    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @targetProfiles={{data.targetProfiles}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    assert.notOk(screen.queryByLabelText(t('pages.campaign-creation.purpose.exam')));
  });

  module('when campaign is of type PROFILES_COLLECTION', function () {
    test('it should have checked PROFILES_COLLECTION', async function (assert) {
      // given
      data.campaign.type = 'PROFILES_COLLECTION';

      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @targetProfiles={{data.targetProfiles}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );

      assert.dom(screen.getByLabelText(t('pages.campaign-creation.purpose.profiles-collection'))).isChecked();
    });

    test('it should fill multiple sendings fields', async function (assert) {
      // given
      data.campaign.type = 'PROFILES_COLLECTION';
      data.campaign.multipleSendings = true;

      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @targetProfiles={{data.targetProfiles}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );

      // then
      const radiogroup = screen.getByRole('radiogroup', {
        name: t('pages.campaign-creation.multiple-sendings.profiles.question-label'),
      });
      assert.dom(within(radiogroup).getByLabelText(t('pages.campaign-creation.yes'))).isChecked();
    });
  });

  module('when user choose to create a campaign of type PROFILES_COLLECTION', () => {
    test('it should not display fields for campaign title and target profile', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @targetProfiles={{data.targetProfiles}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );
      await clickByName(t('pages.campaign-creation.purpose.profiles-collection'));

      // then
      assert.dom(screen.queryByText(t('pages.campaign-creation.test-title.label'))).doesNotExist();
      assert.dom(screen.queryByText(t('pages.campaign-creation.target-profiles-list-label'))).doesNotExist();
    });

    test('it should display fields for enabling multiple sendings', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @targetProfiles={{data.targetProfiles}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );
      await clickByName(t('pages.campaign-creation.purpose.profiles-collection'));

      // then
      assert.dom(screen.getByText(t('pages.campaign-creation.multiple-sendings.profiles.question-label'))).exists();
      assert.dom(screen.getByText(t('pages.campaign-creation.multiple-sendings.profiles.info'))).exists();
    });

    test('it should display the purpose explanation of a profiles collection campaign', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @targetProfiles={{data.targetProfiles}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );
      await clickByName(t('pages.campaign-creation.purpose.profiles-collection'));

      // then
      assert.dom(screen.getByText(t('pages.campaign-creation.purpose.profiles-collection-info'))).exists();
      assert.dom(screen.queryByText(t('pages.campaign-creation.purpose.assessment-info'))).doesNotExist();
    });
  });

  module('when user choose to create a campaign of type COMBINED_COURSE', () => {
    test('it should not display fields for campaign title and target profile', async function (assert) {
      // when
      const store = this.owner.lookup('service:store');
      const combinedCourseBlueprint = store.createRecord('combined-course-blueprint', {
        id: '1',
        name: 'Blueprint 1',
      });

      data.combinedCourseBlueprints = [combinedCourseBlueprint];
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.defaultMembers}}
            @combinedCourseBlueprints={{data.combinedCourseBlueprints}}
          />
        </template>,
      );

      await clickByName(t('pages.campaign-creation.purpose.combined-course'));

      // then
      assert.dom(screen.queryByText(t('pages.campaign-creation.test-title.label'))).doesNotExist();
      assert.dom(screen.queryByText(t('pages.campaign-creation.target-profiles-list-label'))).doesNotExist();
      await fillByLabel('Nom de la campagne *', 'Mon parcours combiné');
      await clickByName(t('pages.campaign-creation.purpose.combined-course'));

      await click(screen.getByLabelText(`${t('pages.campaign-creation.combined-course-blueprints-list-label')} *`));
      assert.ok(await screen.findByRole('option', { description: combinedCourseBlueprint.name }));
    });
  });

  test('it should fill external user ID selection (yes)', async function (assert) {
    // given
    data.campaign.externalIdLabel = 'Numéro étudiant';

    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @targetProfiles={{data.targetProfiles}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    // then
    const externalIdentifier = screen
      .getByText(t('pages.campaign-creation.external-id-label.question-label'), { selector: 'legend' })
      .closest('fieldset');
    const element = within(externalIdentifier).getByRole('radio', { name: t('pages.campaign-creation.yes') });

    assert.dom(element).isChecked();
    assert
      .dom(screen.getByLabelText(t('pages.campaign-creation.external-id-label.label'), { exact: false }))
      .hasValue('Numéro étudiant');
  });

  test('it should fill external user ID selection (no)', async function (assert) {
    // given
    data.campaign.externalIdLabel = null;

    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @targetProfiles={{data.targetProfiles}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    // then
    const externalIdentifier = screen
      .getByText(t('pages.campaign-creation.external-id-label.question-label'), { selector: 'legend' })
      .closest('fieldset');
    const element = within(externalIdentifier).getByRole('radio', { name: t('pages.campaign-creation.no') });

    assert.dom(element).isChecked();
  });

  module('when user has not chosen yet to ask or not an external user ID', function () {
    test('it should fill the default external user ID selection', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @targetProfiles={{data.targetProfiles}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );

      // then
      const externalIdentifier = screen
        .getByText(t('pages.campaign-creation.external-id-label.question-label'), { selector: 'legend' })
        .closest('fieldset');

      assert.dom(within(externalIdentifier).getByLabelText(t('pages.campaign-creation.no'))).isChecked();
      assert.dom(within(externalIdentifier).getByLabelText(t('pages.campaign-creation.yes'))).isNotChecked();
    });

    test('it should not display gdpr footnote', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @targetProfiles={{data.targetProfiles}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );

      // then
      assert.dom(screen.queryByText(t('pages.campaign-creation.legal-warning'))).doesNotExist();
    });
  });

  module('when user choose not to ask an external user ID', function () {
    test('it should not display gdpr footnote either', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @targetProfiles={{data.targetProfiles}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );
      await clickByName(t('pages.campaign-creation.no'));

      // then
      assert.dom(screen.queryByText(t('pages.campaign-creation.legal-warning'))).doesNotExist();
    });
  });

  module('when user choose to ask an external user ID', function () {
    test('it should display gdpr footnote', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @targetProfiles={{data.targetProfiles}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );
      await clickByName(t('pages.campaign-creation.yes'));

      // then
      assert.dom(screen.getByText(t('pages.campaign-creation.legal-warning'))).exists();
    });

    test('it set the external id as required', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @targetProfiles={{data.targetProfiles}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );
      await clickByName(t('pages.campaign-creation.yes'));

      // then
      const label = screen.getByLabelText(new RegExp(t('pages.campaign-creation.external-id-label.label')));
      assert.true(label.hasAttribute('aria-required', false));
    });
    test('it asks for external id type', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @targetProfiles={{data.targetProfiles}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );
      await clickByName(t('pages.campaign-creation.yes'));

      // then
      const radioGroup = screen.getByRole('radiogroup', {
        name: t('pages.campaign-creation.external-id-type.question-label'),
      });
      assert.ok(radioGroup);
    });

    test('it updates campaign model when select a type', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @targetProfiles={{data.targetProfiles}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );
      await clickByName(t('pages.campaign-creation.yes'));

      const checkedRadio = screen.getByLabelText(t('pages.campaign-settings.external-user-id-types.email'));
      await checkedRadio.click();
      assert.strictEqual(data.campaign.externalIdType, 'EMAIL');
    });
  });

  test('it should fill campaign title', async function (assert) {
    // given
    data.campaign.type = 'ASSESSMENT';
    data.campaign.title = 'Mon titre de parcours';

    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @targetProfiles={{data.targetProfiles}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    assert
      .dom(screen.getByLabelText(t('pages.campaign-creation.test-title.label'), { exact: false }))
      .hasValue('Mon titre de parcours');
  });

  test('it should fill campaign landing page text', async function (assert) {
    // given
    data.campaign.customLandingPageText = 'Mon texte de landing page';

    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @targetProfiles={{data.targetProfiles}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    assert
      .dom(screen.getByLabelText(t('pages.campaign-creation.landing-page-text.label'), { exact: false }))
      .hasValue('Mon texte de landing page');
  });

  test('it should send campaign creation action when submitted', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');

    const targetProfile = store.createRecord('target-profile', { name: 'targetProfile1', id: '123' });
    data.targetProfiles = [targetProfile];
    const createCampaignSpy = sinon.stub();

    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @targetProfiles={{data.targetProfiles}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );
    await fillByLabel(`${t('pages.campaign-creation.name.label')} *`, 'Ma campagne');
    await clickByName(t('pages.campaign-creation.purpose.assessment'));
    await click(screen.getByLabelText(t('pages.campaign-creation.target-profiles-list-label'), { exact: false }));
    await click(await screen.findByRole('option', { description: targetProfile.name }));

    // when
    await clickByName(t('pages.campaign-creation.actions.create'));

    sinon.assert.calledWithExactly(createCampaignSpy, data.campaign);
    // then
    assert.ok(true);
  });

  test('it should not display the explanation of automatic compute certificability if the feature is not activated', async function (assert) {
    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @targetProfiles={{data.targetProfiles}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );
    await clickByName(t('pages.campaign-creation.purpose.profiles-collection'));

    // then
    assert.dom(screen.queryByRole('link', { name: 'Élèves' })).doesNotExist();
  });

  test('it should display the explanation of automatic compute certificability if the feature is activated', async function (assert) {
    // when
    data.prescriber.features.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY = { active: true, params: null };

    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @targetProfiles={{data.targetProfiles}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );
    await clickByName(t('pages.campaign-creation.purpose.profiles-collection'));

    // then
    assert.dom(screen.getByRole('link', { name: 'Élèves' })).exists();
  });

  module('when there are errors', function () {
    test('it should display errors messages when the name, the campaign purpose and the external user id fields are empty', async function (assert) {
      // given
      const campaignWithErrors = EmberObject.create({
        errors: {
          name: [
            {
              message: 'CAMPAIGN_NAME_IS_REQUIRED',
            },
          ],
          externalIdLabel: [
            {
              message: 'EXTERNAL_USER_ID_IS_REQUIRED',
            },
          ],
          type: [
            {
              message: 'CAMPAIGN_PURPOSE_IS_REQUIRED',
            },
          ],
        },
      });

      data.errors = campaignWithErrors.errors;

      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @targetProfiles={{data.targetProfiles}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );
      await clickByName(t('pages.campaign-creation.yes'));

      // then
      assert.dom(screen.getByText(t('api-error-messages.campaign-creation.name-required'))).exists();
      assert.dom(screen.getByText(t('api-error-messages.campaign-creation.purpose-required'))).exists();
      assert.dom(screen.getByText(t('api-error-messages.campaign-creation.external-user-id-required'))).exists();
    });

    test('it should display errors messages when the target profile field is empty', async function (assert) {
      // given
      const campaignWithErrors = EmberObject.create({
        errors: {
          targetProfile: [
            {
              message: 'TARGET_PROFILE_IS_REQUIRED',
            },
          ],
        },
      });
      data.errors = campaignWithErrors.errors;

      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @targetProfiles={{data.targetProfiles}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );
      await clickByName(t('pages.campaign-creation.purpose.assessment'));

      // then
      assert.dom(screen.getByText(t('api-error-messages.campaign-creation.target-profile-required'))).exists();
    });

    test('it should display errors messages when the blueprint id field is empty', async function (assert) {
      // given
      const campaignWithErrors = EmberObject.create({
        errors: {
          blueprint: [
            {
              message: 'TARGET_PROFILE_IS_REQUIRED',
            },
          ],
        },
      });
      data.errors = campaignWithErrors.errors;

      const store = this.owner.lookup('service:store');
      const combinedCourseBlueprint = store.createRecord('combined-course-blueprint', {
        id: '1',
        name: 'Blueprint 1',
      });

      data.combinedCourseBlueprints = [combinedCourseBlueprint];

      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @targetProfiles={{data.targetProfiles}}
            @membersSortedByFullName={{data.defaultMembers}}
            @combinedCourseBlueprints={{data.combinedCourseBlueprints}}
          />
        </template>,
      );
      await clickByName(t('pages.campaign-creation.purpose.combined-course'));

      // then
      assert.dom(screen.getByText(t('api-error-messages.campaign-creation.target-profile-required'))).exists();
    });
  });
});
