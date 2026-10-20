import fs, { createReadStream } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';

import { expect } from 'chai';
import sinon from 'sinon';

import { Attestation } from '../../../../../src/profile/domain/models/Attestation.js';
import {
  findAll,
  getByKey,
  getDataByKey,
} from '../../../../../src/profile/infrastructure/repositories/attestation-repository.js';
import { getDataBuffer } from '../../../../../src/shared/infrastructure/utils/buffer.js';
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
    const templateContent = 'fake pdf data';
    let attestation, attestationStorageStub, createReadStreamStub, writeFileStub, loggerStub, mkdirPath, filePath;

    // Lets the background cache write (writeFile().then/.catch) settle
    const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

    beforeEach(async function () {
      attestationStorageStub = {
        readFile: sinon.stub().callsFake(async () => ({ Body: Readable.from(Buffer.from(templateContent)) })),
      };
      createReadStreamStub = sinon.stub().returns(Symbol('cachedReadStream'));
      writeFileStub = sinon.stub().resolves();
      loggerStub = { warn: sinon.stub() };
      mkdirPath = '/cache-directory';

      attestation = databaseBuilder.factory.buildAttestation({ key: 'attest' });
      filePath = path.join(mkdirPath, `${attestation.templateName}.pdf`);
      await databaseBuilder.commit();
    });

    it('should return null when attestation does not exist', async function () {
      // when
      const result = await getDataByKey({
        key: 'BAD_KEY',
        attestationStorage: attestationStorageStub,
        cacheStatus: {},
      });

      // then
      expect(result).to.be.null;
      expect(attestationStorageStub.readFile).to.not.have.been.called;
    });

    describe('when file is already in cache', function () {
      it('should return a read stream of the cached file, without calling S3', async function () {
        // given
        const cacheStatus = { [attestation.key]: 'IN_CACHE' };

        // when
        const result = await getDataByKey({
          key: attestation.key,
          attestationStorage: attestationStorageStub,
          mkdirPath,
          cacheStatus,
          dependencies: { createReadStream: createReadStreamStub, writeFile: writeFileStub, logger: loggerStub },
        });

        // then
        expect(createReadStreamStub).to.have.been.calledOnceWithExactly(filePath);
        expect(result).to.equal(createReadStreamStub.firstCall.returnValue);
        expect(attestationStorageStub.readFile).to.not.have.been.called;
      });
    });

    describe('when file is being written in cache', function () {
      it('should return the file from S3, without writing it again', async function () {
        // given
        const cacheStatus = { [attestation.key]: 'WRITING' };

        // when
        const result = await getDataByKey({
          key: attestation.key,
          attestationStorage: attestationStorageStub,
          mkdirPath,
          cacheStatus,
          dependencies: { createReadStream: createReadStreamStub, writeFile: writeFileStub, logger: loggerStub },
        });

        // then
        expect((await getDataBuffer(result)).toString()).to.equal(templateContent);
        expect(writeFileStub).to.not.have.been.called;
        expect(cacheStatus[attestation.key]).to.equal('WRITING');
      });
    });

    describe('when file is not in cache', function () {
      [
        { description: 'cacheStatus is empty', initialCacheStatus: {} },
        { description: 'cacheStatus is NOT_IN_CACHE', initialCacheStatus: { attest: 'NOT_IN_CACHE' } },
      ].forEach(({ description, initialCacheStatus }) => {
        it(`when ${description}, should return the file from S3, write it in cache, then set cacheStatus to IN_CACHE`, async function () {
          // given
          const cacheStatus = { ...initialCacheStatus };

          // when
          const result = await getDataByKey({
            key: attestation.key,
            attestationStorage: attestationStorageStub,
            mkdirPath,
            cacheStatus,
            dependencies: { createReadStream: createReadStreamStub, writeFile: writeFileStub, logger: loggerStub },
          });

          // then
          expect(attestationStorageStub.readFile).to.have.been.calledOnceWithExactly({
            key: `${attestation.templateName}.pdf`,
          });
          expect((await getDataBuffer(result)).toString()).to.equal(templateContent);
          expect(writeFileStub).to.have.been.calledOnce;
          expect(writeFileStub.firstCall.args[0]).to.equal(filePath);
          expect(writeFileStub.firstCall.args[1].toString()).to.equal(templateContent);

          await flushPromises();
          expect(cacheStatus[attestation.key]).to.equal('IN_CACHE');
        });
      });

      it('should set cacheStatus to WRITING while the file is being written', async function () {
        // given
        const cacheStatus = {};
        writeFileStub.returns(new Promise(() => undefined)); // never resolves

        // when
        await getDataByKey({
          key: attestation.key,
          attestationStorage: attestationStorageStub,
          mkdirPath,
          cacheStatus,
          dependencies: { createReadStream: createReadStreamStub, writeFile: writeFileStub, logger: loggerStub },
        });

        // then
        expect(cacheStatus[attestation.key]).to.equal('WRITING');
      });

      it('should still return the file from S3, set cacheStatus to NOT_IN_CACHE and log a warning if writing in cache fails', async function () {
        // given
        const cacheStatus = {};
        writeFileStub.rejects(new Error('disk full'));

        // when
        const result = await getDataByKey({
          key: attestation.key,
          attestationStorage: attestationStorageStub,
          mkdirPath,
          cacheStatus,
          dependencies: { createReadStream: createReadStreamStub, writeFile: writeFileStub, logger: loggerStub },
        });

        // then
        expect((await getDataBuffer(result)).toString()).to.equal(templateContent);
        await flushPromises();
        expect(cacheStatus[attestation.key]).to.equal('NOT_IN_CACHE');
        expect(loggerStub.warn).to.have.been.calledOnce;
      });

      it('should set cacheStatus to NOT_IN_CACHE and throw if reading from S3 fails', async function () {
        // given
        const cacheStatus = {};
        const s3Error = new Error('S3 unavailable');
        attestationStorageStub.readFile.rejects(s3Error);

        // when
        const error = await getDataByKey({
          key: attestation.key,
          attestationStorage: attestationStorageStub,
          mkdirPath,
          cacheStatus,
          dependencies: { createReadStream: createReadStreamStub, writeFile: writeFileStub, logger: loggerStub },
        }).catch((err) => err);

        // then
        expect(error).to.equal(s3Error);
        expect(cacheStatus[attestation.key]).to.equal('NOT_IN_CACHE');
        expect(writeFileStub).to.not.have.been.called;
      });
    });

    describe('with the real file system', function () {
      let cacheDirectory;

      beforeEach(async function () {
        cacheDirectory = await fs.promises.mkdtemp(path.join(tmpdir(), 'attestation-templates-test-'));
      });

      afterEach(async function () {
        await fs.promises.rm(cacheDirectory, { recursive: true, force: true });
      });

      it('should write the file in cache, then read it from cache on the next call', async function () {
        // given
        const cacheStatus = {};
        let cacheWrite;
        const dependencies = {
          createReadStream,
          // real writeFile, but we keep its promise to wait for the background write to finish
          writeFile: (...args) => (cacheWrite = fs.promises.writeFile(...args)),
          logger: loggerStub,
        };

        // when
        const firstResult = await getDataByKey({
          key: attestation.key,
          attestationStorage: attestationStorageStub,
          mkdirPath: cacheDirectory,
          cacheStatus,
          dependencies,
        });
        await cacheWrite;
        const secondResult = await getDataByKey({
          key: attestation.key,
          attestationStorage: attestationStorageStub,
          mkdirPath: cacheDirectory,
          cacheStatus,
          dependencies,
        });

        // then
        const cachedFilePath = path.join(cacheDirectory, `${attestation.templateName}.pdf`);
        expect(await fs.promises.readFile(cachedFilePath, 'utf8')).to.equal(templateContent);
        expect(cacheStatus[attestation.key]).to.equal('IN_CACHE');
        expect((await getDataBuffer(firstResult)).toString()).to.equal(templateContent);
        expect((await getDataBuffer(secondResult)).toString()).to.equal(templateContent);
        expect(attestationStorageStub.readFile).to.have.been.calledOnce;
      });
    });
  });
});
