import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | Campaigns | participation-row', function (hooks) {
  setupRenderingTest(hooks);

  module('Display information', function (hooks) {
    hooks.beforeEach(async function () {
      // given
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);
    });

    test('it should display names and createdAt', async function (assert) {
      // given
      const participation = EmberObject.create({
        firstName: 'Jean',
        lastName: 'Claude',
        userFullName: 'Jean-Claude Gangan',
        createdAt: new Date('2020-01-01'),
      });
      this.set('participation', participation);

      // when
      const screen = await render(hbs`<Campaigns::ParticipationRow @participation={{this.participation}} />`);

      // then
      assert.dom(screen.getByText('Jean Claude')).exists();
      assert.dom(screen.getByRole('link', { name: 'Jean-Claude Gangan' })).exists();
      assert.dom(screen.getByText('01/01/2020')).exists();
    });

    test('it should not display participantExternalId if idPixLabel is null', async function (assert) {
      // given
      const participation = EmberObject.create({
        participationExternalId: '123',
      });

      this.set('participation', participation);
      this.set('idPixLabel', null);

      // when
      const screen = await render(
        hbs`<Campaigns::ParticipationRow @participation={{this.participation}} @idPixLabel={{this.idPixLabel}} />`,
      );

      // then
      assert.dom(screen.queryByText('123')).doesNotExist();
    });

    test('it should display participantExternalId and a modification button if idPixLabel is set', async function (assert) {
      // given
      const participation = EmberObject.create({
        participantExternalId: '123',
      });
      this.set('participation', participation);
      this.set('idPixLabel', 'identifiant');

      // when
      const screen = await render(
        hbs`<Campaigns::ParticipationRow @participation={{this.participation}} @idPixLabel={{this.idPixLabel}} />`,
      );

      // then
      assert.dom(screen.getByText('123')).exists();
      assert.dom(screen.getByRole('button', { name: 'Modifier' })).exists();
    });

    test('it should display shared date if participation is shared', async function (assert) {
      // given
      const participation = EmberObject.create({
        sharedAt: new Date('2020-01-01'),
      });
      this.set('participation', participation);

      // when
      const screen = await render(hbs`<Campaigns::ParticipationRow @participation={{this.participation}} />`);

      // then
      assert.dom(screen.getByText('01/01/2020')).exists();
    });

    test('it should display deletedByFullName and deletedAt if participation is deleted', async function (assert) {
      // given
      const participation = EmberObject.create({
        deletedAt: new Date('2022-01-01'),
        deletedByFullName: 'le coupable',
      });
      this.set('participation', participation);

      // when
      const screen = await render(hbs`<Campaigns::ParticipationRow @participation={{this.participation}} />`);

      // then
      assert.dom(screen.getByText('01/01/2022 par')).exists();
      assert.dom(screen.getByRole('link', { name: 'le coupable' })).exists();
    });
  });

  module("when editing participant's external id", function (hooks) {
    hooks.beforeEach(async function () {
      // given
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);
      const participation = EmberObject.create({
        participantExternalId: '123',
      });
      this.participation = participation;
      this.idPixLabel = 'identifiant';
      this.updateParticipantExternalId = sinon.spy();
    });

    test('it should display save and cancel button', async function (assert) {
      // when
      const screen = await render(
        hbs`<Campaigns::ParticipationRow
  @participation={{this.participation}}
  @idPixLabel={{this.idPixLabel}}
  @updateParticipantExternalId={{this.updateParticipantExternalId}}
/>`,
      );
      await clickByName('Modifier');

      // then
      assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    });

    test('it should update participantExternalId on save', async function (assert) {
      // given
      const screen = await render(
        hbs`<Campaigns::ParticipationRow
  @participation={{this.participation}}
  @idPixLabel={{this.idPixLabel}}
  @updateParticipantExternalId={{this.updateParticipantExternalId}}
/>`,
      );
      await clickByName('Modifier');

      // when
      await fillByLabel("Modifier l'identifiant externe du participant", '4567890');
      await clickByName('Enregistrer');

      // then
      assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
      assert.strictEqual(this.participation.participantExternalId, '4567890');
      assert.ok(this.updateParticipantExternalId.called);
    });

    test('it should update participantExternalId with null if participantExternalId only  has blank space', async function (assert) {
      // given
      const screen = await render(
        hbs`<Campaigns::ParticipationRow
  @participation={{this.participation}}
  @idPixLabel={{this.idPixLabel}}
  @updateParticipantExternalId={{this.updateParticipantExternalId}}
/>`,
      );
      await clickByName('Modifier');

      // when
      await fillByLabel("Modifier l'identifiant externe du participant", '   ');
      await clickByName('Enregistrer');

      // then
      assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
      assert.strictEqual(this.participation.participantExternalId, null);
      assert.ok(this.updateParticipantExternalId.called);
    });

    test('it should update participantExternalId with null if participantExternalId is empty', async function (assert) {
      // given
      const screen = await render(
        hbs`<Campaigns::ParticipationRow
  @participation={{this.participation}}
  @idPixLabel={{this.idPixLabel}}
  @updateParticipantExternalId={{this.updateParticipantExternalId}}
/>`,
      );
      await clickByName('Modifier');

      // when
      await fillByLabel("Modifier l'identifiant externe du participant", '');
      await clickByName('Enregistrer');

      // then
      assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
      assert.strictEqual(this.participation.participantExternalId, null);
      assert.ok(this.updateParticipantExternalId.called);
    });

    test('it should not update participantExternalId on cancel', async function (assert) {
      // given
      const screen = await render(
        hbs`<Campaigns::ParticipationRow
  @participation={{this.participation}}
  @idPixLabel={{this.idPixLabel}}
  @updateParticipantExternalId={{this.updateParticipantExternalId}}
/>`,
      );
      await clickByName('Modifier');

      // when
      await fillByLabel("Modifier l'identifiant externe du participant", '4567890');
      await clickByName('Annuler');

      // then
      assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
      assert.strictEqual(this.participation.participantExternalId, '123');
      assert.notOk(this.updateParticipantExternalId.called);
    });
  });

  module('when user does not have access', function () {
    test("it should not allow to modify the participant's external ID", async function (assert) {
      // given
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = false;
      }
      this.owner.register('service:access-control', AccessControlStub);
      const participation = EmberObject.create({
        participantExternalId: '123',
      });
      this.set('participation', participation);
      this.set('idPixLabel', 'identifiant');

      //when
      const screen = await render(
        hbs`<Campaigns::ParticipationRow @participation={{this.participation}} @idPixLabel={{this.idPixLabel}} />`,
      );

      // expect
      assert.dom(screen.queryByRole('button', { name: 'Modifier' })).doesNotExist();
    });
  });
});
