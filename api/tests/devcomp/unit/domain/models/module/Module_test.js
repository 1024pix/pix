import { expect } from 'chai';

import { Module } from '../../../../../../src/devcomp/domain/models/module/Module.js';

describe('Unit | Devcomp | Domain | Models | Module | Module', function () {
  describe('#constructor', function () {
    it('should create a module and keep attributes', function () {
      // given
      const id = 1;
      const shortId = 'e074af34';
      const slug = 'les-adresses-email';
      const title = 'Les adresses email';
      const isBeta = false;
      const sections = [Symbol('text')];
      const details = Symbol('details');
      const version = Symbol('version');
      const visibility = Symbol('visibility');
      const glossary = [Symbol('glossaryEntry')];

      // when
      const module = new Module({ id, shortId, slug, title, isBeta, sections, details, version, visibility, glossary });

      // then
      expect(module.id).to.equal(id);
      expect(module.shortId).to.equal(shortId);
      expect(module.slug).to.equal(slug);
      expect(module.title).to.equal(title);
      expect(module.isBeta).to.equal(isBeta);
      expect(module.sections).to.have.lengthOf(sections.length);
      expect(module.details).to.deep.equal(details);
      expect(module.version).to.deep.equal(version);
      expect(module.visibility).to.deep.equal(visibility);
      expect(module.glossary).to.deep.equal(glossary);
    });
  });

  describe('#setRedirectionUrl', function () {
    let module;

    beforeEach(function () {
      const id = 1;
      const shortId = 'e074af34';
      const slug = 'les-adresses-email';
      const title = 'Les adresses email';
      const isBeta = false;
      const sections = [Symbol('text')];
      const details = Symbol('details');
      const version = Symbol('version');
      const visibility = Symbol('visibility');

      module = new Module({ id, shortId, slug, title, isBeta, sections, details, version, visibility });
    });

    it('should set redirectionUrl', function () {
      // given
      const url = '/parcours/COMBINIX1';

      // when
      module.setRedirectionUrl(url);

      // then
      expect(module.redirectionUrl).to.equal(url);
    });
  });
});
