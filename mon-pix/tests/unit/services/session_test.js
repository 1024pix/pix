import { describe, it, beforeEach } from 'mocha';
import Service from '@ember/service';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Service | session', function() {
  setupTest();

  let sessionService;

  beforeEach(function() {
    sessionService = this.owner.lookup('service:session');
  });

  describe('#__handleLocale', function() {

    let intlSetLocaleStub;
    let momentSetLocaleStub;
    let intlStub;
    let momentStub;

    beforeEach(function() {
      intlSetLocaleStub = sinon.stub();
      momentSetLocaleStub = sinon.stub();

      intlStub = Service.create({
        setLocale: intlSetLocaleStub,
      });
      momentStub = Service.create({
        setLocale: momentSetLocaleStub,
      });

      sessionService.set('intl', intlStub);
      sessionService.set('moment', momentStub);
    });

    describe('when user is not connected', function() {

      describe('when domain is pix.org', function() {

        describe('when supplying locale in queryParam', function() {

          it('should update locale', async function() {
            // given
            const currentDomainStub = Service.create({
              getExtension() {
                return 'org';
              },
            });
            sessionService.set('currentDomain', currentDomainStub);

            // when
            await sessionService._loadCurrentUserAndSetLocale('en');

            // then
            sinon.assert.called(intlSetLocaleStub);
            sinon.assert.called(momentSetLocaleStub);
            sinon.assert.calledWith(intlSetLocaleStub, ['en', 'fr']);
            sinon.assert.calledWith(momentSetLocaleStub, 'en');
          });

          it('should ignore locale switch when is neither "fr" nor "en"', async function() {
            // given
            const currentDomainStub = Service.create({
              getExtension() {
                return 'org';
              },
            });
            sessionService.set('currentDomain', currentDomainStub);

            // when
            await sessionService._loadCurrentUserAndSetLocale('bouh');

            // then
            sinon.assert.called(intlSetLocaleStub);
            sinon.assert.called(momentSetLocaleStub);
            sinon.assert.calledWith(intlSetLocaleStub, ['bouh', 'fr']);
          });

        });

        describe('when supplying no locale in queryParam', function() {

          it('should set locale to default locale', async function() {
            // given
            const currentDomainStub = Service.create({
              getExtension() {
                return 'org';
              },
            });
            sessionService.set('currentDomain', currentDomainStub);

            // when
            await sessionService._loadCurrentUserAndSetLocale(undefined);

            // then
            sinon.assert.called(intlSetLocaleStub);
            sinon.assert.called(momentSetLocaleStub);
            sinon.assert.calledWith(intlSetLocaleStub, ['fr', 'fr']);
            sinon.assert.calledWith(momentSetLocaleStub, 'fr');
          });

        });

      });

      describe('when domain is pix.fr', function() {

        it('should keep locale in "fr"', async function() {
          // given
          const currentDomainStub = Service.create({
            getExtension() {
              return 'fr';
            },
          });
          sessionService.set('currentDomain', currentDomainStub);

          // when
          await sessionService._loadCurrentUserAndSetLocale('en');

          // then
          sinon.assert.called(intlSetLocaleStub);
          sinon.assert.called(momentSetLocaleStub);
          sinon.assert.calledWith(intlSetLocaleStub, ['fr', 'fr']);
          sinon.assert.calledWith(momentSetLocaleStub, 'fr');
        });
      });
    });

    describe('when user is connected', function() {

      describe('when domain is pix.org', function() {

        it('should set locale from user', async function() {
          // given
          const user = {
            lang: 'fr',
          };
          const load = sinon.stub().resolves(user);
          const currentUserStub = Service.create({ load, user });

          const currentDomainStub = Service.create({
            getExtension() {
              return 'org';
            },
          });

          sessionService.isAuthenticated = true;
          sessionService.set('currentUser', currentUserStub);
          sessionService.set('currentDomain', currentDomainStub);

          // when
          await sessionService._loadCurrentUserAndSetLocale();

          // then
          sinon.assert.called(intlSetLocaleStub);
          sinon.assert.called(momentSetLocaleStub);
          sinon.assert.calledWith(intlSetLocaleStub, ['fr', 'fr']);
          sinon.assert.calledWith(momentSetLocaleStub, 'fr');
        });

        describe('when user change locale', function() {

          it('should save user locale', async function() {
            // given
            const saveStub = sinon.stub().resolves();

            const user = {
              lang: 'fr',
              save: saveStub,
            };
            const loadStub = sinon.stub().resolves(user);
            const currentUserStub = Service.create({ load: loadStub, user });

            const currentDomainStub = Service.create({
              getExtension() {
                return 'org';
              },
            });
            sessionService.set('currentDomain', currentDomainStub);

            sessionService.isAuthenticated = true;
            sessionService.set('currentUser', currentUserStub);
            sessionService.set('currentDomain', currentDomainStub);

            // when
            await sessionService._loadCurrentUserAndSetLocale('en');

            // then
            sinon.assert.called(saveStub);
            sinon.assert.calledWith(saveStub, { adapterOptions: { lang: 'en' } });
          });

          it('should ignore locale switch when is neither "fr" nor "en"', async function() {
            // given
            const saveStub = sinon.stub().rejects({ errors: [{ status: '400' }] });
            const rollbackAttributesStub = sinon.stub().resolves();

            const user = {
              lang: 'fr',
              save: saveStub,
              rollbackAttributes: rollbackAttributesStub,
            };
            const loadStub = sinon.stub().resolves(user);
            const currentUserStub = Service.create({ load: loadStub, user });

            const currentDomainStub = Service.create({
              getExtension() {
                return 'org';
              },
            });

            sessionService.isAuthenticated = true;
            sessionService.set('currentUser', currentUserStub);
            sessionService.set('currentDomain', currentDomainStub);

            // when
            await sessionService._loadCurrentUserAndSetLocale('bouh');

            // then
            sinon.assert.called(rollbackAttributesStub);
          });
        });
      });

      describe('when domain is pix.fr', function() {

        it('should ignore locale from user', async function() {
          // given
          const user = {
            lang: 'en',
          };
          const load = sinon.stub().resolves(user);
          const currentUserStub = Service.create({ load, user });

          const currentDomainStub = Service.create({
            getExtension() {
              return 'fr';
            },
          });

          sessionService.isAuthenticated = true;
          sessionService.set('currentUser', currentUserStub);
          sessionService.set('currentDomain', currentDomainStub);

          // when
          await sessionService._loadCurrentUserAndSetLocale();

          // then
          sinon.assert.called(intlSetLocaleStub);
          sinon.assert.called(momentSetLocaleStub);
          sinon.assert.calledWith(intlSetLocaleStub, ['fr', 'fr']);
          sinon.assert.calledWith(momentSetLocaleStub, 'fr');
        });

        describe('when user change locale', function() {

          it('should not save user locale', async function() {
            // given
            const saveStub = sinon.stub().resolves();

            const user = {
              lang: 'fr',
              save: saveStub,
            };
            const loadStub = sinon.stub().resolves(user);
            const currentUserStub = Service.create({ load: loadStub, user });

            const currentDomainStub = Service.create({
              getExtension() {
                return 'fr';
              },
            });

            sessionService.isAuthenticated = true;
            sessionService.set('currentUser', currentUserStub);
            sessionService.set('currentDomain', currentDomainStub);

            // when
            await sessionService._loadCurrentUserAndSetLocale('en');

            // then
            sinon.assert.notCalled(saveStub);
          });
        });
      });
    });
  });
});
