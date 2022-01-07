import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { expect } from 'chai';
import { contains } from '../../../helpers/contains';
import Service from '@ember/service';

describe('Integration | Component | Certifications | CertificationEnder', function () {
  setupIntlRenderingTest();

  it('should display the translated labels', async function () {
    // when
    await render(hbs`
      <Certifications::CertificationEnder />
    `);

    // then
    expect(contains(this.intl.t('pages.certification-ender.candidate.title'))).to.exist;
  });

  it('should display the certification number', async function () {
    // given
    this.certificationNumber = 1234;

    // when
    await render(hbs`
      <Certifications::CertificationEnder @certificationNumber={{certificationNumber}} />
    `);

    // then
    expect(contains(1234)).to.exist;
  });

  it('should display the current user name', async function () {
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
    expect(contains('Jim Halpert')).to.exist;
  });
});
