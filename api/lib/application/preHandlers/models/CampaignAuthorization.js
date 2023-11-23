const prescriberRoles = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  OWNER: 'OWNER',
};

class CampaignAuthorization {
  static isAllowedToManage({ prescriberRole }) {
    return prescriberRole === prescriberRoles.ADMIN || prescriberRole === prescriberRoles.OWNER;
  }

  static isAllowedToAccess({ prescriberRole }) {
    return Object.values(prescriberRoles).includes(prescriberRole);
  }
}

export { CampaignAuthorization, prescriberRoles };
