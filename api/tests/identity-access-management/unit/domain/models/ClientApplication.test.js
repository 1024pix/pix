import { DeleteUnknownClientApplicationJurisdictionTagError } from '../../../../../src/identity-access-management/domain/errors.js';
import { ClientApplication } from '../../../../../src/identity-access-management/domain/models/ClientApplication.js';

import { buildClientApplication } from '../../../../tooling/domain-builder/factory/build-client-application.js';

describe('Unit | Identity Access Management | Domain | Model | ClientApplication', function () {
  describe('constructor', function () {
    it('should create a ClientApplication with correct parameters', function () {
      const data = {
        id: 123,
        name: 'App 1',
        clientId: 'appli1',
        clientSecret: '123',
        scopes: ['scope1'],
        jurisdiction: { rules: [{ name: 'tags', value: ['tag1 '] }] },
      };
      const clientApp = new ClientApplication(data);
      expect(clientApp).deep.contain(data);
      expect(clientApp.scopes).deep.members(data.scopes);
    });
    it('should create a ClientApplication with no jurisdiction', function () {
      const data = {
        id: 123,
        name: 'App 1',
        clientId: 'appli1',
        clientSecret: '123',
        scopes: ['scope1'],
        jurisdiction: null,
      };
      const clientApp = new ClientApplication(data);
      expect(clientApp).deep.equal(data);
    });
    it('should throw if jurisdiction rules are not valid', function () {
      const data = {
        id: 123,
        name: 'App 1',
        clientId: 'appli1',
        clientSecret: '123',
        scopes: ['scope1'],
        jurisdiction: {},
      };
      expect(() => new ClientApplication(data)).throw();
    });
  });

  context('scopes', function () {
    describe('addScope', function () {
      it('should add a scope', function () {
        const clientApp = buildClientApplication({ scopes: ['scope1'] });
        clientApp.addScope('scope2');
        expect(clientApp.scopes).members(['scope2', 'scope1']);
      });
      it('should not add a duplicate scope', function () {
        const clientApp = buildClientApplication({ scopes: ['scope1'] });
        clientApp.addScope('scope1');
        expect(clientApp.scopes).members(['scope1']);
      });
    });
    describe('removeScope', function () {
      it('should remove a scope', function () {
        const clientApp = buildClientApplication({ scopes: ['scope1', 'scope2'] });
        clientApp.removeScope('scope2');
        expect(clientApp.scopes).members(['scope1']);
      });
      it('should throw if scopes are empty', function () {
        const clientApp = buildClientApplication({ scopes: ['scope1'] });
        expect(() => clientApp.removeScope('scope1')).throw();
      });
    });
  });

  context('jurisdiction', function () {
    describe('addJurisdictionTag', function () {
      context('when there is no jurisdiction', function () {
        it('should add a jurisdiction tag rules', function () {
          const clientApp = buildClientApplication({ jurisdiction: null });
          clientApp.addJurisdictionTag('tag1');
          expect(clientApp.jurisdiction).deep.equal({
            rules: [{ name: 'tags', value: ['tag1'] }],
          });
        });
      });
      context('when there is already an existing tag rules', function () {
        it('should add a jurisdiction tag rules', function () {
          const clientApp = buildClientApplication({ jurisdiction: { rules: [{ name: 'tags', value: ['tag1'] }] } });

          clientApp.addJurisdictionTag('tag2');
          expect(clientApp.jurisdiction).deep.equal({
            rules: [{ name: 'tags', value: ['tag1', 'tag2'] }],
          });
        });
        it('should not duplicate and existing tag rules', function () {
          const clientApp = buildClientApplication({ jurisdiction: { rules: [{ name: 'tags', value: ['tag2'] }] } });

          clientApp.addJurisdictionTag('tag2');
          expect(clientApp.jurisdiction).deep.equal({
            rules: [{ name: 'tags', value: ['tag2'] }],
          });
        });
      });
    });
    describe('removeJurisdictionTag', function () {
      context('when there is no jurisdiction', function () {
        it('should throw', function () {
          const clientApp = buildClientApplication({ jurisdiction: null });

          expect(() => clientApp.removeJurisdictionTag('tag')).throw(
            DeleteUnknownClientApplicationJurisdictionTagError,
          );
        });
      });
      context('when jurisdiction tag not exists', function () {
        it('should throw', function () {
          const clientApp = buildClientApplication({ jurisdiction: { rules: [{ name: 'tags', value: ['test'] }] } });

          expect(() => clientApp.removeJurisdictionTag('tag')).throw(
            DeleteUnknownClientApplicationJurisdictionTagError,
          );
        });
      });
      context('when jurisdiction tag exists', function () {
        it('should remove jurisdiction tag', function () {
          const clientApp = buildClientApplication({
            jurisdiction: { rules: [{ name: 'tags', value: ['tag1', 'tag2'] }] },
          });

          clientApp.removeJurisdictionTag('tag1');
          expect(clientApp.jurisdiction.rules).deep.equal([{ name: 'tags', value: ['tag2'] }]);
        });
      });
      context('when jurisdiction tag exists and is the last tag', function () {
        it('remove rules and set jurisdiction to null', function () {
          const clientApp = buildClientApplication({
            jurisdiction: { rules: [{ name: 'tags', value: ['tag1'] }] },
          });

          clientApp.removeJurisdictionTag('tag1');
          expect(clientApp.jurisdiction).null;
        });
      });
      context('when jurisdiction tag exists and is the last tag and there is other info', function () {
        it('remove rules and set jurisdiction to null', function () {
          const clientApp = buildClientApplication({
            jurisdiction: { rules: [{ name: 'tags', value: ['tag1'] }], other: 'info' },
          });

          clientApp.removeJurisdictionTag('tag1');
          expect(clientApp.jurisdiction).deep.equal({ other: 'info' });
        });
      });
    });
  });
});
