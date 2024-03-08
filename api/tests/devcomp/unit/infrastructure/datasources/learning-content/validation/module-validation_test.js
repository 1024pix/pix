import { getImageSample } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/image.sample.js';
import { getQcmSample } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/qcm.sample.js';
import { getQcuSample } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/qcu.sample.js';
import { getQrocmSample } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/qrocm.sample.js';
import { getTextSample } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/text.sample.js';
import { getVideoSample } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/video.sample.js';
import { expect } from '../../../../../../test-helper.js';
import {
  imageElementSchema,
  qcmElementSchema,
  qcuElementSchema,
  qrocmElementSchema,
  textElementSchema,
  videoElementSchema,
} from './element/index.js';
import { joiErrorParser } from './joi-error-parser.js';

describe('Unit | Infrastructure | Datasources | Learning Content | Module Datasource | format validation', function () {
  it('should validate sample image structure', async function () {
    try {
      await imageElementSchema.validateAsync(getImageSample(), { abortEarly: false });
    } catch (joiError) {
      const formattedError = joiErrorParser.format(joiError);
      expect(joiError).to.equal(undefined, formattedError);
    }
  });

  it('should validate sample qcm structure', async function () {
    try {
      await qcmElementSchema.validateAsync(getQcmSample(), { abortEarly: false });
    } catch (joiError) {
      const formattedError = joiErrorParser.format(joiError);
      expect(joiError).to.equal(undefined, formattedError);
    }
  });

  it('should validate sample qcu structure', async function () {
    try {
      await qcuElementSchema.validateAsync(getQcuSample(), { abortEarly: false });
    } catch (joiError) {
      const formattedError = joiErrorParser.format(joiError);
      expect(joiError).to.equal(undefined, formattedError);
    }
  });

  it('should validate sample qrocm structure', async function () {
    try {
      await qrocmElementSchema.validateAsync(getQrocmSample(), { abortEarly: false });
    } catch (joiError) {
      const formattedError = joiErrorParser.format(joiError);
      expect(joiError).to.equal(undefined, formattedError);
    }
  });

  it('should validate sample text structure', async function () {
    try {
      await textElementSchema.validateAsync(getTextSample(), { abortEarly: false });
    } catch (joiError) {
      const formattedError = joiErrorParser.format(joiError);
      expect(joiError).to.equal(undefined, formattedError);
    }
  });

  it('should validate sample video structure', async function () {
    try {
      await videoElementSchema.validateAsync(getVideoSample(), { abortEarly: false });
    } catch (joiError) {
      const formattedError = joiErrorParser.format(joiError);
      expect(joiError).to.equal(undefined, formattedError);
    }
  });
});
