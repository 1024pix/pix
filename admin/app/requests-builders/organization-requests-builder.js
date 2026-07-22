import ENV from 'pix-admin/config/environment';

export const organizationRequestsBuilder = {
  /**
   * Builds request object for attach-certification-centers action
   * @type {function}
   * @param {object} params
   * @param {number} params.organizationId
   * @param {number} params.certificationCenterId
   * @return {{url: string, method: string, body: string}}
   */
  buildAttachCertificationCenterRequest: ({ organizationId, certificationCenterId }) => {
    return {
      url: `${ENV.APP.API_HOST}/api/admin/organizations/${organizationId}/attach-certification-centers`,
      method: 'POST',
      body: JSON.stringify({ certificationCenterId }),
    };
  },

  /**
   * Builds request object for detach-certification-centers action
   * @type {function}
   * @param {object} params
   * @param {number} params.organizationId
   * @return {{url: string, method: string}}
   */
  buildDetachCertificationCenterRequest: ({ organizationId }) => {
    return {
      url: `${ENV.APP.API_HOST}/api/admin/organizations/${organizationId}/detach-certification-center`,
      method: 'POST',
    };
  },
};
