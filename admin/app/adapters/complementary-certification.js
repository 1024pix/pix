import ApplicationAdapter from './application';

export default class ComplementaryCertificationAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/complementary-certifications/${id}/target-profiles`;
  }

  urlForUpdateRecord(id) {
    return `${this.host}/${this.namespace}/complementary-certifications/${id}/badges`;
  }

  async updateRecord(store, type, complementaryCertification) {
    if (complementaryCertification.adapterOptions?.attachBadges === true) {
      const {detachedTargetProfileId, attachedTargetProfileId} = complementaryCertification.adapterOptions;
      const payload = this.serialize(complementaryCertification, {includeId: true});
      delete payload.data.attributes['target-profiles-history'];

      payload.data.attributes.attachedTargetProfileId = attachedTargetProfileId;
      payload.data.attributes.detachedTargetProfileId = detachedTargetProfileId;

      const relatedBadges = complementaryCertification.hasMany('complementaryCertificationBadges') ?? [];
      payload.data.attributes.badges = relatedBadges
        .filterBy('isNew', true)
        .map(complementaryCertificationBadge => {
          return this.serialize(complementaryCertificationBadge, {includeId: true});
        });

      return this.ajax(this.urlForUpdateRecord(complementaryCertification.id, type.modelName, complementaryCertification), 'PUT', payload);
    }

    return super.updateRecord(...arguments);
  }
}
