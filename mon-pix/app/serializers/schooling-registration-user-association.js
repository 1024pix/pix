import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class SchoolingRegistrationUserAssociationSerializer extends JSONAPISerializer {
  serialize(snapshot, option) {
    const json = super.serialize(snapshot, option);
    if (snapshot.record.get('studentNumber')) {
      delete json.data.attributes['last-name']; 
      delete json.data.attributes['first-name']; 
      delete json.data.attributes['birthdate']; 
      delete json.data.attributes['username']; 
    } else {
      delete json.data.attributes['student-number'];
    }
        
    return json;
  }
}
