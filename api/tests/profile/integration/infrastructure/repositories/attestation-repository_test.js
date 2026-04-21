import sinon from 'sinon';

import { Attestation } from '../../../../../src/profile/domain/models/Attestation.js';
import {
  findAll,
  getByKey,
  getDataByKey,
} from '../../../../../src/profile/infrastructure/repositories/attestation-repository.js';

import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Profile | Integration | Infrastructure | Repository | Attestation', function () {
  describe('#findAll', function () {
    it('should return all attestations', async function () {
      // given
      databaseBuilder.factory.buildAttestation({ key: 'PARENTHOOD', label: 'Parentalité' });
      databaseBuilder.factory.buildAttestation({ key: 'SIXTH_GRADE', label: '6ème' });
      await databaseBuilder.commit();

      // when
      const result = await findAll();

      // then
      expect(result).to.have.lengthOf(2);
      expect(result[0]).to.be.an.instanceof(Attestation);
      expect(result.map((a) => a.key)).to.include.members(['PARENTHOOD', 'SIXTH_GRADE']);
      expect(result.map((a) => a.label)).to.include.members(['Parentalité', '6ème']);
    });

    it('should return an empty array when there are no attestations', async function () {
      // when
      const result = await findAll();

      // then
      expect(result).to.deep.equal([]);
    });
  });

  describe('#getByKey', function () {
    it('should return attestation informations for given key', async function () {
      // given
      const templateName = 'Velodrome';
      const attestation = databaseBuilder.factory.buildAttestation({ templateName });
      await databaseBuilder.commit();

      // when
      const result = await getByKey({ attestationKey: attestation.key });

      // then

      expect(result).to.be.an.instanceof(Attestation);
      expect(result).to.deep.equal(attestation);
    });

    it('should return null if no attestation exist for given key', async function () {
      // given&when
      const result = await getByKey({ attestationKey: 'BAD_KEY' });

      // then
      expect(result).to.be.null;
    });
  });

  describe('#getDataByKey', function () {
    it('should return attestation data as stream for given key', async function () {
      // given
      const templateName = 'Parc des Princes';
      const attestation = databaseBuilder.factory.buildAttestation({ templateName });
      await databaseBuilder.commit();

      const fakeData = Symbol('fakeData');
      const attestationStorage = { readFile: sinon.stub().resolves({ Body: fakeData }) };

      // when
      const result = await getDataByKey({ key: attestation.key, attestationStorage });

      // then

      expect(result).to.equal(fakeData);
    });

    it('should return null if no attestation exist for given key', async function () {
      // given&when
      const result = await getDataByKey({ key: 'BAD_KEY' });

      // then
      expect(result).to.be.null;
    });
  });
});
