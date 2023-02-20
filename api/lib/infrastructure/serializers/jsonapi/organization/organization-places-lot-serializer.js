export default {
  deserialize(json) {
    return {
      organizationId: json.data.attributes['organization-id'],
      count: json.data.attributes['count'],
      activationDate: json.data.attributes['activation-date'],
      expirationDate: json.data.attributes['expiration-date'],
      reference: json.data.attributes['reference'],
      category: json.data.attributes['category'],
      createdBy: json.data.attributes['created-by'],
    };
  },
};
