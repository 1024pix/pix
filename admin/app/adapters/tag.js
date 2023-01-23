import ApplicationAdapter from './application';

export default class TagAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForQuery(query) {
    const { tagId, recentlyUsedTags } = query;
    delete query.tagId;
    delete query.recentlyUsedTags;

    if (recentlyUsedTags) {
      return `${this.host}/${this.namespace}/tags/${tagId}/recently-used`;
    }

    return super.urlForQueryRecord(...arguments);
  }
}
