import fs from 'node:fs';

import sinon from 'sinon';

import { UpdateTranslations } from '../../../scripts/update-translations.js';
import { expect } from '../../test-helper.js';

describe('unit | scripts | update-translations', function () {
  let script;
  let logger;

  beforeEach(function () {
    logger = { info: sinon.stub() };
    script = new UpdateTranslations();
  });

  describe('#checkExtension', function () {
    it('should return an error if source file is incorrect', function () {
      // given
      const sourceFile = 'test.txt';
      const targetFiles = ['test.json'];
      // when / then
      expect(() => script.checkExtension(sourceFile, targetFiles)).to.throw('The source file must be a JSON file');
    });

    it('should return an error if extension of any target files is incorrect', function () {
      // given
      const sourceFile = 'test.json';
      const targetFiles = ['test0.json', 'test.txt'];

      // when / then
      expect(() => script.checkExtension(sourceFile, targetFiles)).to.throw('All target files must be JSON files');
    });

    it('should return true if all files format is correct', function () {
      // given
      const sourceFile = 'test.json';
      const targetFiles = ['test0.json', 'test1.json'];

      // when
      const result = script.checkExtension(sourceFile, targetFiles);

      // then
      expect(result).to.be.true;
    });
  });

  describe('#readAndConvertFile', function () {
    beforeEach(function () {
      sinon.stub(fs.promises, 'readFile');
    });

    it('should return the json content', function () {
      // given
      const filePath = 'test.json';
      const fileContent = '{"key": "value"}';
      fs.promises.readFile.resolves(fileContent);

      // when
      const result = script.readAndConvertFile(filePath);

      // then
      return expect(result).to.eventually.deep.equal({ key: 'value' });
    });
  });

  describe('#writeFile', function () {
    beforeEach(function () {
      sinon.stub(fs.promises, 'writeFile');
    });

    it('should write in file', function () {
      // given
      const filePath = 'test.json';
      const content = { key: 'value' };

      // when
      script.writeFile(filePath, content);

      // then
      expect(fs.promises.writeFile).to.have.been.calledWith(filePath, JSON.stringify(content, null, 2));
    });
  });

  describe('#checkAndUpdate', function () {
    it('should not update if dryRun', function () {
      // given
      const baseLanguage = { key: 'value' };
      const targetLanguage = {};

      // when
      script.checkAndUpdate({ baseLanguage, targetLanguage, dryRun: true, logger });

      // then
      expect(targetLanguage).to.deep.equal({});
      expect(logger.info).to.have.been.calledWith('New key found: key');
    });

    it('should modify if not dryRun', function () {
      // given
      const baseLanguage = { key: 'value' };
      const targetLanguage = {};

      // when
      script.checkAndUpdate({ baseLanguage, targetLanguage, dryRun: false, logger });

      // then
      expect(targetLanguage).to.deep.equal({ key: '*value' });
      expect(logger.info).to.have.been.calledWith('New key found: key');
    });

    it('should modify with a complex object', function () {
      // given
      const baseLanguage = { key: { key1: 'value1' }, key2: 'value2' };
      const targetLanguage = { key: { key1: 'value1' } };

      // when
      script.checkAndUpdate({ baseLanguage, targetLanguage, dryRun: false, logger });

      // then
      expect(targetLanguage).to.deep.equal({ key: { key1: 'value1' }, key2: '*value2' });
      expect(logger.info).to.have.been.calledWith('New key found: key2');
    });
  });

  describe('#clearOldValues', function () {
    it('should not clear if dryRun', function () {
      // given
      const baseLanguage = { key: 'value' };
      const targetLanguage = { key: 'value', key2: 'value2' };

      // when
      script.clearOldValues({ baseLanguage, targetLanguage, dryRun: true, logger });

      // then
      expect(targetLanguage).to.deep.equal({ key: 'value', key2: 'value2' });
      expect(logger.info).to.have.been.calledWith('Old key found: key2');
    });

    it('should modify if not dryRun', function () {
      // given
      const baseLanguage = { key: 'value' };
      const targetLanguage = { key: 'value', key2: 'value2' };

      // when
      script.clearOldValues({ baseLanguage, targetLanguage, dryRun: false, logger });

      // then
      expect(targetLanguage).to.deep.equal({ key: 'value' });
    });
  });
});
