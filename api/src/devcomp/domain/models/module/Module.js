class Module {
  static VISIBILITY = Object.freeze({
    PUBLIC: 'public',
    PRIVATE: 'private',
  });

  constructor({ id, shortId, slug, title, isBeta, sections, details, version, visibility, glossary }) {
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
