import ApplicationAdapter from './application';

export default class ComplementaryCertificationAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/complementary-certifications/${id}/target-profiles`;
  }

  urlForUpdateRecord(id) {
    return `${this.host}/${this.namespace}/complementary-certifications/${id}/badges`;
  }

  async updateRecord(_, type, complementaryCertification) {
    if (complementaryCertification.adapterOptions?.attachBadges) {
      const payload = this.serialize(complementaryCertification);
      delete payload.data.attributes['key'];
      delete payload.data.attributes['label'];
      delete payload.data.attributes['has-external-jury'];
      delete payload.data.attributes['target-profiles-history'];

      const { targetProfileId, notifyOrganizations } = complementaryCertification.adapterOptions;
      payload.data.attributes['target-profile-id'] = targetProfileId;
      payload.data.attributes['notify-organizations'] = notifyOrganizations;

      const complementaryCertificationBadges =
        complementaryCertification.hasMany('complementaryCertificationBadges') ?? [];
      payload.data.attributes['complementary-certification-badges'] = complementaryCertificationBadges.map(
        (complementaryCertificationBadge) => {
          return this.serialize(complementaryCertificationBadge, { includeId: true });
        },
      );

      return this.ajax(
        this.urlForUpdateRecord(complementaryCertification.id, type.modelName, complementaryCertification),
        'PUT',
        { data: payload },
      );
    }

    return super.updateRecord(...arguments);
  }
}
