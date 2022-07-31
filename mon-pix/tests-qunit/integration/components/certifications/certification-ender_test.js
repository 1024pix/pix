import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { contains } from '../../../helpers/contains';
import Service from '@ember/service';

module('Integration | Component | Certifications | CertificationEnder', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display the translated labels', async function (assert) {
    // when
    await render(hbs`
      <Certifications::CertificationEnder />
    `);

    // then
    assert.dom(contains(this.intl.t('pages.certification-ender.candidate.title'))).exists();
  });

  test('should display the certification number', async function (assert) {
    // given
    this.certificationNumber = 1234;

    // when
    await render(hbs`
      <Certifications::CertificationEnder @certificationNumber={{certificationNumber}} />
    `);

    // then
    assert.dom(contains(1234)).exists();
  });

  test('should display the current user name', async function (assert) {
    // given
    class currentUser extends Service {
      user = {
        fullName: 'Jim Halpert',
      };
    }
    this.owner.register('service:currentUser', currentUser);

    // when
    await render(hbs`
      <Certifications::CertificationEnder @certificationNumber={{certificationNumber}} />
    `);

    // then
    assert.dom(contains('Jim Halpert')).exists();
  });

  module('when the assessment status is not ended by supervisor', function () {
    test('should not display the ended by supervisor text', async function (assert) {
      // given
      class currentUser extends Service {
        user = {
          fullName: 'Jim Halpert',
        };
      }
      this.owner.register('service:currentUser', currentUser);

      // when
      await render(hbs`
      <Certifications::CertificationEnder @certificationNumber={{certificationNumber}} @isEndedBySupervisor={{false}} />
    `);

      // then
      assert.dom(contains(this.intl.t('pages.certification-ender.candidate.ended-by-supervisor'))).doesNotExist();
    });
  });

  module('when the assessment status is ended by supervisor', function () {
    test('should display the ended by supervisor text', async function (assert) {
      // given
      class currentUser extends Service {
        user = {
          fullName: 'Jim Halpert',
        };
      }
      this.owner.register('service:currentUser', currentUser);

      // when
      await render(hbs`
      <Certifications::CertificationEnder @certificationNumber={{certificationNumber}} @isEndedBySupervisor={{true}} />
    `);

      // then
      assert.dom(contains(this.intl.t('pages.certification-ender.candidate.ended-by-supervisor'))).exists();
    });
  });

  module('when the assessment status is ended by finalization', function () {
    test('should display the ended by finalization text', async function (assert) {
      // given
      class currentUser extends Service {
        user = {
          fullName: 'Jim Halpert',
        };
      }
      this.owner.register('service:currentUser', currentUser);

      // when
      await render(hbs`
      <Certifications::CertificationEnder @certificationNumber={{certificationNumber}} @hasBeenEndedDueToFinalization={{true}} />
    `);

      // then
      assert.dom(contains(this.intl.t('pages.certification-ender.candidate.ended-due-to-finalization'))).exists();
    });
  });
});
