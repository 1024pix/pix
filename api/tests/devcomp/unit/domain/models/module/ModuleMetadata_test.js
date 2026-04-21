import { ModuleMetadata } from '../../../../../../src/devcomp/domain/models/module/ModuleMetadata.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync } from '../../../../../tooling/test-utils/error.js';

describe('Unit | Devcomp | Domain | Models | Module | ModuleMetadata', function () {
  let id, isBeta, slug, title, duration, image, shortId, visibility;

  beforeEach(function () {
    id = '12a3a2b4-e873-4789-ae1c-57f6f2b99890';
    shortId = '87ejdt65';
    slug = 'tmp-module-test';
    title = "Test d'un module";
    isBeta = false;
    duration = 10;
    image = 'emile';
    visibility = Symbol('visibility');
  });

  it('should init and keep attributes', function () {
    // when
    const module = new ModuleMetadata({ id, shortId, slug, title, isBeta, duration, image, visibility });

    // then
    expect(module.id).to.equal(id);
    expect(module.shortId).to.equal(shortId);
    expect(module.slug).to.equal(slug);
    expect(module.title).to.equal(title);
    expect(module.isBeta).to.equal(isBeta);
    expect(module.duration).to.equal(duration);
    expect(module.image).to.equal(image);
    expect(module.link).to.equal(`/modules/${shortId}/${slug}`);
    expect(module.visibility).to.equal(visibility);
  });

  describe('if a module does not have an id', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () =>
          new ModuleMetadata({
            slug,
            title,
            isBeta,
            duration,
            image,
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The id is required for a module metadata');
    });
  });

  describe('if a module does not have a short id', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () =>
          new ModuleMetadata({
            id,
            slug,
            title,
            isBeta,
            duration,
            image,
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The short id is required for a module metadata');
    });
  });

  describe('if a module does not have a slug', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () =>
          new ModuleMetadata({
            id,
            title,
            isBeta,
            duration,
            image,
            shortId,
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The slug is required for a module metadata');
    });
  });

  describe('if a module does not have a title', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () =>
          new ModuleMetadata({
            id,
            slug,
            isBeta,
            duration,
            image,
            shortId,
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The title is required for a module metadata');
    });
  });

  describe('if a module does not have a field isBeta', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () =>
          new ModuleMetadata({
            id,
            title,
            slug,
            duration,
            image,
            shortId,
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('Field isBeta is required for a module metadata');
    });
  });

  describe('if a module does not have a duration', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () =>
          new ModuleMetadata({
            id,
            title,
            slug,
            isBeta,
            image,
            shortId,
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The duration is required for a module metadata');
    });
  });

  describe('if the module duration is 0', function () {
    it('should throw an error', function () {
      // given
      const duration = 0;

      // when
      const error = catchErrSync(
        () =>
          new ModuleMetadata({
            duration,
            id,
            title,
            slug,
            isBeta,
            image,
            shortId,
            visibility,
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The duration must be a positive integer for a module metadata');
    });
  });

  describe('if the module duration is negative', function () {
    it('should throw an error', function () {
      // given
      const duration = -5;

      // when
      const error = catchErrSync(
        () =>
          new ModuleMetadata({
            duration,
            id,
            title,
            slug,
            isBeta,
            image,
            shortId,
            visibility,
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The duration must be a positive integer for a module metadata');
    });
  });

  describe('if the module does not have an image', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () =>
          new ModuleMetadata({
            duration,
            id,
            title,
            slug,
            isBeta,
            shortId,
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The image is required for a module metadata');
    });
  });

  describe('if the module does not have a visibility', function () {
    it('should throw an error', function () {
      // when
      const error = catchErrSync(
        () =>
          new ModuleMetadata({
            duration,
            id,
            title,
            slug,
            isBeta,
            shortId,
            image,
          }),
      )();

      // then
      expect(error).to.be.instanceOf(DomainError);
      expect(error.message).to.equal('The visibility is required for a module metadata');
    });
  });
});
