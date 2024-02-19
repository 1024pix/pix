import { expect } from '../../../../../../test-helper.js';
import {
  imageElementSchema,
  qcmElementSchema,
  qcuElementSchema,
  qrocmElementSchema,
  textElementSchema,
  videoElementSchema,
} from './element/index.js';
import { getImageSample } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/image.sample.js';
import { getQcmSample } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/qcm.sample.js';
import { getQcuSample } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/qcu.sample.js';
import { getQrocmSample } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/qrocm.sample.js';
import { getTextSample } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/text.sample.js';
import { getVideoSample } from '../../../../../../../src/devcomp/infrastructure/datasources/learning-content/samples/elements/video.sample.js';

describe('Unit | Infrastructure | Datasources | Learning Content | Module Datasource | format validation', function () {
  it('should validate sample image structure', function () {
    // When
    const result = imageElementSchema.validate(getImageSample());

    // Then
    expect(result.error).to.equal(undefined, result.error?.details.map((error) => error.message).join('. '));
  });

  it('should validate sample qcm structure', async function () {
    // When
    const result = await qcmElementSchema.validateAsync(getQcmSample());

    // Then
    expect(result.error).to.equal(undefined, result.error?.details.map((error) => error.message).join('. '));
  });

  it('should validate sample qcu structure', async function () {
    // When
    const result = await qcuElementSchema.validateAsync(getQcuSample());

    // Then
    expect(result.error).to.equal(undefined, result.error?.details.map((error) => error.message).join('. '));
  });

  it('should validate sample qrocm structure', async function () {
    // When
    const result = await qrocmElementSchema.validateAsync(getQrocmSample());

    // Then
    expect(result.error).to.equal(undefined, result.error?.details.map((error) => error.message).join('. '));
  });

  it('should validate sample text structure', async function () {
    // When
    const result = await textElementSchema.validateAsync(getTextSample());

    // Then
    expect(result.error).to.equal(undefined, result.error?.details.map((error) => error.message).join('. '));
  });

  it('should validate sample video structure', async function () {
    // When
    const result = await videoElementSchema.validateAsync(getVideoSample());

    // Then
    expect(result.error).to.equal(undefined, result.error?.details.map((error) => error.message).join('. '));
  });
});
