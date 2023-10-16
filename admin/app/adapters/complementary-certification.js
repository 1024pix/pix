import ApplicationAdapter from './application';

export default class ComplementaryCertificationAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/complementary-certifications/${id}/target-profiles`;
  }

  urlForUpdateRecord(id) {
    return `${this.host}/${this.namespace}/complementary-certifications/${id}/badges`;
  }

  async updateRecord(_, type, snapshot) {
    if (snapshot.adapterOptions?.attachBadges) {
      const payload = this.serialize(snapshot);
      delete payload.data.attributes['key'];
      delete payload.data.attributes['label'];
      delete payload.data.attributes['has-external-jury'];
      delete payload.data.attributes['target-profiles-history'];

      const { targetProfileId, notifyOrganizations } = snapshot.adapterOptions;
      payload.data.attributes['target-profile-id'] = targetProfileId;
      payload.data.attributes['notify-organizations'] = notifyOrganizations;

      const complementaryCertificationBadges = snapshot.hasMany('complementaryCertificationBadges') ?? [];
      payload.data.attributes['complementary-certification-badges'] = complementaryCertificationBadges.map(
        (complementaryCertificationBadge) => {
          return this.serialize(complementaryCertificationBadge, { includeId: true });
        },
      );

      return this.ajax(this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot), 'PUT', { data: payload });
    }

    return super.updateRecord(...arguments);
  }
}
