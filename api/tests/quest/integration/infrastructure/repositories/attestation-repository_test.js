import { Attestation } from '../../../../../src/quest/domain/models/profile/entities/Attestation.js';
import * as attestationRepository from '../../../../../src/quest/infrastructure/repositories/attestation-repository.js';
import { AttestationStorage } from '../../../../../src/quest/infrastructure/storage/attestation-storage.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/constants.js';
import { AlreadyExistingEntityError } from '../../../../../src/shared/domain/errors.js';
import { S3UploadError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { AttestationTemplateFixture } from '../../../../tooling/fixtures/index.js';
import { mockAttestationStorageUpload } from '../../../../tooling/mocks/attestation-storage.mock.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Quest | Integration | Repository | attestation', function () {
  describe('#save', function () {
    it('should upload attestation file and save attestation in db', async function () {
      const templateName = 'name';
      const templateKey = 'key';
      const templateFile = await AttestationTemplateFixture.getFile();
      const label = 'label';

      //when
      const storageMock = mockAttestationStorageUpload({ attestation: { templateName } });

      await attestationRepository.save({
        templateName,
        templateKey,
        templateFile,
        attestationStorage: AttestationStorage.createClient(),
        label,
      });

      // then
      const results = await knex('attestations');

      expect(storageMock.isDone()).to.be.true;
      expect(results.length).to.equal(1);
      expect(results[0].key).to.equal(templateKey);
      expect(results[0].templateName).to.equal(templateName);
      expect(results[0].label).to.equal(label);
    });

    it('should not save attestation in db if file upload failed', async function () {
      const templateName = 'name';
      const templateKey = 'key';
      const templateFile = await AttestationTemplateFixture.getFile();
      const label = 'label';

      //when
      const storageMock = mockAttestationStorageUpload({ attestation: { templateName }, isFailed: true });
      const error = await catchErr(attestationRepository.save)({
        templateName,
        templateKey,
        templateFile,
        label,
        attestationStorage: AttestationStorage.createClient(),
      });

      // then
      const results = await knex('attestations');

      expect(storageMock.isDone()).to.be.true;
      expect(results.length).to.equal(0);
      expect(error).to.be.instanceOf(S3UploadError);
    });

    it('should not save attestation in db if attestation exists', async function () {
      const templateName = 'name';
      const templateKey = 'key';
      const templateFile = await AttestationTemplateFixture.getFile();
      const label = 'label';

      databaseBuilder.factory.buildAttestation({ key: templateKey, templateName: 'anotherTemplateName', label });
      await databaseBuilder.commit();

      //when
      const error = await catchErr(attestationRepository.save)({
        templateName,
        templateKey,
        templateFile,
        label,
        attestationStorage: null,
      });

      // then
      const results = await knex('attestations');

      expect(results.length).to.equal(1);
      expect(results[0].templateName).to.equal('anotherTemplateName');
      expect(error).to.be.instanceOf(AlreadyExistingEntityError);
    });
  });
  describe('#getAllByOrganizationId', function () {
    it('should retrieve attestations by organization id', async function () {
      const attestation1 = databaseBuilder.factory.buildAttestation({
        key: 'key',
        templateName: 'templateName',
        label: 'label',
      });
      const attestation2 = databaseBuilder.factory.buildAttestation({
        key: 'key2',
        templateName: 'templateName2',
        label: 'label2',
      });
      databaseBuilder.factory.buildAttestation({
        key: 'key3',
        templateName: 'templateName3',
        label: 'label3',
      });

      const organization = databaseBuilder.factory.buildOrganization();
      const attestationFeature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.ATTESTATIONS_MANAGEMENT);
      databaseBuilder.factory.buildOrganizationFeature({
        organizationId: organization.id,
        featureId: attestationFeature.id,
        params: JSON.stringify(['key', 'key2']),
      });

      await databaseBuilder.commit();

      //when
      const results = await attestationRepository.getAllByOrganizationId({
        organizationId: organization.id,
      });

      //then

      expect(results).to.deep.equal([
        new Attestation({
          id: attestation1.id,
          key: attestation1.key,
          label: attestation1.label,
        }),
        new Attestation({
          id: attestation2.id,
          key: attestation2.key,
          label: attestation2.label,
        }),
      ]);
    });
  });
});
