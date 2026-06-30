import { expect } from 'chai';
import sinon from 'sinon';

import { ClientApplicationsScript } from '../../../../src/identity-access-management/scripts/client-applications.js';
import { cryptoService } from '../../../../src/shared/domain/services/crypto-service.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';
import { domainBuilder } from '../../../tooling/domain-builder/domain-builder.js';

describe('ClientApplicationsScript', function () {
  describe('Options', function () {
    it('has the correct options', function () {
      const script = new ClientApplicationsScript();

      const { description, commands } = script.metaInfo;
      expect(description).to.equal('Manage client applications');

      expect(commands).to.deep.equal({
        list: {
          description: 'List client applications',
        },
        add: {
          description: 'Create client application',
          options: {
            clientId: {
              demandOption: true,
              description: 'Client ID',
              type: 'string',
            },
            clientSecret: {
              demandOption: true,
              description: 'Client secret',
              type: 'string',
            },
            jurisdiction: {
              default: null,
              demandOption: false,
              description:
                'Jurisdiction definition, currently, only an object like `{ "rules": [{ "name": "tags", "value": ["tag name"] }] }` is supported. \nThe juridiction restricts the data access to organizations tagged with specified "tag name".',
              type: 'object',
            },
            name: {
              demandOption: true,
              description: 'Client application name',
              type: 'string',
            },
            scope: {
              demandOption: true,
              description: 'Authorized scope (repeatable)',
              type: 'array',
            },
          },
        },
        remove: {
          description: 'Remove client application',
          options: {
            clientId: {
              demandOption: true,
              description: 'Client ID',
              type: 'string',
            },
          },
        },
        addScope: {
          description: 'Add one or more scopes to client application',
          options: {
            clientId: {
              demandOption: true,
              description: 'Client ID',
              type: 'string',
            },
            scope: {
              demandOption: true,
              description: 'Authorized scope (repeatable)',
              type: 'array',
            },
          },
        },
        removeScope: {
          description: 'Remove one or more scopes from client application',
          options: {
            clientId: {
              demandOption: true,
              description: 'Client ID',
              type: 'string',
            },
            scope: {
              demandOption: true,
              description: 'Authorized scope (repeatable)',
              type: 'array',
            },
          },
        },
        setClientSecret: {
          description: 'Set client secret of client application',
          options: {
            clientId: {
              demandOption: true,
              description: 'Client ID',
              type: 'string',
            },
            clientSecret: {
              demandOption: true,
              description: 'Client secret',
              type: 'string',
            },
          },
        },
        addJurisdictionTags: {
          description: 'Add one or more jurisdiction tag to client application',
          options: {
            clientId: {
              demandOption: true,
              description: 'Client ID',
              type: 'string',
            },
            tags: {
              demandOption: true,
              description: 'Jurisdiction tag (repeatable)',
              type: 'array',
            },
          },
        },
        removeJurisdictionTags: {
          description: 'Remove one or more jurisdiction tag from client application',
          options: {
            clientId: {
              demandOption: true,
              description: 'Client ID',
              type: 'string',
            },
            tags: {
              demandOption: true,
              description: 'Jurisdiction tag (repeatable)',
              type: 'array',
            },
          },
        },
      });
    });
  });

  describe('Handle', function () {
    let script;
    let logger;

    beforeEach(async function () {
      script = new ClientApplicationsScript();
      logger = { info: sinon.spy(), error: sinon.spy() };
      sinon.stub(cryptoService, 'hashPasswordSync').callsFake((a) => a);
      sinon.stub(cryptoService, 'hashPassword').callsFake((a) => Promise.resolve(a));
    });

    describe('list', function () {
      it('should list existing client applications', async function () {
        // given
        const consoleTableSpy = sinon.stub(console, 'table');
        const clientApp = domainBuilder.buildClientApplication();
        databaseBuilder.factory.buildClientApplication(clientApp);
        await databaseBuilder.commit();

        // when
        await script.handle({ command: 'list' });
        const { clientId, name, id, jurisdiction, scopes } = clientApp;

        // then
        expect(consoleTableSpy).calledOnce;
        expect(consoleTableSpy.firstCall.args).deep.equal([
          [
            {
              clientId,
              id,
              name,
              jurisdiction: JSON.stringify(jurisdiction),
              scopes,
            },
          ],
        ]);
      });
    });

    describe('add', function () {
      it('should add a client application in db', async function () {
        // given
        const clientApp = {
          name: 'app 1',
          clientSecret: 'secret',
          jurisdiction: { rules: [{ name: 'tags', value: ['test'] }] },
          clientId: 'app1',
          scopes: ['scopeA'],
        };

        // when
        await script.handle({
          logger,
          command: 'add',
          options: { ...clientApp, scope: clientApp.scopes, jurisdiction: JSON.stringify(clientApp.jurisdiction) },
        });

        // then
        const clientAppInDb = await knex('client_applications').first();
        expect(clientAppInDb).deep.contains(clientApp);
        expect(logger.info.calledOnce).true;
      });
    });

    describe('remove', function () {
      it('should remove a client application using its clientId', async function () {
        // given
        databaseBuilder.factory.buildClientApplication({
          id: 123,
          clientSecret: 'secret',
          scopes: ['scope1'],
          jurisdiction: JSON.stringify({ rules: [{ name: 'tags', value: ['test'] }] }),
          clientId: 'app1',
          name: 'app 1',
        });
        await databaseBuilder.commit();

        // when
        await script.handle({ command: 'remove', options: { clientId: 'app1' }, logger });

        //then
        const clientsAppInDb = await knex('client_applications');
        expect(clientsAppInDb).lengthOf(0);
      });
    });

    describe('scope', function () {
      it('add scope', async function () {
        // given
        databaseBuilder.factory.buildClientApplication({
          id: 123,
          clientSecret: 'secret',
          scopes: ['scope1'],
          jurisdiction: { rules: [{ name: 'tags', value: ['test'] }] },
          clientId: 'app1',
          name: 'app 1',
        });
        await databaseBuilder.commit();

        // when
        await script.handle({ command: 'addScope', options: { clientId: 'app1', scope: ['scope2'] }, logger });

        //then
        const clientAppInDb = await knex('client_applications').first();
        expect(clientAppInDb.scopes).deep.members(['scope1', 'scope2']);
      });
      it('remove scope', async function () {
        // given
        databaseBuilder.factory.buildClientApplication({
          id: 123,
          clientSecret: 'secret',
          scopes: ['scope1', 'scope2'],
          jurisdiction: { rules: [{ name: 'tags', value: ['test'] }] },
          clientId: 'app1',
          name: 'app 1',
        });
        await databaseBuilder.commit();

        // when
        await script.handle({ command: 'removeScope', options: { clientId: 'app1', scope: ['scope2'] }, logger });

        //then
        const clientAppInDb = await knex('client_applications').first();
        expect(clientAppInDb.scopes).deep.members(['scope1']);
      });
    });

    describe('setClientSecret', function () {
      it('add update client secret', async function () {
        // given
        databaseBuilder.factory.buildClientApplication({
          id: 123,
          clientSecret: 'secret',
          scopes: ['scope1'],
          jurisdiction: { rules: [{ name: 'tags', value: ['test'] }] },
          clientId: 'app1',
          name: 'app 1',
        });
        await databaseBuilder.commit();

        // when
        await script.handle({
          command: 'setClientSecret',
          options: { clientId: 'app1', clientSecret: 'new_secret' },
          logger,
        });

        //then
        const clientAppInDb = await knex('client_applications').first();
        expect(clientAppInDb.clientSecret).equal('new_secret');
      });
    });

    describe('jurisdiction', function () {
      describe('add jurisdiction tag', function () {
        it('should add jurisdictions to a clientId', async function () {
          // given
          databaseBuilder.factory.buildClientApplication({
            id: 123,
            clientSecret: 'secret',
            scopes: ['scope1'],
            jurisdiction: { rules: [{ name: 'tags', value: ['tag1'] }] },
            clientId: 'app1',
            name: 'app 1',
          });
          await databaseBuilder.commit();

          // when
          await script.handle({
            command: 'addJurisdictionTags',
            options: { clientId: 'app1', tags: ['tag2'] },
            logger,
          });

          //then
          const clientAppInDb = await knex('client_applications').first();
          expect(clientAppInDb.jurisdiction.rules).deep.members([{ name: 'tags', value: ['tag1', 'tag2'] }]);
        });
      });
      describe('remove jurisdiction tag', function () {
        it('should remove jurisdictions to a clientId', async function () {
          // given
          databaseBuilder.factory.buildClientApplication({
            id: 123,
            clientSecret: 'secret',
            scopes: ['scope1'],
            jurisdiction: { rules: [{ name: 'tags', value: ['tag1', 'tag2'] }] },
            clientId: 'app1',
            name: 'app 1',
          });
          await databaseBuilder.commit();

          // when
          await script.handle({
            command: 'removeJurisdictionTags',
            options: { clientId: 'app1', tags: ['tag1'] },
            logger,
          });

          //then
          const clientAppInDb = await knex('client_applications').first();
          expect(clientAppInDb.jurisdiction.rules).deep.members([{ name: 'tags', value: ['tag2'] }]);
        });
      });
    });
  });
});
