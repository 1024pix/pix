const deserialize = function (json) {
  return {
    id: json.data.id,
    firstName: json.data.attributes['first-name'],
    lastName: json.data.attributes['last-name'],
    email: json.data.attributes.email,
    username: json.data.attributes.username,
    lang: json.data.attributes.lang,
    locale: json.data.attributes.locale,
  };
};

export const userUpdateForAdminSerializer = { deserialize };
