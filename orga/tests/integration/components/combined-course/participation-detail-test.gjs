import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ParticipationDetail from 'pix-orga/components/combined-course/participation-detail';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | combined-course/participation-detail', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders title', async function (assert) {
    const participation = {
      firstName: 'Jean',
      lastName: 'Bon',
      combinedCourseId: 123,
    };
    const combinedCourse = {
      id: 123,
      name: 'Combinix',
    };

    const screen = await render(
      <template><ParticipationDetail @participation={{participation}} @combinedCourse={{combinedCourse}} /></template>,
    );

    assert.ok(screen.getByRole('heading', { name: 'Jean Bon', level: 1 }));
  });

  test('it renders breadcrumb', async function (assert) {
    const participation = {
      firstName: 'Jean',
      lastName: 'Bon',
      combinedCourseId: 123,
    };
    const combinedCourse = {
      id: 123,
      name: 'Combinix',
    };

    const screen = await render(
      <template><ParticipationDetail @participation={{participation}} @combinedCourse={{combinedCourse}} /></template>,
    );

    assert.ok(screen.getByRole('link', { name: t('navigation.main.campaigns') }));
    assert.ok(screen.getByRole('link', { name: t('navigation.main.combined-courses') }));
    assert.ok(screen.getByRole('link', { name: 'Combinix' }));
    assert.ok(
      screen.getByText(
        t('pages.combined-course.participation-detail.breadcrumb', { firstName: 'Jean', lastName: 'Bon' }),
      ),
    );
  });

  module('when there are multiple steps', function () {
    test('it displays step labels', async function (assert) {
      const participation = {
        firstName: 'Jean',
        lastName: 'Bon',
        combinedCourseId: 123,
      };
      const combinedCourse = {
        id: 123,
        name: 'Combinix',
      };
      const itemsBySteps = [
        [
          {
            type: 'CAMPAIGN',
            title: 'Campaign 1',
            isLocked: false,
            isCompleted: false,
            participationStatus: 'NOT_STARTED',
          },
        ],
        [
          {
            type: 'MODULE',
            title: 'Module 1',
            isLocked: false,
            isCompleted: false,
            participationStatus: 'NOT_STARTED',
          },
        ],
      ];

      const screen = await render(
        <template>
          <ParticipationDetail
            @participation={{participation}}
            @combinedCourse={{combinedCourse}}
            @itemsBySteps={{itemsBySteps}}
          />
        </template>,
      );

      assert.ok(
        screen.getByRole('heading', {
          name: t('pages.combined-course.participation-detail.step-label', { number: 1 }),
          level: 2,
        }),
      );
      assert.ok(
        screen.getByRole('heading', {
          name: t('pages.combined-course.participation-detail.step-label', { number: 2 }),
          level: 2,
        }),
      );
    });
  });

  module('when there is a single step', function () {
    test('it does not display step labels', async function (assert) {
      const participation = {
        firstName: 'Jean',
        lastName: 'Bon',
        combinedCourseId: 123,
      };
      const combinedCourse = {
        id: 123,
        name: 'Combinix',
      };
      const itemsBySteps = [
        [
          {
            type: 'CAMPAIGN',
            title: 'Campaign 1',
            isLocked: false,
            isCompleted: false,
            participationStatus: 'NOT_STARTED',
          },
        ],
      ];

      const screen = await render(
        <template>
          <ParticipationDetail
            @participation={{participation}}
            @combinedCourse={{combinedCourse}}
            @itemsBySteps={{itemsBySteps}}
          />
        </template>,
      );

      assert.notOk(screen.queryByText(t('pages.combined-course.participation-detail.step-label', { number: 1 })));
    });
  });

  module('column labels', function () {
    test('it displays "Campagne" and "% de réussite" column labels when items are campaigns', async function (assert) {
      const participation = {
        firstName: 'Jean',
        lastName: 'Bon',
        combinedCourseId: 123,
      };
      const combinedCourse = {
        id: 123,
        name: 'Combinix',
      };
      const itemsBySteps = [
        [
          {
            type: 'CAMPAIGN',
            title: 'Campaign 1',
            isLocked: false,
            isCompleted: false,
            participationStatus: 'NOT_STARTED',
          },
        ],
      ];

      const screen = await render(
        <template>
          <ParticipationDetail
            @participation={{participation}}
            @combinedCourse={{combinedCourse}}
            @itemsBySteps={{itemsBySteps}}
          />
        </template>,
      );

      assert.ok(
        screen.getByRole('columnheader', { name: t('pages.combined-course.participation-detail.column.campaign') }),
        screen.getByRole('columnheader', { name: t('pages.combined-course.participation-detail.column.mastery-rate') }),
      );
    });

    test('it displays "Module" column label when items are modules', async function (assert) {
      const participation = {
        firstName: 'Jean',
        lastName: 'Bon',
        combinedCourseId: 123,
      };
      const combinedCourse = {
        id: 123,
        name: 'Combinix',
      };
      const itemsBySteps = [
        [
          {
            type: 'MODULE',
            title: 'Module 1',
            isLocked: false,
            isCompleted: false,
            participationStatus: 'NOT_STARTED',
          },
        ],
      ];

      const screen = await render(
        <template>
          <ParticipationDetail
            @participation={{participation}}
            @combinedCourse={{combinedCourse}}
            @itemsBySteps={{itemsBySteps}}
          />
        </template>,
      );

      assert.ok(
        screen.getByRole('columnheader', { name: t('pages.combined-course.participation-detail.column.module') }),
      );
    });

    test('it displays "Statut" column label', async function (assert) {
      const participation = {
        firstName: 'Jean',
        lastName: 'Bon',
        combinedCourseId: 123,
      };
      const combinedCourse = {
        id: 123,
        name: 'Combinix',
      };
      const itemsBySteps = [
        [
          {
            type: 'CAMPAIGN',
            title: 'Campaign 1',
            isLocked: false,
            isCompleted: false,
            participationStatus: 'NOT_STARTED',
          },
        ],
      ];

      const screen = await render(
        <template>
          <ParticipationDetail
            @participation={{participation}}
            @combinedCourse={{combinedCourse}}
            @itemsBySteps={{itemsBySteps}}
          />
        </template>,
      );

      assert.ok(
        screen.getByRole('columnheader', { name: t('pages.combined-course.participation-detail.column.status') }),
      );
    });
  });

  module('item rendering', function () {
    test('it displays campaign items with their title', async function (assert) {
      const participation = {
        firstName: 'Jean',
        lastName: 'Bon',
        combinedCourseId: 123,
      };
      const combinedCourse = {
        id: 123,
        name: 'Combinix',
      };
      const itemsBySteps = [
        [
          {
            type: 'CAMPAIGN',
            title: 'Campaign 1',
            isLocked: false,
            isCompleted: false,
            participationStatus: 'NOT_STARTED',
          },
        ],
      ];

      const screen = await render(
        <template>
          <ParticipationDetail
            @participation={{participation}}
            @combinedCourse={{combinedCourse}}
            @itemsBySteps={{itemsBySteps}}
          />
        </template>,
      );

      assert.ok(screen.getByText('Campaign 1'));
    });

    test('it displays campaign items with their formatted mastery rate', async function (assert) {
      const participation = {
        firstName: 'Jean',
        lastName: 'Bon',
        combinedCourseId: 123,
      };
      const combinedCourse = {
        id: 123,
        name: 'Combinix',
      };
      const itemsBySteps = [
        [
          {
            type: 'CAMPAIGN',
            title: 'Campaign 1',
            isLocked: false,
            isCompleted: false,
            masteryRate: 0.42222222,
            participationStatus: 'NOT_STARTED',
          },
        ],
      ];

      const screen = await render(
        <template>
          <ParticipationDetail
            @participation={{participation}}
            @combinedCourse={{combinedCourse}}
            @itemsBySteps={{itemsBySteps}}
          />
        </template>,
      );

      assert.ok(screen.getByText('42 %'));
    });

    test('it displays campaign items with 0% mastery rate', async function (assert) {
      const participation = {
        firstName: 'Jean',
        lastName: 'Bon',
        combinedCourseId: 123,
      };
      const combinedCourse = {
        id: 123,
        name: 'Combinix',
      };
      const itemsBySteps = [
        [
          {
            type: 'CAMPAIGN',
            title: 'Campaign 1',
            isLocked: false,
            isCompleted: false,
            participationStatus: 'NOT_STARTED',
          },
        ],
      ];

      const screen = await render(
        <template>
          <ParticipationDetail
            @participation={{participation}}
            @combinedCourse={{combinedCourse}}
            @itemsBySteps={{itemsBySteps}}
          />
        </template>,
      );

      assert.ok(screen.getByText('Campaign 1'));
      assert.ok(screen.getByText('0 %'));
    });

    test('it displays module items with their title', async function (assert) {
      const participation = {
        firstName: 'Jean',
        lastName: 'Bon',
        combinedCourseId: 123,
      };
      const combinedCourse = {
        id: 123,
        name: 'Combinix',
      };
      const itemsBySteps = [
        [
          {
            type: 'MODULE',
            title: 'Module 1',
            isLocked: false,
            isCompleted: false,
            participationStatus: 'NOT_STARTED',
          },
        ],
      ];

      const screen = await render(
        <template>
          <ParticipationDetail
            @participation={{participation}}
            @combinedCourse={{combinedCourse}}
            @itemsBySteps={{itemsBySteps}}
          />
        </template>,
      );

      assert.ok(screen.getByText('Module 1'));
    });

    test('it displays formation items with formation text', async function (assert) {
      const participation = {
        firstName: 'Jean',
        lastName: 'Bon',
        combinedCourseId: 123,
      };
      const combinedCourse = {
        id: 123,
        name: 'Combinix',
      };
      const itemsBySteps = [
        [
          {
            type: 'FORMATION',
            title: 'Formation 1',
            isLocked: true,
            isCompleted: false,
            participationStatus: 'NOT_STARTED',
          },
        ],
      ];

      const screen = await render(
        <template>
          <ParticipationDetail
            @participation={{participation}}
            @combinedCourse={{combinedCourse}}
            @itemsBySteps={{itemsBySteps}}
          />
        </template>,
      );

      assert.ok(screen.getByText(t('pages.combined-course.participation-detail.formation-locked')));
    });

    test('it displays formation items with a dash for status', async function (assert) {
      const participation = {
        firstName: 'Jean',
        lastName: 'Bon',
        combinedCourseId: 123,
      };
      const combinedCourse = {
        id: 123,
        name: 'Combinix',
      };
      const itemsBySteps = [
        [
          {
            type: 'FORMATION',
            title: 'Formation 1',
            isLocked: true,
            isCompleted: false,
            participationStatus: 'NOT_STARTED',
          },
        ],
      ];

      const screen = await render(
        <template>
          <ParticipationDetail
            @participation={{participation}}
            @combinedCourse={{combinedCourse}}
            @itemsBySteps={{itemsBySteps}}
          />
        </template>,
      );

      const statusCell = screen.getByLabelText(t('pages.combined-course.participation-detail.formation-locked'));
      assert.strictEqual(statusCell.textContent.trim(), '-');
    });
  });

  module('participation status', function () {
    test('it displays LOCKED status when item is locked', async function (assert) {
      const participation = {
        firstName: 'Jean',
        lastName: 'Bon',
        combinedCourseId: 123,
      };
      const combinedCourse = {
        id: 123,
        name: 'Combinix',
      };
      const itemsBySteps = [
        [
          {
            type: 'CAMPAIGN',
            title: 'Campaign 1',
            isLocked: true,
            isCompleted: false,
            participationStatus: 'NOT_STARTED',
          },
        ],
      ];

      const screen = await render(
        <template>
          <ParticipationDetail
            @participation={{participation}}
            @combinedCourse={{combinedCourse}}
            @itemsBySteps={{itemsBySteps}}
          />
        </template>,
      );

      assert.ok(screen.getByText(t('components.participation-status.LOCKED')));
    });

    test('it displays COMPLETED status when item is completed', async function (assert) {
      const participation = {
        firstName: 'Jean',
        lastName: 'Bon',
        combinedCourseId: 123,
      };
      const combinedCourse = {
        id: 123,
        name: 'Combinix',
      };
      const itemsBySteps = [
        [
          {
            type: 'CAMPAIGN',
            title: 'Campaign 1',
            isLocked: false,
            isCompleted: true,
            participationStatus: 'SHARED',
          },
        ],
      ];

      const screen = await render(
        <template>
          <ParticipationDetail
            @participation={{participation}}
            @combinedCourse={{combinedCourse}}
            @itemsBySteps={{itemsBySteps}}
          />
        </template>,
      );

      assert.ok(screen.getByText(t('components.participation-status.COMPLETED')));
    });

    test('it displays NOT_STARTED status when item has not started', async function (assert) {
      const participation = {
        firstName: 'Jean',
        lastName: 'Bon',
        combinedCourseId: 123,
      };
      const combinedCourse = {
        id: 123,
        name: 'Combinix',
      };
      const itemsBySteps = [
        [
          {
            type: 'CAMPAIGN',
            title: 'Campaign 1',
            isLocked: false,
            isCompleted: false,
            participationStatus: 'NOT_STARTED',
          },
        ],
      ];

      const screen = await render(
        <template>
          <ParticipationDetail
            @participation={{participation}}
            @combinedCourse={{combinedCourse}}
            @itemsBySteps={{itemsBySteps}}
          />
        </template>,
      );

      assert.ok(screen.getByText(t('components.participation-status.NOT_STARTED')));
    });

    test('it displays STARTED status when item is in progress', async function (assert) {
      const participation = {
        firstName: 'Jean',
        lastName: 'Bon',
        combinedCourseId: 123,
      };
      const combinedCourse = {
        id: 123,
        name: 'Combinix',
      };
      const itemsBySteps = [
        [
          {
            type: 'CAMPAIGN',
            title: 'Campaign 1',
            isLocked: false,
            isCompleted: false,
            participationStatus: 'STARTED',
          },
        ],
      ];

      const screen = await render(
        <template>
          <ParticipationDetail
            @participation={{participation}}
            @combinedCourse={{combinedCourse}}
            @itemsBySteps={{itemsBySteps}}
          />
        </template>,
      );

      assert.ok(screen.getByText(t('components.participation-status.STARTED')));
    });
  });

  module('with multiple items in a step', function () {
    test('it displays all items in the table', async function (assert) {
      const participation = {
        firstName: 'Jean',
        lastName: 'Bon',
        combinedCourseId: 123,
      };
      const combinedCourse = {
        id: 123,
        name: 'Combinix',
      };
      const itemsBySteps = [
        [
          {
            type: 'CAMPAIGN',
            title: 'Campaign 1',
            isLocked: false,
            isCompleted: false,
            participationStatus: 'NOT_STARTED',
          },
          {
            type: 'CAMPAIGN',
            title: 'Campaign 2',
            isLocked: false,
            isCompleted: true,
            participationStatus: 'STARTED',
          },
          {
            type: 'CAMPAIGN',
            title: 'Campaign 3',
            isLocked: true,
            isCompleted: false,
            participationStatus: 'NOT_STARTED',
          },
        ],
      ];

      const screen = await render(
        <template>
          <ParticipationDetail
            @participation={{participation}}
            @combinedCourse={{combinedCourse}}
            @itemsBySteps={{itemsBySteps}}
          />
        </template>,
      );

      assert.ok(screen.getByText('Campaign 1'));
      assert.ok(screen.getByText('Campaign 2'));
      assert.ok(screen.getByText('Campaign 3'));
    });
  });
});
