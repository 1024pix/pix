const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(certificationProfiles) {
    return new Serializer('certificationProfiles', {
      transform(untouchedCertificationProfile) {
        const certificationProfile = Object.assign({}, untouchedCertificationProfile);
        certificationProfile.isCertifiable = untouchedCertificationProfile.isCertifiable();
        certificationProfile.id = untouchedCertificationProfile.userId;
        return certificationProfile;
      },
      attributes: ['isCertifiable'],
    }).serialize(certificationProfiles);
  },

};
