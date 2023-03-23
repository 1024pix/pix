import { module, test } from 'qunit';
import Service from '@ember/service';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | members-list', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should show members firstName and lastName', async function (assert) {
    // given
    class FeatureTogglesStub extends Service {
      featureToggles = { isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled: false };
    }
    this.owner.register('service:featureToggles', FeatureTogglesStub);
    const certifMember1 = EmberObject.create({ firstName: 'Maria', lastName: 'Carré', isReferer: false });
    const certifMember2 = EmberObject.create({ firstName: 'John', lastName: 'Williams', isReferer: false });
    const members = [certifMember1, certifMember2];
    this.set('members', members);

    // when
    const screen = await renderScreen(hbs`<MembersList @members={{this.members}} />`);

    // then
    assert.dom(screen.getByRole('columnheader', { name: 'Nom' })).exists();
    assert.dom(screen.getByRole('columnheader', { name: 'Prénom' })).exists();
    assert.dom(screen.getByRole('cell', { name: 'Maria' })).exists();
    assert.dom(screen.getByRole('cell', { name: 'Carré' })).exists();
    assert.dom(screen.getByRole('cell', { name: 'John' })).exists();
    assert.dom(screen.getByRole('cell', { name: 'Williams' })).exists();
  });

  module('when FT_CLEA_RESULTS_RETRIEVAL_BY_HABILITATED_CERTIFICATION_CENTERS is enabled', function () {
    module('when certification center is habilitated CléA', function () {
      test('it should show the referer column', async function (assert) {
        // given
        class FeatureTogglesStub extends Service {
          featureToggles = { isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled: true };
        }
        this.owner.register('service:featureToggles', FeatureTogglesStub);
        const certifMember1 = EmberObject.create({ firstName: 'Maria', lastName: 'Carré', isReferer: false });
        const certifMember2 = EmberObject.create({ firstName: 'John', lastName: 'Williams', isReferer: true });
        const members = [certifMember1, certifMember2];
        this.set('members', members);
        this.set('hasCleaHabilitation', true);

        // when
        const screen = await renderScreen(
          hbs`<MembersList @members={{this.members}} @hasCleaHabilitation={{this.hasCleaHabilitation}} />`
        );

        // then
        assert.dom(screen.getByRole('columnheader', { name: this.intl.t('pages.team.referer') })).exists();
      });

      module('when a member is referer', function () {
        test('it should show the referer tag', async function (assert) {
          // given
          class FeatureTogglesStub extends Service {
            featureToggles = { isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled: true };
          }
          this.owner.register('service:featureToggles', FeatureTogglesStub);
          const certifMember1 = EmberObject.create({ firstName: 'Maria', lastName: 'Carré', isReferer: false });
          const certifMember2 = EmberObject.create({ firstName: 'John', lastName: 'Williams', isReferer: true });
          const members = [certifMember1, certifMember2];
          this.set('members', members);
          this.set('hasCleaHabilitation', true);

          // when
          const screen = await renderScreen(
            hbs`<MembersList @members={{this.members}} @hasCleaHabilitation={{this.hasCleaHabilitation}} />`
          );

          // then
          assert.dom(screen.getByRole('cell', { name: this.intl.t('pages.team.pix-referer') })).exists();
        });
      });

      module('when there is no referer', function () {
        test('it should not show the referer tag', async function (assert) {
          // given
          class FeatureTogglesStub extends Service {
            featureToggles = { isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled: true };
          }
          this.owner.register('service:featureToggles', FeatureTogglesStub);
          const certifMember1 = EmberObject.create({ firstName: 'Maria', lastName: 'Carré', isReferer: false });
          const members = [certifMember1];
          this.set('members', members);
          this.set('hasCleaHabilitation', true);

          // when
          const screen = await renderScreen(
            hbs`<MembersList @members={{this.members}} @hasCleaHabilitation={{this.hasCleaHabilitation}} />`
          );

          // then
          assert.dom(screen.queryByRole('cell', { name: this.intl.t('pages.team.pix-referer') })).doesNotExist();
        });
      });
    });

    module('when certification center is not habilitated CléA', function () {
      test('it should not show the referer column', async function (assert) {
        // given
        class FeatureTogglesStub extends Service {
          featureToggles = { isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled: true };
        }
        this.owner.register('service:featureToggles', FeatureTogglesStub);
        const certifMember1 = EmberObject.create({ firstName: 'Maria', lastName: 'Carré', isReferer: false });
        const members = [certifMember1];
        this.set('members', members);
        this.set('hasCleaHabilitation', false);

        // when
        const screen = await renderScreen(
          hbs`<MembersList @members={{this.members}} @hasCleaHabilitation={{this.hasCleaHabilitation}} />`
        );

        // then
        assert.dom(screen.queryByRole('columnheader', { name: this.intl.t('pages.team.referer') })).doesNotExist();
      });
    });
  });

  module('when FT_CLEA_RESULTS_RETRIEVAL_BY_HABILITATED_CERTIFICATION_CENTERS is not enabled', function () {
    test('it should not show the referer tag', async function (assert) {
      // given
      class FeatureTogglesStub extends Service {
        featureToggles = { isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled: false };
      }
      this.owner.register('service:featureToggles', FeatureTogglesStub);
      const certifMember1 = EmberObject.create({ firstName: 'Maria', lastName: 'Carré', isReferer: true });
      const members = [certifMember1];
      this.set('members', members);
      this.set('hasCleaHabilitation', true);

      // when
      const screen = await renderScreen(
        hbs`<MembersList @members={{this.members}} @hasCleaHabilitation={{this.hasCleaHabilitation}} />`
      );

      // then
      assert.dom(screen.queryByRole('cell', { name: this.intl.t('pages.team.pix-referer') })).doesNotExist();
    });
  });
});
