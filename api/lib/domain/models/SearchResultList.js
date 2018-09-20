class SearchResultList {

  constructor({
    // attributes
    page,
    pageSize,
    totalResults,
    // includes
    paginatedResults = [],
    // references
  } = {}) {
    // attributes
    this.page = page;
    this.pageSize = pageSize;
    this.totalResults = totalResults;
    // includes
    this.paginatedResults = paginatedResults;
    // references
  }

  get pagesCount() {
    return Math.ceil(this.totalResults / this.pageSize);
  }
}

module.exports = SearchResultList;
