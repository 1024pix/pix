const prescriberRoles = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  OWNER: 'OWNER',
};

class CampaignAuthorization {
  static isAllowedToManage({ prescriberRole }) {
    return prescriberRole === prescriberRoles.ADMIN || prescriberRole === prescriberRoles.OWNER;
  }
}

export default CampaignAuthorization;
export { prescriberRoles };
