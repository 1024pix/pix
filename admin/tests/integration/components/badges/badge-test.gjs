import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, fillIn } from '@ember/test-helpers';
import Badge from 'pix-admin/components/badges/badge';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | badges/badge', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(async function () {
    const serviceRouter = this.owner.lookup('service:router');
    sinon.stub(serviceRouter, 'currentRouteName').value('authenticated.target-profiles.target-profile');
    sinon.stub(serviceRouter, 'currentRoute').value({ localName: 'badges' });
  });

  test('should render all details about the badge', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const badge = store.createRecord('badge', {
      id: '42',
      title: 'mon titre',
      message: 'mon message',
      imageUrl: 'data:,',
      key: 'ma clef',
      altMessage: 'mon message alternatif',
      isCertifiable: true,
      isAlwaysVisible: true,
      criteria: [],
    });
    const targetProfile = store.createRecord('target-profile', {
      id: '1',
      internalName: 'Profil cible',
    });

    // when
    const screen = await render(<template><Badge @badge={{badge}} @targetProfile={{targetProfile}} /></template>);

    // then
    assert.dom(screen.getAllByText(badge.id)[1]).exists();
    assert.dom(screen.getByText(badge.title)).exists();
    assert.dom(screen.getByText(badge.message)).exists();
    assert.dom(screen.getByText(badge.key)).exists();
    assert.dom(screen.getByText(badge.altMessage)).exists();
    assert.dom(screen.getByText(badge.imageUrl)).exists();
    assert.dom(screen.getByText('Certifiable')).exists();
    assert.dom(screen.getByText('Lacunes')).exists();
    assert.dom(screen.getByRole('presentation')).exists();
  });

  test('should render all criteria', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const targetProfile = store.createRecord('target-profile', {
      id: '1',
      internalName: 'Profil cible',
      areas: [],
    });
    const criterionCampaignParticipation = store.createRecord('badge-criterion', {
      id: '123',
      threshold: 25,
      scope: 'CampaignParticipation',
      cappedTubes: [],
    });
    const criterionCappedTubes = store.createRecord('badge-criterion', {
      id: '456',
      threshold: 95,
      scope: 'CappedTubes',
      cappedTubes: [],
    });
    const badge = store.createRecord('badge', {
      id: '42',
      title: 'mon titre',
      message: 'mon message',
      imageUrl: 'https://assets.pix.org/badges/new_badge.svg',
      key: 'ma clef',
      altMessage: 'mon message alternatif',
      isCertifiable: true,
      isAlwaysVisible: true,
      criteria: [criterionCampaignParticipation, criterionCappedTubes],
    });
    // when
    const screen = await render(<template><Badge @badge={{badge}} @targetProfile={{targetProfile}} /></template>);

    // then
    assert.deepEqual(
      screen.getByTestId('campaign-criterion-text').innerText,
      "L'évalué doit obtenir 25% sur l'ensemble des sujets du profil cible.",
    );
    assert.deepEqual(
      screen.getByTestId('toujourstriste').innerText,
      "L'évalué doit obtenir 95% sur tous les sujets plafonnés par niveau suivants :",
    );
  });

  test('should not display criterias sections if does not exists', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const targetProfile = store.createRecord('target-profile', {
      id: '1',
      internalName: 'Profil cible',
      areas: [],
    });

    const badge = store.createRecord('badge', {
      id: '42',
      title: 'mon titre',
      message: 'mon message',
      imageUrl: 'data:,',
      key: 'ma clef',
      altMessage: 'mon message alternatif',
      isCertifiable: true,
      isAlwaysVisible: true,
      criteria: [],
    });

    // when
    const screen = await render(<template><Badge @badge={{badge}} @targetProfile={{targetProfile}} /></template>);

    // then
    assert.dom(screen.queryByText("Critère d'obtention basé sur l'ensemble du profil cible&nbsp;:")).doesNotExist();
    assert
      .dom(
        screen.queryByText("Liste des critères d'obtention basés sur une sélection de sujets du profil cible&nbsp;:"),
      )
      .doesNotExist();
  });

  module('error cases', function () {
    module('when imageUrl format is incorrect', function () {
      test('should display an error', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const targetProfile = store.createRecord('target-profile', {
          id: '1',
          internalName: 'Profil cible',
          areas: [],
        });

        const badge = store.createRecord('badge', {
          id: '42',
          title: 'mon titre',
          message: 'mon message',
          imageUrl: 'data:,',
          key: 'ma clef',
          altMessage: 'mon message alternatif',
          isCertifiable: true,
          isAlwaysVisible: true,
          criteria: [],
        });
        const onUpdateBadgeStub = sinon
          .stub()
          .rejects({ errors: [{ status: '400', detail: 'data.attributes.image-url' }] });

        const notificationErrorStub = sinon.stub();
        class NotificationsStub extends Service {
          sendErrorNotification = notificationErrorStub;
        }
        this.owner.register('service:pixToast', NotificationsStub);

        // when
        const screen = await render(
          <template>
            <Badge @badge={{badge}} @targetProfile={{targetProfile}} @onUpdateBadge={{onUpdateBadgeStub}} />
          </template>,
        );
        await click(screen.getByRole('button', { name: 'Modifier les informations' }));
        await fillIn(
          screen.getByRole('textbox', {
            name: "Url de l'image (svg) *",
          }),
          'bonjour!',
        );
        await click(screen.getByRole('button', { name: 'Enregistrer' }));

        // then
        sinon.assert.calledWith(notificationErrorStub, {
          message: t('components.badges.api-error-messages.incorrect-image-url-format'),
        });
        assert.ok(true);
      });
    });
  });
});
