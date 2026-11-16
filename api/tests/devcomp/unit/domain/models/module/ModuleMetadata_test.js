import { expect } from 'chai';

import { ModuleMetadata } from '../../../../../../src/devcomp/domain/models/module/ModuleMetadata.js';

describe('Unit | Devcomp | Domain | Models | Module | ModuleMetadata', function () {
  let id, isBeta, slug, title, duration, image, shortId, visibility, level, objectives, description;

  beforeEach(function () {
    id = '12a3a2b4-e873-4789-ae1c-57f6f2b99890';
    shortId = '87ejdt65';
    slug = 'tmp-module-test';
    title = "Test d'un module";
    isBeta = false;
    duration = 10;
    image = 'emile';
    visibility = Symbol('visibility');
    level = 'Débutant';
    objectives = ['<p>Objectif 1</p>', '<p>Objectif 2</p>', '<p>Objectif 3</p>'];
    description = 'Description';
  });

  it('should init and keep attributes', function () {
    // when
    const module = new ModuleMetadata({
      id,
      shortId,
      slug,
      title,
      isBeta,
      duration,
      image,
      visibility,
      level,
      objectives,
      description,
    });

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
});
