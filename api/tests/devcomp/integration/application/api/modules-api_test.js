import nock from 'nock';
import sinon from 'sinon';

import { Module } from '../../../../../src/devcomp/application/api/models/Module.js';
import { ModuleStatus } from '../../../../../src/devcomp/application/api/models/ModuleStatus.js';
import * as modulesApi from '../../../../../src/devcomp/application/api/modules-api.js';
import { DomainError } from '../../../../../src/shared/domain/errors.js';

import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Devcomp | Application | Api | Modules', function () {
  let clock, now;

  beforeEach(function () {
    now = new Date('2023-10-05T18:02:00Z');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#getModulesByIds', function () {
    it('should return a list of Module', async function () {
      // given
      nock('https://assets.pix.org').persist().head(/^.+$/).reply(200, {});
      const existingModuleId1 = '6282925d-4775-4bca-b513-4c3009ec5886';
      const existingModuleId2 = 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d';
      const moduleIds = [existingModuleId1, existingModuleId2];

      // when
      const result = await modulesApi.getModulesByIds({ moduleIds });

      // then
      const expectedResult = [
        {
          id: existingModuleId1,
          shortId: '6a68bf32',
          slug: 'bac-a-sable',
          title: 'Bac à sable',
          duration: 5,
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
        },
        {
          id: existingModuleId2,
          shortId: '9d4dcab8',
          slug: 'bien-ecrire-son-adresse-mail',
          title: 'Bien écrire une adresse mail',
          duration: 10,
          image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
        },
      ];

      expect(result).deep.equal(expectedResult);
      expect(result[0]).instanceOf(Module);
    });

    context('if moduleIds is not an array', function () {
      it('should return an empty array with null value', async function () {
        // given
        const moduleIds = null;

        // when
        const result = await modulesApi.getModulesByIds({ moduleIds });

        // then
        expect(result).empty;
      });

      it('should return an empty array with undefined value', async function () {
        // given
        const moduleIds = undefined;

        // when
        const result = await modulesApi.getModulesByIds({ moduleIds });

        // then
        expect(result).empty;
      });

      it('should return an empty array with not an array', async function () {
        // given
        const moduleIds = {};

        // when
        const result = await modulesApi.getModulesByIds({ moduleIds });

        // then
        expect(result).empty;
      });

      it('should return an empty array with an empty array', async function () {
        // given
        const moduleIds = {};

        // when
        const result = await modulesApi.getModulesByIds({ moduleIds });

        // then
        expect(result).empty;
      });
    });
  });

  describe('#getUserModuleStatuses', function () {
    it('should return a list of Module statuses', async function () {
      // given
      nock('https://assets.pix.org').persist().head(/^.+$/).reply(200, {});
      const { id: userId } = databaseBuilder.factory.buildUser();
      const existingModuleIdWithoutRelatedPassage = '6282925d-4775-4bca-b513-4c3009ec5886';
      const existingModuleId2 = 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d';
      const existingModuleId3 = '5df14039-803b-4db4-9778-67e4b84afbbd';
      const moduleIds = [existingModuleIdWithoutRelatedPassage, existingModuleId2, existingModuleId3];

      databaseBuilder.factory.buildPassage({
        moduleId: existingModuleId2,
        userId,
        terminatedAt: null,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-02-01'),
      });

      databaseBuilder.factory.buildPassage({
        moduleId: existingModuleId3,
        userId,
        terminatedAt: now,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-02-01'),
      });

      await databaseBuilder.commit();

      // when
      const result = await modulesApi.getUserModuleStatuses({ userId, moduleIds });

      // then
      const expectedResult = [
        {
          id: existingModuleIdWithoutRelatedPassage,
          shortId: '6a68bf32',
          slug: 'bac-a-sable',
          title: 'Bac à sable',
          duration: 5,
          status: 'NOT_STARTED',
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
          createdAt: now,
          updatedAt: now,
          terminatedAt: null,
        },
        {
          id: existingModuleId2,
          shortId: '9d4dcab8',
          slug: 'bien-ecrire-son-adresse-mail',
          title: 'Bien écrire une adresse mail',
          duration: 10,
          status: 'IN_PROGRESS',
          image: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-details.svg',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-02-01'),
          terminatedAt: null,
        },
        {
          id: existingModuleId3,
          shortId: 'ecc13f55',
          slug: 'adresse-ip-publique-et-vous',
          title: "L'adresse IP publique : ce qu'elle révèle sur vous !",
          duration: 10,
          status: 'COMPLETED',
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
          terminatedAt: now,
          createdAt: new Date('2020-01-01'),
          updatedAt: new Date('2020-02-01'),
        },
      ];

      expect(result).to.deep.equal(expectedResult);
      expect(result[0]).instanceOf(ModuleStatus);
    });

    context('if userId passed is not defined', function () {
      it('should throw a DomainError error', async function () {
        // given
        const existingModuleIdWithoutRelatedPassage = '6282925d-4775-4bca-b513-4c3009ec5886';
        const existingModuleId2 = 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d';
        const existingModuleId3 = '5df14039-803b-4db4-9778-67e4b84afbbd';
        const moduleIds = [existingModuleIdWithoutRelatedPassage, existingModuleId2, existingModuleId3];

        // when
        const error = await catchErr(modulesApi.getUserModuleStatuses)({ moduleIds });

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('The userId is required');
      });
    });

    context('if moduleIds is empty', function () {
      it('should return an empty array', async function () {
        // given
        const userId = '1';
        const moduleIds = [];

        // when
        const result = await modulesApi.getUserModuleStatuses({ userId, moduleIds });

        // then
        expect(result).to.be.empty;
      });
    });
  });

  describe('#getModulesByShortIds', function () {
    it('should return a list of Modules', async function () {
      // given
      nock('https://assets.pix.org').persist().head(/^.+$/).reply(200, {});
      const existingModuleShortId1 = 'ecc13f55';
      const existingModuleShortId2 = 'e074af34';
      const moduleShortIds = [existingModuleShortId1, existingModuleShortId2];

      // when
      const result = await modulesApi.getModulesByShortIds({ moduleShortIds });

      // then
      // then
      const expectedResult = [
        {
          duration: 10,
          id: '5df14039-803b-4db4-9778-67e4b84afbbd',
          shortId: existingModuleShortId1,
          slug: 'adresse-ip-publique-et-vous',
          title: "L'adresse IP publique : ce qu'elle révèle sur vous !",
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
        },
        {
          id: '9beb922f-4d8e-495d-9c85-0e7265ca78d6',
          shortId: existingModuleShortId2,
          slug: 'au-dela-des-mots-de-passe',
          title: 'Au-delà des mots de passe : comment s’authentifier ?',
          duration: 5,
          image: 'https://assets.pix.org/modules/placeholder-details.svg',
        },
      ];

      expect(result).deep.equal(expectedResult);
      expect(result[0]).instanceOf(Module);
    });
  });
});
