import { module, test } from 'qunit';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | MembersList', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;
  let currentUser;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    currentUser = this.owner.lookup('service:current-user');
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('when there are members in certification center', function () {
    test('it displays column headers for last name, first name, role, actions and lists the team members', async function (assert) {
      // given
      const memberWithAdminRole = store.createRecord('member', {
        firstName: 'Satoru',
        lastName: 'Gojô',
        role: 'ADMIN',
      });
      const memberWithMemberRole = store.createRecord('member', {
        firstName: 'Itadori',
        lastName: 'Yuji',
        role: 'MEMBER',
      });
      const members = [memberWithAdminRole, memberWithMemberRole];

      sinon.stub(currentUser, 'certificationPointOfContact').value({ id: memberWithAdminRole.id });
      sinon.stub(currentUser, 'isAdminOfCurrentCertificationCenter').get(() => true);
      this.set('members', members);

      // when
      const screen = await renderScreen(hbs`<MembersList @members={{this.members}}/>`);

      // then
      assert.dom(screen.getByRole('columnheader', { name: this.intl.t('common.labels.candidate.lastname') })).exists();
      assert.dom(screen.getByRole('columnheader', { name: this.intl.t('common.labels.candidate.firstname') })).exists();
      assert.dom(screen.getByRole('columnheader', { name: this.intl.t('common.labels.candidate.role') })).exists();
      assert.dom(screen.getByRole('columnheader', { name: this.intl.t('pages.team.table-headers.actions') })).exists();
      assert.strictEqual(members.length, 2);
      assert.contains('Gojô');
      assert.contains('Itadori');
    });
  });

  module('when certification center is habilitated CléA', function () {
    test('it shows the referer column', async function (assert) {
      // given
      const certifMember1 = store.createRecord('member', { firstName: 'Maria', lastName: 'Carré', isReferer: false });
      const certifMember2 = store.createRecord('member', { firstName: 'John', lastName: 'Williams', isReferer: true });
      const members = [certifMember1, certifMember2];

      sinon.stub(currentUser, 'certificationPointOfContact').value({ id: certifMember1.id });
      this.set('members', members);
      this.set('hasCleaHabilitation', true);

      // when
      const screen = await renderScreen(
        hbs`<MembersList @members={{this.members}} @hasCleaHabilitation={{this.hasCleaHabilitation}} />`,
      );
      // then
      assert.dom(screen.getByRole('columnheader', { name: this.intl.t('pages.team.referer') })).exists();
    });
  });

  module('when a member is referer', function () {
    test('it shows the referer tag', async function (assert) {
      // given
      const certifMember1 = store.createRecord('member', { firstName: 'Maria', lastName: 'Carré', isReferer: false });
      const certifMember2 = store.createRecord('member', { firstName: 'John', lastName: 'Williams', isReferer: true });
      const members = [certifMember1, certifMember2];

      sinon.stub(currentUser, 'certificationPointOfContact').value({ id: certifMember1.id });
      this.set('members', members);
      this.set('hasCleaHabilitation', true);

      // when
      const screen = await renderScreen(
        hbs`<MembersList @members={{this.members}} @hasCleaHabilitation={{this.hasCleaHabilitation}} />`,
      );

      // then

      assert.dom(screen.getByRole('cell', { name: this.intl.t('pages.team.pix-referer') })).exists();
    });
  });

  module('when there is no referer', function () {
    test('it does not show the referer tag', async function (assert) {
      // given
      const certifMember1 = store.createRecord('member', { firstName: 'Maria', lastName: 'Carré', isReferer: false });
      const members = [certifMember1];

      sinon.stub(currentUser, 'certificationPointOfContact').value({ id: certifMember1.id });
      this.set('members', members);
      this.set('hasCleaHabilitation', true);

      // when
      const screen = await renderScreen(
        hbs`<MembersList @members={{this.members}} @hasCleaHabilitation={{this.hasCleaHabilitation}} />`,
      );

      // then
      assert.dom(screen.queryByRole('cell', { name: this.intl.t('pages.team.pix-referer') })).doesNotExist();
    });
  });

  module('when certification center is not habilitated CléA', function () {
    test('it does not show the referer column', async function (assert) {
      // given
      const certifMember1 = store.createRecord('member', { firstName: 'Maria', lastName: 'Carré', isReferer: false });
      const members = [certifMember1];

      sinon.stub(currentUser, 'certificationPointOfContact').value({ id: certifMember1.id });
      this.set('members', members);
      this.set('hasCleaHabilitation', false);

      // when
      const screen = await renderScreen(
        hbs`<MembersList @members={{this.members}} @hasCleaHabilitation={{this.hasCleaHabilitation}} />`,
      );

      // then
      assert.dom(screen.queryByRole('columnheader', { name: this.intl.t('pages.team.referer') })).doesNotExist();
    });
  });
});
