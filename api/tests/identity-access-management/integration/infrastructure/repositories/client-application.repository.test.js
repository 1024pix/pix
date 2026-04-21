import Joi from 'joi';

import { clientApplicationRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/client-application.repository.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Identity Access Management | Infrastructure | Repository | client-application', function () {
  let application1;
  let application2;

  beforeEach(async function () {
    const createdAt = new Date('2025-03-26T13:18:20Z');

    application2 = databaseBuilder.factory.buildClientApplication({
      name: 'appli2',
      clientId: 'clientId-appli2',
      clientSecret: 'secret-app2',
      scopes: ['scope3', 'scope4', 'scope5'],
      createdAt,
      updatedAt: createdAt,
    });
    application1 = databaseBuilder.factory.buildClientApplication({
      name: 'appli1',
      clientId: 'clientId-appli1',
      clientSecret: 'secret-app1',
      scopes: ['scope1', 'scope2'],
      createdAt,
      updatedAt: createdAt,
    });

    await databaseBuilder.commit();
  });

  describe('#findByClientId', function () {
    context('when application clientId is not found', function () {
      it('should return undefined', async function () {
        // given
        const clientId = 'clientId-appli3';

        // when
        const application = await clientApplicationRepository.findByClientId(clientId);

        // then
        expect(application).to.be.undefined;
      });
    });

    context('when application clientId is found', function () {
      it('should return the application model', async function () {
        // given
        const clientId = 'clientId-appli2';

        // when
        const application = await clientApplicationRepository.findByClientId(clientId);

        // then
        expect(application).to.deepEqualInstance(domainBuilder.buildClientApplication(application2));
      });
    });
  });

  describe('#list', function () {
    it('should list all application ordered by name', async function () {
      // when
      const applications = await clientApplicationRepository.list();

      // then
      expect(applications).to.have.lengthOf(2);

      // eslint-disable-next-line no-unused-vars -- extract clientSecret so that it's not returned/displayed
      const { clientSecret: _1, ...application1WithoutClientSecret } =
        domainBuilder.buildClientApplication(application1);
      expect(applications[0]).to.deep.equal(application1WithoutClientSecret);

      // eslint-disable-next-line no-unused-vars -- extract clientSecret so that it's not returned/displayed
      const { clientSecret: _2, ...application2WithoutClientSecret } =
        domainBuilder.buildClientApplication(application2);
      expect(applications[1]).to.deep.equal(application2WithoutClientSecret);
    });
  });

  describe('#create', function () {
    it('should insert a new client application', async function () {
      // given
      const newApplication = {
        name: 'appli0',
        clientId: 'clientId-appli0',
        clientSecret: 'secret-app0',
        scopes: ['scope0'],
        jurisdiction: { rules: [{ name: 'tags', value: ['COLLEGE'] }] },
      };

      // when
      await clientApplicationRepository.create(newApplication);

      // then
      const applications = await knex.select().from('client_applications').orderBy('name');
      expect(applications).to.have.lengthOf(3);
      expect(applications[0]).to.deep.contain(newApplication);
      expect(applications[1]).to.deep.contain(application1);
      expect(applications[2]).to.deep.contain(application2);
    });

    it('should insert a new client application with no given jurisdiction', async function () {
      // given
      const newApplication = {
        name: 'appli0',
        clientId: 'clientId-appli0',
        clientSecret: 'secret-app0',
        scopes: ['scope0'],
        jurisdiction: null,
      };

      // when
      await clientApplicationRepository.create(newApplication);

      // then
      const applications = await knex.select().from('client_applications').orderBy('name');
      expect(applications).to.have.lengthOf(3);
      expect(applications[0]).to.deep.contain(newApplication);
      expect(applications[1]).to.deep.contain(application1);
      expect(applications[2]).to.deep.contain(application2);
    });

    it('should not insert a client application with invalid juridiction json format', async function () {
      // given
      const newApplication = {
        name: 'appli-with-invalid-jurisdiction',
        clientId: 'clientId-appli0',
        clientSecret: 'secret-app0',
        scopes: ['scope0'],
        jurisdiction: { rules: ['COLLEGE'] },
      };

      // when
      const error = await catchErr(clientApplicationRepository.create)(newApplication);

      // then
      expect(error).to.be.instanceOf(Joi.ValidationError);
      const clientApplications = await knex
        .select()
        .from('client_applications')
        .where('name', 'appli-with-invalid-jurisdiction');
      expect(clientApplications).to.be.empty;
    });
  });

  describe('#save', function () {
    it('should update client application', async function () {
      // given
      databaseBuilder.factory.buildClientApplication({
        clientId: 'app1',
        scopes: ['scope1'],
        jurisdiction: { rules: [{ name: 'tags', value: ['tag1'] }] },
      });
      await databaseBuilder.commit();
      const application = await clientApplicationRepository.findByClientId('app1');

      // when
      application.addScope('scope2');
      application.clientSecret = 'my-secret';
      application.addJurisdictionTag('my-tag');
      const updated = await clientApplicationRepository.save(application);

      // then
      expect(updated).true;

      const applicationInDb = await knex.select().from('client_applications').where({ clientId: 'app1' }).first();
      expect(applicationInDb.scopes).members(['scope1', 'scope2']);
      expect(applicationInDb.jurisdiction).deep.equal({ rules: [{ name: 'tags', value: ['tag1', 'my-tag'] }] });
      expect(applicationInDb.clientSecret).equal('my-secret');
    });
  });

  describe('#removeByClientId', function () {
    context('when application clientId is found', function () {
      it('should remove the corresponding application and return true', async function () {
        // given
        const clientId = application1.clientId;

        // when
        const removed = await clientApplicationRepository.removeByClientId(clientId);

        // then
        expect(removed).to.be.true;
        const applications = await knex.select().from('client_applications').orderBy('name');
        expect(applications).to.have.lengthOf(1);
        expect(applications[0]).to.deep.contain(application2);
      });
    });

    context('when application clientId is not found', function () {
      it('should return false', async function () {
        // given
        const clientId = 'not found';

        // when
        const removed = await clientApplicationRepository.removeByClientId(clientId);

        // then
        expect(removed).to.be.false;
        const applications = await knex.select().from('client_applications').orderBy('name');
        expect(applications).to.have.lengthOf(2);
        expect(applications[0]).to.deep.contain(application1);
        expect(applications[1]).to.deep.contain(application2);
      });
    });
  });
});
