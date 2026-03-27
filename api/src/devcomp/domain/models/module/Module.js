import { assertIsArray, assertNotNullOrUndefined } from '../../../../shared/domain/models/asserts.js';

class Module {
  static VISIBILITY = Object.freeze({
    PUBLIC: 'public',
    PRIVATE: 'private',
  });

  constructor({ id, shortId, slug, title, isBeta, sections, details, version, visibility, glossary }) {
    assertNotNullOrUndefined(id, 'The id is required for a module');
    assertNotNullOrUndefined(shortId, 'The shortId is required for a module');
    assertNotNullOrUndefined(slug, 'The slug is required for a module');
    assertNotNullOrUndefined(title, 'The title is required for a module');
    assertNotNullOrUndefined(isBeta, 'isBeta value is required for a module');
    assertIsArray(sections, 'A list of sections is required for a module');
    assertNotNullOrUndefined(details, 'The details are required for a module');
    assertNotNullOrUndefined(visibility, 'The visibility is required for a module');

    this.id = id;
    this.shortId = shortId;
    this.slug = slug;
    this.title = title;
    this.isBeta = isBeta;
    this.sections = sections;
    this.details = details;
    this.version = version;
    this.visibility = visibility;
    this.glossary = glossary;
  }

  setRedirectionUrl(url) {
    this.redirectionUrl = url;
  }
}

export { Module };
