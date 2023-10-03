import { module, test } from 'qunit';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | MembersList', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when there are members in certification center', function () {
    test('it displays column headers and lists the team members', async function (assert) {
      // given
      const adminMembership = EmberObject.create({ firstName: 'Satoru', lastName: 'Gojô', role: 'ADMIN' });
      const memberMembership = EmberObject.create({ firstName: 'Itadori', lastName: 'Yuji', role: 'MEMBER' });
      const members = [adminMembership, memberMembership];
      this.set('members', members);

      // when
      const screen = await renderScreen(
        hbs`<MembersList @members={{this.members}} @hasCleaHabilitation={{this.hasCleaHabilitation}} />`,
      );

      // then
      assert.dom(screen.getByRole('columnheader', { name: 'Nom' })).exists();
      assert.dom(screen.getByRole('columnheader', { name: 'Prénom' })).exists();
      assert.strictEqual(members.length, 2);
      assert.contains('Gojô');
      assert.contains('Itadori');
    });
  });

  module('when certification center is habilitated CléA', function () {
    test('it shows the referer column', async function (assert) {
      // given
      const certifMember1 = EmberObject.create({ firstName: 'Maria', lastName: 'Carré', isReferer: false });
      const certifMember2 = EmberObject.create({ firstName: 'John', lastName: 'Williams', isReferer: true });
      const members = [certifMember1, certifMember2];
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
      const certifMember1 = EmberObject.create({ firstName: 'Maria', lastName: 'Carré', isReferer: false });
      const certifMember2 = EmberObject.create({ firstName: 'John', lastName: 'Williams', isReferer: true });
      const members = [certifMember1, certifMember2];
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
      const certifMember1 = EmberObject.create({ firstName: 'Maria', lastName: 'Carré', isReferer: false });
      const members = [certifMember1];
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
      const certifMember1 = EmberObject.create({ firstName: 'Maria', lastName: 'Carré', isReferer: false });
      const members = [certifMember1];
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
