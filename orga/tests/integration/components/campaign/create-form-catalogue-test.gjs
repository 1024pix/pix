import { clickByName, fillByLabel, render, within } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CreateForm from 'pix-orga/components/campaign/create-form-catalogue';
import { assert, module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::CreateForm (catalogue)', function (hooks) {
  setupIntlRenderingTest(hooks);

  const data = {};
  let store;
  const createCampaignSpy = (event) => {
    event.preventDefault();
  };
  const cancelSpy = () => {};

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
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
  });

  test('it displays campaign goals', async function (assert) {
    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    // then
    const fieldset = screen.getByRole('radiogroup', { name: t('pages.campaign-creation.purpose.label') });
    assert.strictEqual(within(fieldset).getAllByRole('radio').length, 3);
  });

  test('it disables the submit button if no course (other than profile collection) is selected', async function () {
    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    // then
    const button = screen.getByRole('button', { name: t('pages.campaign-creation.actions.create') });
    assert.dom(button).hasAria('disabled', 'true');
  });

  test('it enables the submit button profile collection is selected', async function () {
    data.campaign.type = 'PROFILES_COLLECTION';
    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    // then
    const button = screen.getByRole('button', { name: t('pages.campaign-creation.actions.create') });
    assert.dom(button).doesNotHaveAria('disabled');
  });

  test("it displays campaign's name", async function (assert) {
    // given
    data.campaign.course = store.createRecord('course', { type: 'targetProfile' });
    data.campaign.name = 'Campagne de test';
    data.campaign.type = 'ASSESSMENT';

    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    assert
      .dom(screen.getByLabelText(t('pages.campaign-creation.name.label'), { exact: false }))
      .hasValue('Campagne de test');
  });

  test('[a11y] it displays a message that some inputs are required', async function (assert) {
    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
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

      test('it hides owner field if no course selected', async function () {
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
              @membersSortedByFullName={{data.defaultMembers}}
            />
          </template>,
        );

        assert.dom(screen.queryByText(t('pages.campaign-creation.owner.info'))).doesNotExist();
      });

      test('it hides multiple sendings field if no course selected', async function () {
        // given
        data.campaign.type = campaignType.status;
        data.prescriber.features.MULTIPLE_SENDING_ASSESSMENT = { active: true, params: null };
        // when
        const screen = await render(
          <template>
            <CreateForm
              @campaign={{data.campaign}}
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{data.errors}}
              @membersSortedByFullName={{data.defaultMembers}}
            />
          </template>,
        );
        assert
          .dom(
            screen.queryByRole('radiogroup', {
              name: t('pages.campaign-creation.multiple-sendings.assessments.question-label'),
            }),
          )
          .doesNotExist();
      });

      test('it hides campaign title until user select a course', async function (assert) {
        // given
        data.campaign.type = 'ASSESSMENT';
        // when
        const screen = await render(
          <template>
            <CreateForm
              @campaign={{data.campaign}}
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{data.errors}}
              @membersSortedByFullName={{data.defaultMembers}}
            />
          </template>,
        );

        assert
          .dom(screen.queryByLabelText(t('pages.campaign-creation.test-title.label'), { exact: false }))
          .doesNotExist();
      });

      test('it hides landing page until user select a course', async function () {
        // when
        const screen = await render(
          <template>
            <CreateForm
              @campaign={{data.campaign}}
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{data.errors}}
              @membersSortedByFullName={{data.defaultMembers}}
            />
          </template>,
        );
        // then
        assert
          .dom(screen.queryByLabelText(t('pages.campaign-creation.landing-page-text.label'), { exact: false }))
          .doesNotExist();
      });

      test(`it has ${campaignType.status} checked`, async function (assert) {
        // given
        data.campaign.type = campaignType.status;
        data.campaign.course = store.createRecord('course', { type: 'targetProfile' });

        // when
        const screen = await render(
          <template>
            <CreateForm
              @campaign={{data.campaign}}
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{data.errors}}
              @membersSortedByFullName={{data.defaultMembers}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByLabelText(t(campaignType.purpose))).isChecked();
      });

      test("it displays owner fields and auto complete owner field with owner's full name", async function (assert) {
        // given
        data.campaign.type = campaignType.status;
        data.campaign.course = store.createRecord('course', { type: 'targetProfile' });

        // when
        const screen = await render(
          <template>
            <CreateForm
              @campaign={{data.campaign}}
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{data.errors}}
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

      test('it fills course fields', async function (assert) {
        // given
        data.campaign.type = campaignType.status;
        data.campaign.course = store.createRecord('course', { type: 'targetProfile', name: 'yolo' });

        // when
        const screen = await render(
          <template>
            <CreateForm
              @campaign={{data.campaign}}
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{data.errors}}
              @membersSortedByFullName={{data.defaultMembers}}
            />
          </template>,
        );

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: data.campaign.course.name,
            }),
          )
          .exists();
      });

      test('it fills multiple sendings fields', async function (assert) {
        // given
        data.campaign.type = campaignType.status;
        data.campaign.course = store.createRecord('course', { type: 'targetProfile' });
        data.prescriber.features.MULTIPLE_SENDING_ASSESSMENT = { active: true, params: null };
        data.campaign.multipleSendings = true;
        // when
        const screen = await render(
          <template>
            <CreateForm
              @campaign={{data.campaign}}
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{data.errors}}
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

      test('it explains which informations will be visible to organization-learners', async function () {
        // given
        data.campaign.type = campaignType.status;
        data.campaign.course = store.createRecord('course', { type: 'targetProfile' });
        // when
        const screen = await render(
          <template>
            <CreateForm
              @campaign={{data.campaign}}
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{data.errors}}
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

      test('it displays fields for campaign title', async function (assert) {
        // given
        data.campaign.type = campaignType.status;
        data.campaign.course = store.createRecord('course', { type: 'targetProfile' });

        // when
        const screen = await render(
          <template>
            <CreateForm
              @campaign={{data.campaign}}
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{data.errors}}
              @membersSortedByFullName={{data.defaultMembers}}
            />
          </template>,
        );
        await clickByName(t(campaignType.purpose));

        // then
        assert.dom(screen.getByText(t('pages.campaign-creation.test-title.label'))).exists();
        assert.dom(screen.getByText(t('pages.campaign-creation.purpose.label'))).exists();
      });

      test(`it displays the purpose explanation of an ${campaignType.status} campaign`, async function (assert) {
        // when
        const screen = await render(
          <template>
            <CreateForm
              @campaign={{data.campaign}}
              @onSubmit={{createCampaignSpy}}
              @onCancel={{cancelSpy}}
              @errors={{data.errors}}
              @membersSortedByFullName={{data.defaultMembers}}
            />
          </template>,
        );
        await clickByName(t(campaignType.purpose));

        // then
        assert.dom(screen.getByText(t(campaignType.explanation))).exists();
      });

      module('when the user has selected a course', function () {
        test('it displays informations about the course', async function (assert) {
          // given

          const course = store.createRecord('course', {
            id: '1',
            name: 'targetProfile1',
            type: 'targetProfile',
            nbTubes: 3,
            isSimplifiedAccess: true,
          });
          data.campaign.course = course;
          data.campaign.type = campaignType.status;

          // when
          const screen = await render(
            <template>
              <CreateForm
                @campaign={{data.campaign}}
                @onSubmit={{createCampaignSpy}}
                @onCancel={{cancelSpy}}
                @errors={{data.errors}}
                @membersSortedByFullName={{data.defaultMembers}}
              />
            </template>,
          );

          // then
          assert.dom(screen.getByText(t('pages.catalogue.card.tag.target-profile'))).exists();
          assert.dom(screen.getByRole('heading', { name: course.name })).exists();
          assert.dom(screen.getByText(t('pages.catalogue.card.tubes-count', { count: course.nbTubes }))).exists();
          assert.dom(screen.getByText(t('pages.catalogue.card.simplified-access'))).exists();
        });

        module('when the user wants to select another course', function () {
          test('it redirects to /catalogue/targetProfile', async function (assert) {
            // given

            data.campaign.course = store.createRecord('course', {
              id: '1',
              name: 'targetProfile1',
              type: 'targetProfile',
              nbTubes: 3,
              isSimplifiedAccess: true,
            });
            data.campaign.type = campaignType.status;

            // when
            const screen = await render(
              <template>
                <CreateForm
                  @campaign={{data.campaign}}
                  @onSubmit={{createCampaignSpy}}
                  @onCancel={{cancelSpy}}
                  @errors={{data.errors}}
                  @membersSortedByFullName={{data.defaultMembers}}
                />
              </template>,
            );

            // then
            assert
              .dom(screen.getByRole('link', { name: t('pages.campaign-creation.course-selection-label') }))
              .hasAttribute('href', '/catalogue/targetProfile');
          });
        });
      });
    });
  });

  module(`when campaign is of type combined course`, function () {
    test(`it not displays external id fields`, async function (assert) {
      // given
      data.campaign.type = 'COMBINED_COURSE';
      data.campaign.course = store.createRecord('course', {
        id: '1',
        name: 'Mon schéma de parcours combiné',
        type: 'blueprint',
        nbModules: 3,
        isSimplifiedAccess: true,
      });

      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );

      // then
      assert
        .dom(screen.queryByRole('radiogroup', { name: t('pages.campaign-creation.external-id-label.question-label') }))
        .doesNotExist();
    });

    test(`it has combined course goal checked and not display owner fields`, async function (assert) {
      const campaignType = {
        status: 'COMBINED_COURSE',
        purpose: 'pages.campaign-creation.purpose.combined-course',
      };
      // given
      data.campaign.type = campaignType.status;
      data.campaign.course = store.createRecord('course', {
        id: '1',
        name: 'Mon schéma de parcours combiné',
        type: 'blueprint',
        nbModules: 3,
        isSimplifiedAccess: true,
      });

      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByLabelText(t(campaignType.purpose))).isChecked();
      assert.dom(screen.queryByText(t('pages.campaign-creation.owner.info'))).doesNotExist();
      assert.dom(screen.queryByText(t('pages.campaign-creation.owner.title'))).doesNotExist();
    });

    test('it redirects to /catalogue/blueprint', async function (assert) {
      // given

      data.campaign.course = store.createRecord('course', {
        id: '1',
        name: 'blueprint1',
        type: 'blueprint',
        nbModules: 3,
        isSimplifiedAccess: true,
      });
      data.campaign.type = 'COMBINED_COURSE';

      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );

      // then
      assert
        .dom(screen.getByRole('link', { name: t('pages.campaign-creation.course-selection-label') }))
        .hasAttribute('href', '/catalogue/blueprint');
    });
  });

  test('it not displays EXAM type when feature is not enable', async function () {
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
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    assert.notOk(screen.queryByLabelText(t('pages.campaign-creation.purpose.exam')));
  });

  module('when campaign is of type PROFILES_COLLECTION', function () {
    test('it has PROFILES_COLLECTION checked', async function (assert) {
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
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );

      assert.dom(screen.getByLabelText(t('pages.campaign-creation.purpose.profiles-collection'))).isChecked();
    });

    test('it fills multiple sendings fields', async function (assert) {
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
    test('it not displays fields for campaign title and target profile', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );
      await clickByName(t('pages.campaign-creation.purpose.profiles-collection'));

      // then
      assert.dom(screen.queryByText(t('pages.campaign-creation.test-title.label'))).doesNotExist();
      assert.dom(screen.queryByText(t('pages.campaign-creation.target-profiles-list-label'))).doesNotExist();
    });

    test('it displays fields for enabling multiple sendings', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );
      await clickByName(t('pages.campaign-creation.purpose.profiles-collection'));

      // then
      assert.dom(screen.getByText(t('pages.campaign-creation.multiple-sendings.profiles.question-label'))).exists();
      assert.dom(screen.getByText(t('pages.campaign-creation.multiple-sendings.profiles.info'))).exists();
    });

    test('it displays the purpose explanation of a profiles collection campaign', async function (assert) {
      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
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
    test('it not displays fields for campaign title and target profile', async function (assert) {
      // when

      data.campaign.course = store.createRecord('course', {
        id: '1',
        name: 'Blueprint 1',
        type: 'blueprint',
      });
      data.campaign.type = 'COMBINED_COURSE';

      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );

      // then
      assert.dom(screen.queryByText(t('pages.campaign-creation.test-title.label'))).doesNotExist();
    });
  });

  test('it fills external user ID selection (yes)', async function (assert) {
    // given
    data.campaign.externalIdLabel = 'Numéro étudiant';
    data.campaign.course = store.createRecord('course', { type: 'targetProfile' });
    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
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

  test('it fills external user ID selection (no)', async function (assert) {
    // given
    data.campaign.course = store.createRecord('course', { type: 'targetProfile' });
    data.campaign.externalIdLabel = null;
    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
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
    test('it fills the default external user ID selection', async function (assert) {
      data.campaign.course = store.createRecord('course', { type: 'targetProfile' });
      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
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

    test('it not displays gdpr footnote', async function (assert) {
      // when
      data.campaign.course = store.createRecord('course', { type: 'targetProfile' });
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );

      // then
      assert.dom(screen.queryByText(t('pages.campaign-creation.legal-warning'))).doesNotExist();
    });
  });

  module('when user choose not to ask an external user ID', function () {
    test('it not displays gdpr footnote either', async function (assert) {
      // when
      data.campaign.course = store.createRecord('course', { type: 'targetProfile' });
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
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
    test('it displays gdpr footnote', async function (assert) {
      // when
      data.campaign.course = store.createRecord('course', { type: 'targetProfile' });
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );
      await clickByName(t('pages.campaign-creation.yes'));

      // then
      assert.dom(screen.getByText(t('pages.campaign-creation.legal-warning'))).exists();
    });

    test('it sets the external id as required', async function (assert) {
      // when
      data.campaign.course = store.createRecord('course', { type: 'targetProfile' });
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
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
      data.campaign.course = store.createRecord('course', { type: 'targetProfile' });
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
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
      data.campaign.course = store.createRecord('course', { type: 'targetProfile' });
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
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

  test('it fills campaign title', async function (assert) {
    // given
    data.campaign.type = 'ASSESSMENT';
    data.campaign.title = 'Mon titre de parcours';
    data.campaign.course = store.createRecord('course', { type: 'targetProfile' });
    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    assert
      .dom(screen.getByLabelText(t('pages.campaign-creation.test-title.label'), { exact: false }))
      .hasValue('Mon titre de parcours');
  });

  module('landing page customization', function () {
    test('it hides landing page info for combinedCourse', async function () {
      // given
      data.campaign.course = store.createRecord('course', { type: 'blueprint' });
      data.campaign.type = 'COMBINED_COURSE';

      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );
      // then
      assert
        .dom(screen.queryByLabelText(t('pages.campaign-creation.landing-page-text.label'), { exact: false }))
        .doesNotExist();
    });
  });

  test('it fills campaign landing page text', async function (assert) {
    // given
    data.campaign.course = store.createRecord('course', { type: 'targetProfile' });
    data.campaign.type = 'ASSESSMENT';
    data.campaign.customLandingPageText = 'Mon texte de landing page';
    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );

    assert
      .dom(screen.getByLabelText(t('pages.campaign-creation.landing-page-text.label'), { exact: false }))
      .hasValue('Mon texte de landing page');
  });

  test('it sends campaign creation action when submitted', async function (assert) {
    // given

    data.campaign.course = store.createRecord('course', { name: 'targetProfile1', id: '123', type: 'targetProfile' });
    const createCampaignSpy = sinon.stub();

    await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );
    await fillByLabel(`${t('pages.campaign-creation.name.label')} *`, 'Ma campagne');
    await clickByName(t('pages.campaign-creation.purpose.assessment'));

    // when
    await clickByName(t('pages.campaign-creation.actions.create'));

    sinon.assert.calledWithExactly(createCampaignSpy, data.campaign);
    // then
    assert.ok(true);
  });

  test('it not displays the explanation of automatic compute certificability if the feature is not activated', async function (assert) {
    // when
    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );
    await clickByName(t('pages.campaign-creation.purpose.profiles-collection'));

    // then
    assert.dom(screen.queryByRole('link', { name: 'Élèves' })).doesNotExist();
  });

  test('it displays the explanation of automatic compute certificability if the feature is activated', async function (assert) {
    // when
    data.prescriber.features.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY = { active: true, params: null };

    const screen = await render(
      <template>
        <CreateForm
          @campaign={{data.campaign}}
          @onSubmit={{createCampaignSpy}}
          @onCancel={{cancelSpy}}
          @errors={{data.errors}}
          @membersSortedByFullName={{data.defaultMembers}}
        />
      </template>,
    );
    await clickByName(t('pages.campaign-creation.purpose.profiles-collection'));

    // then
    assert.dom(screen.getByRole('link', { name: 'Élèves' })).exists();
  });

  module('when there are errors', function () {
    test('it displays errors messages when the campaign purpose fields is empty', async function (assert) {
      // given
      const campaignWithErrors = EmberObject.create({
        errors: {
          type: [
            {
              message: 'CAMPAIGN_PURPOSE_IS_REQUIRED',
            },
          ],
        },
      });

      data.errors = campaignWithErrors.errors;

      data.campaign.course = store.createRecord('course', { type: 'targetProfile' });
      data.campaign.type = 'ASSESSMENT';
      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );
      await clickByName(t('pages.campaign-creation.yes'));
      // then
      assert.dom(screen.getByText(t('api-error-messages.campaign-creation.purpose-required'))).exists();
    });

    test('it displays errors messages when the name, and external user id fields are empty', async function (assert) {
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
        },
      });

      data.errors = campaignWithErrors.errors;

      data.campaign.course = store.createRecord('course', { type: 'targetProfile' });
      data.campaign.type = 'ASSESSMENT';
      // when
      const screen = await render(
        <template>
          <CreateForm
            @campaign={{data.campaign}}
            @onSubmit={{createCampaignSpy}}
            @onCancel={{cancelSpy}}
            @errors={{data.errors}}
            @membersSortedByFullName={{data.defaultMembers}}
          />
        </template>,
      );
      await clickByName(t('pages.campaign-creation.yes'));

      // then
      assert.dom(screen.getByText(t('api-error-messages.campaign-creation.name-required'))).exists();
      assert.dom(screen.getByText(t('api-error-messages.campaign-creation.external-user-id-required'))).exists();
    });

    ['targetProfile', 'blueprint'].forEach((error) => {
      test(`it displays error message when the ${error} course field is empty`, async function (assert) {
        // given
        const campaignWithErrors = EmberObject.create({
          errors: {
            [error]: [
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
              @membersSortedByFullName={{data.defaultMembers}}
            />
          </template>,
        );
        await clickByName(t('pages.campaign-creation.purpose.assessment'));

        // then
        assert.dom(screen.getByText(t('api-error-messages.campaign-creation.target-profile-required'))).exists();
      });
    });
  });
});
