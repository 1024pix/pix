import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import List from 'pix-admin/components/certifications/list';
import { module, test } from 'qunit';

module('Integration | Component | certifications/list', function (hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  test('should display number of certification issue reports with required action', async function (assert) {
    // given
    const certifications = [
      store.createRecord('jury-certification-summary', {
        id: 1,
        numberOfCertificationIssueReportsWithRequiredAction: 2,
      }),
    ];

    const pagination = {};

    // when
    await render(<template><List @certifications={{certifications}} @pagination={{pagination}} /></template>);

    const numberOfCertificationIssueReportsWithRequiredAction =
      this.element.querySelector('tbody > tr td:nth-child(5)');
    assert.dom(numberOfCertificationIssueReportsWithRequiredAction).hasText('2');
  });

  test('should display the complementary certification', async function (assert) {
    // given
    const juryCertificationSummaryProcessed = store.createRecord('jury-certification-summary', {
      complementaryCertificationTakenLabel: 'Pix+ Droit Maître',
    });
    const certifications = [juryCertificationSummaryProcessed];
    const pagination = {};

    // when
    const screen = await render(
      <template><List @certifications={{certifications}} @pagination={{pagination}} /></template>,
    );

    // then
    assert.dom(screen.getByText('Pix+ Droit Maître', { exact: false })).exists();
  });

  module('when displayHasSeenEndTestScreenColumn is true', function () {
    test('it should display the "Ecran de fin de test vu" column', async function (assert) {
      // given
      const juryCertificationSummaryProcessed = store.createRecord('jury-certification-summary', {
        hasSeenEndTestScreen: true,
      });
      const certifications = [juryCertificationSummaryProcessed];
      const pagination = {};

      // when
      const screen = await render(
        <template>
          <List
            @certifications={{certifications}}
            @displayHasSeenEndTestScreenColumn={{true}}
            @pagination={{pagination}}
          />
        </template>,
      );

      // then
      assert.dom(screen.getByText('Ecran de fin de test vu')).exists();
    });
  });

  module('when displayHasSeenEndTestScreenColumn is false', function () {
    test('it should not display the "Ecran de fin de test vu" column', async function (assert) {
      // given
      const juryCertificationSummaryProcessed = store.createRecord('jury-certification-summary', {
        hasSeenEndTestScreen: true,
      });
      const certifications = [juryCertificationSummaryProcessed];
      const pagination = {};

      // when
      const screen = await render(
        <template>
          <List
            @certifications={{certifications}}
            @displayHasSeenEndTestScreenColumn={{false}}
            @pagination={{pagination}}
          />
        </template>,
      );

      // then
      assert.dom(screen.queryByText('Ecran de fin de test vu')).doesNotExist();
    });
  });
});
