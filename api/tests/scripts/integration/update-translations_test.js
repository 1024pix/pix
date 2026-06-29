import fs from 'node:fs';

import sinon from 'sinon';

import { UpdateTranslations } from '../../../scripts/update-translations.js';
import { expect } from '../../test-helper.js';

describe('integration | scripts | update-translations', function () {
  let script;
  let logger;

  beforeEach(function () {
    logger = { info: sinon.stub() };
    script = new UpdateTranslations();
    sinon.stub(fs.promises, 'writeFile');
    sinon.stub(fs.promises, 'readFile');
  });

  describe('#handle', function () {
    context('when a file is not a json', function () {
      it('should return an error if source is not a json', function () {
        // given
        const source = 'source';
        const target = ['target.json'];

        // when
        const result = script.handle(source, target, logger);

        // then
        expect(result).to.be.rejectedWith('The source file must be a JSON file');
      });

      it('should return an error if one target file is not a json', function () {
        // given
        const source = 'source.json';
        const target = ['target1'];

        // when
        const result = script.handle(source, target, logger);

        // then
        expect(result).to.be.rejectedWith('The target file must be a JSON file');
      });
    });

    describe('dryRun mode', function () {
      it('should display translations informations', async function () {
        // given
        const source = 'source.json';
        const targets = ['target.json'];
        fs.promises.readFile.withArgs(source).resolves('{"key": "value", "key2": "value2"}');
        fs.promises.readFile.withArgs(targets[0]).resolves('{"key": "value"}');

        // when
        await script.handle({ options: { source, targets, dryRun: true }, logger });

        // then
        expect(logger.info).to.have.been.calledWith('New key found: key2');
        expect(logger.info).to.have.been.calledWith(
          'Done with 1 new key found, 0 written, 0 old translation and 0 deleted.',
        );
      });
    });

    describe('without dryRun', function () {
      it('should actualize translations', async function () {
        // given
        const source = 'source.json';
        const targets = ['target1.json', 'target2.json'];
        const sourceTranslation = {
          key: 'value',
          key2: 'value2',
          object: { subkey1: 'subvalue1', subkey2: 'subvalue2' },
        };
        const targetTranslation1 = {
          key: 'value',
          object: { subkey1: 'subvalue1', subkey2: 'subvalue2' },
        };
        const expectedTranslation1 = {
          key: 'value',
          object: { subkey1: 'subvalue1', subkey2: 'subvalue2' },
          key2: '*value2',
        };
        const targetTranslation2 = { key: 'value', key3: 'value3', object: { subkey1: 'subvalue1' } };
        const expectedTranslation2 = {
          key: 'value',
          object: { subkey1: 'subvalue1', subkey2: '*subvalue2' },
          key2: '*value2',
        };
        fs.promises.readFile.withArgs(source).resolves(JSON.stringify(sourceTranslation));
        fs.promises.readFile.withArgs(targets[0]).resolves(JSON.stringify(targetTranslation1));
        fs.promises.readFile.withArgs(targets[1]).resolves(JSON.stringify(targetTranslation2));
        fs.promises.writeFile.withArgs(targets[0], expectedTranslation1).resolves();
        fs.promises.writeFile.withArgs(targets[1], expectedTranslation2).resolves();

        // when
        await script.handle({ options: { source, targets, dryRun: false }, logger });

        // then
        const expectedLogs = [
          'Runs on target1.json',
          'New key found: key2',
          'Done with 1 new key found, 1 written, 0 old translation and 0 deleted.',
          'Runs on target2.json',
          'New key found: key2',
          'New key found: subkey2',
          'Old key found: key3',
          'Done with 2 new key found, 2 written, 1 old translation and 1 deleted.',
        ];
        expect(logger.info).to.have.callCount(expectedLogs.length);
        expectedLogs.forEach((log, index) => {
          expect(logger.info.getCall(index)).to.have.been.calledWith(log);
        });
        expect(fs.promises.writeFile).to.have.callCount(2);
        expect(fs.promises.writeFile).to.have.been.calledWith(
          targets[0],
          JSON.stringify(expectedTranslation1, null, 2),
        );
        expect(fs.promises.writeFile).to.have.been.calledWith(
          targets[1],
          JSON.stringify(expectedTranslation2, null, 2),
        );
      });
    });
  });
});
