import { render, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { getDefaultNormalizer } from '@testing-library/dom';
import ParticipantAssessmentHeader from 'pix-orga/components/participant/assessment/header';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | ParticipantAssessmentHeader', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.setupRouter();
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.organization = {};
  });

  test('it should display user information', async function (assert) {
    // given
    const participation = {
      firstName: 'Jean',
      lastName: 'La fripouille',
    };
    const campaign = {};

    // when
    const screen = await render(
      <template><ParticipantAssessmentHeader @participation={{participation}} @campaign={{campaign}} /></template>,
    );

    // then
    assert.ok(screen.getByText('Jean La fripouille'));
  });

  module('participation selector', function () {
    module('for campaign not multipleSending', function () {
      test('it should not be displayed', async function (assert) {
        const participation = {
          firstName: 'Jean',
          lastName: 'La fripouille',
          id: 12345,
        };
        const campaign = { multipleSendings: false };
        const allParticipations = [participation];

        const screen = await render(
          <template>
            <ParticipantAssessmentHeader
              @participation={{participation}}
              @campaign={{campaign}}
              @allParticipations={{allParticipations}}
            />
          </template>,
        );

        assert.notOk(screen.queryByLabelText(t('pages.assessment-individual-results.participation-selector')));
      });
    });

    module('for multipleSending campaigns', function () {
      test('it should have categories for participations options', async function (assert) {
        const participation = {
          firstName: 'Jean',
          lastName: 'La fripouille',
          id: 12345,
          status: 'STARTED',
        };
        const anotherParticipation = {
          firstName: 'Jean',
          lastName: 'La fripouille',
          id: 12346,
          status: 'SHARED',
          sharedAt: '2020-01-02',
        };
        const campaign = { multipleSendings: true };
        const allParticipations = [participation, anotherParticipation];

        const screen = await render(
          <template>
            <ParticipantAssessmentHeader
              @participation={{participation}}
              @campaign={{campaign}}
              @allParticipations={{allParticipations}}
            />
          </template>,
        );

        const selector = screen.getByLabelText(t('pages.assessment-individual-results.participation-selector'));
        await click(selector);
        await screen.findByRole('listbox');

        assert.ok(
          within(screen.getByRole('listbox')).getByText(t('pages.assessment-individual-results.participation-shared'), {
            exact: false,
          }),
        );
        assert.ok(
          within(screen.getByRole('listbox')).getByText(
            t('pages.assessment-individual-results.participation-not-shared'),
            { exact: false },
          ),
        );
      });

      test('it should redirect toward a participation', async function (assert) {
        const router = this.owner.lookup('service:router');
        router.transitionTo = sinon.stub();

        const participation = {
          firstName: 'Jean',
          lastName: 'La fripouille',
          id: 12345,
          status: 'STARTED',
        };
        const anotherParticipation = {
          firstName: 'Jean',
          lastName: 'La fripouille',
          id: 12346,
          status: 'SHARED',
          sharedAt: '2020-01-02',
        };
        const campaign = { multipleSendings: true, id: '1' };
        const allParticipations = [participation, anotherParticipation];

        const screen = await render(
          <template>
            <ParticipantAssessmentHeader
              @participation={{participation}}
              @campaign={{campaign}}
              @allParticipations={{allParticipations}}
            />
          </template>,
        );

        const selector = screen.getByLabelText(t('pages.assessment-individual-results.participation-selector'));
        await click(selector);
        await screen.findByRole('listbox');
        await click(
          screen.getByRole('option', {
            name: `${t('pages.assessment-individual-results.participation-label', { participationNumber: 1 })} - 02/01/2020`,
          }),
        );

        assert.ok(
          router.transitionTo.calledWith(
            'authenticated.campaigns.participant-assessment',
            campaign.id,
            allParticipations[1].id,
          ),
        );
      });
    });
  });

  test('it displays campaign participation creation date', async function (assert) {
    const participation = { createdAt: '2020-01-01' };
    const campaign = {};

    const screen = await render(
      <template><ParticipantAssessmentHeader @participation={{participation}} @campaign={{campaign}} /></template>,
    );

    assert.ok(screen.getByText('1 janv. 2020'));
  });

  module('progression', function () {
    test('it displays campaign participation progression on type ASSESSMENT', async function (assert) {
      const participation = { progression: 0.75, isShared: false };
      const campaign = { isTypeExam: false, isTypeAssessment: true };

      const screen = await render(
        <template><ParticipantAssessmentHeader @participation={{participation}} @campaign={{campaign}} /></template>,
      );

      assert.ok(screen.getByText(t('pages.assessment-individual-results.progression')));
      assert.ok(screen.getByText('75 %'));
    });

    test('it displays campaign participation progression on type EXAM', async function (assert) {
      const participation = { progression: 0.75, isShared: false };
      const campaign = { isTypeExam: true, isTypeAssessment: false };

      const screen = await render(
        <template><ParticipantAssessmentHeader @participation={{participation}} @campaign={{campaign}} /></template>,
      );

      assert.ok(screen.queryByText(t('pages.assessment-individual-results.progression')));
      assert.ok(screen.queryByText('75 %'));
    });
  });

  module('is shared', function () {
    module('when participant has shared results', function () {
      test('it displays the sharing date', async function (assert) {
        const participation = {
          isShared: true,
          sharedAt: '2020-01-02',
          masteryRate: 0.85,
        };
        const campaign = {};

        const screen = await render(
          <template><ParticipantAssessmentHeader @participation={{participation}} @campaign={{campaign}} /></template>,
        );

        assert.ok(screen.getByText(t('pages.campaign-individual-results.shared-date')));
        assert.ok(screen.getByText('2 janv. 2020'));
      });
    });

    module('when participant has not shared results', function () {
      test('it does not displays the sharing date', async function (assert) {
        const participation = { isShared: false };
        const campaign = {};

        const screen = await render(
          <template><ParticipantAssessmentHeader @participation={{participation}} @campaign={{campaign}} /></template>,
        );

        assert.notOk(screen.queryByText(t('pages.campaign-individual-results.shared-date')));
      });

      test('displays participant progression on campaign of type not equal to exam', async function (assert) {
        const participation = {
          isShared: false,
          progression: 0.8,
        };

        const campaign = {
          isTypeExam: false,
        };

        const screen = await render(
          <template><ParticipantAssessmentHeader @participation={{participation}} @campaign={{campaign}} /></template>,
        );

        assert.ok(screen.queryByText(t('pages.assessment-individual-results.progression')));
        assert.ok(
          screen.queryByText(t('common.result.percentage', { value: 0.8 }), {
            normalizer: getDefaultNormalizer({ collapseWhitespace: false }),
          }),
        );
      });

      test('show participant progression on campaign of type exam', async function (assert) {
        const participation = {
          isShared: false,
          progression: 0.8,
        };

        const campaign = {
          isTypeExam: true,
        };

        const screen = await render(
          <template><ParticipantAssessmentHeader @participation={{participation}} @campaign={{campaign}} /></template>,
        );

        assert.ok(screen.queryByText(t('pages.assessment-individual-results.progression')));
        assert.ok(
          screen.queryByText(t('common.result.percentage', { value: 0.8 }), {
            normalizer: getDefaultNormalizer({ collapseWhitespace: false }),
          }),
        );
      });
    });
  });

  module('identifiant', function () {
    module('when the external id is present', function () {
      test('it displays the external id', async function (assert) {
        const participation = {
          participantExternalId: 'i12345',
          isShared: false,
        };
        const campaign = { externalIdLabel: 'identifiant de l’élève' };

        const screen = await render(
          <template><ParticipantAssessmentHeader @participation={{participation}} @campaign={{campaign}} /></template>,
        );

        assert.ok(screen.getByText('identifiant de l’élève'));
        assert.ok(screen.getByText('i12345'));
      });
    });
    module('when the external id is not present', function () {
      test('it does not display the external id', async function (assert) {
        const participation = {
          participantExternalId: null,
          isShared: false,
        };
        const campaign = {};

        const screen = await render(
          <template><ParticipantAssessmentHeader @participation={{participation}} @campaign={{campaign}} /></template>,
        );

        assert.notOk(screen.queryByText('identifiant de l’élève'));
      });
    });
  });

  module('results information', function () {
    module('when the participation is shared', function () {
      test('it should not display campaign progression', async function (assert) {
        const participation = { progression: 1, isShared: true, masteryRate: 0.85 };
        const campaign = {};

        const screen = await render(
          <template><ParticipantAssessmentHeader @participation={{participation}} @campaign={{campaign}} /></template>,
        );

        assert.notOk(screen.queryByText(t('pages.assessment-individual-results.progression')));
        assert.notOk(screen.queryByText(t('common.result.percentage', { value: participation.progression })));
      });

      module('when the campaign has stages', function () {
        test('it displays stages acquired', async function (assert) {
          const campaign = {
            hasStages: true,
            stages: [
              { id: 'stage1', threshold: 0 },
              { id: 'stage2', threshold: 70 },
              { id: 'stage3', threshold: 80 },
            ],
          };
          const participation = {
            isShared: true,
            reachedStage: 2,
            totalStage: 3,
          };

          const screen = await render(
            <template>
              <ParticipantAssessmentHeader @participation={{participation}} @campaign={{campaign}} />
            </template>,
          );

          assert.ok(screen.queryByLabelText(t('pages.assessment-individual-results.result')));
          assert.ok(screen.getByText(t('common.result.stages', { count: 1, total: 2 })));
        });
      });

      module('when the campaign has no stages', function () {
        test('it displays campaign participation mastery percentage', async function (assert) {
          const participation = { masteryRate: 0.65, isShared: true };
          const campaign = {};

          const screen = await render(
            <template>
              <ParticipantAssessmentHeader @participation={{participation}} @campaign={{campaign}} />
            </template>,
          );

          // We should keep getAllByText instead of getByText because in the ci the npm run test fails.
          // It finds two occurences instead of one for some reason related to a nbsp; not being present in this context.
          assert.ok(screen.getAllByText('65 %')[0]);
        });
      });

      module('when the campaign has badges', function () {
        test('it displays acquired badges', async function (assert) {
          const campaign = { hasBadges: true, badges: [{ id: '1', title: 'Les bases' }] };
          const participation = { isShared: true, masteryRate: 0.85, badges: [{ id: '1', title: 'Les bases' }] };

          const screen = await render(
            <template>
              <ParticipantAssessmentHeader @participation={{participation}} @campaign={{campaign}} />
            </template>,
          );

          assert
            .dom(screen.getByText('Les bases - ' + t('pages.campaign-results.table.badge-tooltip.acquired')))
            .exists();
          assert.dom(screen.getByLabelText(t('pages.assessment-individual-results.badges'))).containsText('Les bases');
        });

        test('it displays unacquired badges', async function (assert) {
          const campaign = { hasBadges: true, badges: [{ id: '1', title: 'Les bases' }] };
          const participation = { isShared: true, masteryRate: 0.85, badges: [] };

          const screen = await render(
            <template>
              <ParticipantAssessmentHeader @participation={{participation}} @campaign={{campaign}} />
            </template>,
          );

          assert
            .dom(screen.getByText('Les bases - ' + t('pages.campaign-results.table.badge-tooltip.unacquired')))
            .exists();
          assert.dom(screen.getByLabelText(t('pages.assessment-individual-results.badges'))).containsText('Les bases');
        });
      });

      module('when the campaign has no badges', function () {
        test('it does not display badges acquired', async function (assert) {
          const campaign = { hasBadges: false };
          const participation = { isShared: true, masteryRate: 0.85, badges: [{ id: '1', title: 'Les bases' }] };

          const screen = await render(
            <template>
              <ParticipantAssessmentHeader @participation={{participation}} @campaign={{campaign}} />
            </template>,
          );

          assert.notOk(screen.queryByLabelText(t('pages.assessment-individual-results.badges')));
        });
      });
    });

    module('when the participation is not shared', function () {
      test('it does not display results', async function (assert) {
        const participation = { isShared: false };
        const campaign = {};

        const screen = await render(
          <template><ParticipantAssessmentHeader @participation={{participation}} @campaign={{campaign}} /></template>,
        );

        assert.notOk(screen.queryByLabelText(t('pages.assessment-individual-results.result')));
      });
    });
  });
});
