import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | users | user-detail-personal-information/campaign-participation', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display a list of participations', async function (assert) {
    // given
    const participation1 = EmberObject.create({
      campaignCode: 'SOMECODE',
    });
    const participation2 = EmberObject.create({
      campaignCode: 'SOMEOTHERCODE',
    });
    const participations = [participation1, participation2];
    this.set('participations', participations);

    // when
    const screen = await render(
      hbs`<Users::UserDetailPersonalInformation::CampaignParticipations @participations={{participations}}/>`
    );

    // then
    assert.strictEqual(screen.getAllByLabelText('Participation').length, 2);
  });

  test('it should display an empty table when no participations', async function (assert) {
    // given
    const participations = [];
    this.set('participations', participations);

    // when
    const screen = await render(
      hbs`<Users::UserDetailPersonalInformation::CampaignParticipations @participations={{participations}}/>`
    );

    // then
    assert.dom(screen.getByText('Aucune participation')).exists();
  });

  test('it should display campaign information', async function (assert) {
    // given
    const participation = EmberObject.create({
      campaignCode: 'SOMECODE',
      campaignId: 1,
    });
    this.set('participations', [participation]);

    // when
    const screen = await render(
      hbs`<Users::UserDetailPersonalInformation::CampaignParticipations @participations={{participations}}/>`
    );

    // then
    assert.dom(screen.getByText('SOMECODE')).exists();
    assert.dom(screen.getByRole('link', { name: 'SOMECODE' })).exists();
  });

  test('it should display orgnaization learner information', async function (assert) {
    // given
    const participation = EmberObject.create({
      organizationLearnerFullName: 'Un nom bien long',
    });
    this.set('participations', [participation]);

    // when
    const screen = await render(
      hbs`<Users::UserDetailPersonalInformation::CampaignParticipations @participations={{participations}}/>`
    );

    // then
    assert.dom(screen.getByText('Un nom bien long')).exists();
  });

  test('it should display participation information', async function (assert) {
    // given
    const participation = EmberObject.create({
      participantExternalId: 'Some external id',
      createdAt: new Date('2020-01-01'),
      displayedStatus: 'Envoyé',
    });
    this.set('participations', [participation]);

    // when
    const screen = await render(
      hbs`<Users::UserDetailPersonalInformation::CampaignParticipations @participations={{participations}}/>`
    );

    // then
    assert.dom(screen.getByText('Some external id')).exists();
    assert.dom(screen.getByText('01/01/2020')).exists();
    assert.dom(screen.getByText('Envoyé')).exists();
  });

  test('it should display shared date if participation is shared', async function (assert) {
    // given
    const participation = EmberObject.create({
      sharedAt: new Date('2020-01-01'),
    });
    this.set('participations', [participation]);

    // when
    const screen = await render(
      hbs`<Users::UserDetailPersonalInformation::CampaignParticipations @participations={{participations}}/>`
    );

    // then
    assert.dom(screen.getByText('01/01/2020')).exists();
  });

  test('it should display deletedByFullName and deletedAt if participation is deleted', async function (assert) {
    // given
    const participation = EmberObject.create({
      deletedAt: new Date('2022-01-01'),
      deletedByFullName: 'le coupable',
    });
    this.set('participations', [participation]);

    // when
    const screen = await render(
      hbs`<Users::UserDetailPersonalInformation::CampaignParticipations @participations={{participations}}/>`
    );

    // then
    assert.dom(screen.getByText('01/01/2022 par')).exists();
    assert.dom(screen.getByRole('link', { name: 'le coupable' })).exists();
  });
});
