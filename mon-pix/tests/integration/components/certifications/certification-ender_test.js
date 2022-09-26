import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { expect } from 'chai';
import Service from '@ember/service';

describe('Integration | Component | Certifications | CertificationEnder', function () {
  setupIntlRenderingTest();

  it('should display the translated labels', async function () {
    // when
    const screen = await renderScreen(hbs`
      <Certifications::CertificationEnder />
    `);

    // then
    expect(screen.getByText(this.intl.t('pages.certification-ender.candidate.title'))).to.exist;
  });

  it('should display the certification number', async function () {
    // given
    this.certificationNumber = 1234;

    // when
    const screen = await renderScreen(hbs`
      <Certifications::CertificationEnder @certificationNumber={{certificationNumber}} />
    `);

    // then
    expect(screen.getByText(1234)).to.exist;
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
    const screen = await renderScreen(hbs`
      <Certifications::CertificationEnder @certificationNumber={{certificationNumber}} />
    `);

    // then
    expect(screen.getByText('Jim Halpert')).to.exist;
  });

  it('should display the remote certification logout message', async function () {
    // when
    const screen = await renderScreen(hbs`
      <Certifications::CertificationEnder @certificationNumber={{certificationNumber}} />
    `);

    // then
    expect(screen.getByText(this.intl.t('pages.certification-ender.candidate.remote-certification'))).to.exist;
  });

  context('when the assessment status is not ended by supervisor', function () {
    it('should not display the ended by supervisor text', async function () {
      // given
      class currentUser extends Service {
        user = {
          fullName: 'Jim Halpert',
        };
      }
      this.owner.register('service:currentUser', currentUser);

      // when
      const screen = await renderScreen(hbs`
      <Certifications::CertificationEnder @certificationNumber={{certificationNumber}} @isEndedBySupervisor={{false}} />
    `);

      // then
      expect(screen.queryByText(this.intl.t('pages.certification-ender.candidate.ended-by-supervisor'))).not.to.exist;
    });
  });

  context('when the assessment status is ended by supervisor', function () {
    it('should display the ended by supervisor text', async function () {
      // given
      class currentUser extends Service {
        user = {
          fullName: 'Jim Halpert',
        };
      }
      this.owner.register('service:currentUser', currentUser);

      // when
      const screen = await renderScreen(hbs`
      <Certifications::CertificationEnder @certificationNumber={{certificationNumber}} @isEndedBySupervisor={{true}} />
    `);

      // then
      expect(screen.getByText(this.intl.t('pages.certification-ender.candidate.ended-by-supervisor'))).to.exist;
    });
  });

  context('when the assessment status is ended by finalization', function () {
    it('should display the ended by finalization text', async function () {
      // given
      class currentUser extends Service {
        user = {
          fullName: 'Jim Halpert',
        };
      }
      this.owner.register('service:currentUser', currentUser);

      // when
      const screen = await renderScreen(hbs`
      <Certifications::CertificationEnder @certificationNumber={{certificationNumber}} @hasBeenEndedDueToFinalization={{true}} />
    `);

      // then
      expect(screen.getByText(this.intl.t('pages.certification-ender.candidate.ended-due-to-finalization'))).to.exist;
    });
  });
});
