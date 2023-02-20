import scalingo from 'scalingo';
import ScalingoDBClient from './db-client';

class ScalingoClient {
  constructor({ client, application, region }) {
    this.application = application;
    this.client = client;
    this.region = region;
  }

  static async getInstance({ application, token, region }) {
    const apiUrl = `https://api.${region}.scalingo.com`;
    const client = await scalingo.clientFromToken(token, { apiUrl });

    return new ScalingoClient({ client, application, region });
  }

  async getAddon(addonProviderId) {
    try {
      const addons = await this.client.Addons.for(this.application);
      return addons.find((addon) => addon.addon_provider.id === addonProviderId);
    } catch (error) {
      throw new Error(`Unable to get the addon "${addonProviderId}" from Scalingo API. Response was ${error.message}`);
    }
  }

  async getAddonApiToken(addonId) {
    try {
      const response = await this.client.apiClient().post(`/apps/${this.application}/addons/${addonId}/token`);
      return response.data.addon.token;
    } catch (error) {
      throw new Error(`Unable to get the addon token from Scalingo API. Response was ${error.message}`);
    }
  }

  async getDatabaseClient(dbId) {
    const dbToken = await this.getAddonApiToken(dbId);
    return ScalingoDBClient.getInstance({ dbId, dbToken, region: this.region });
  }
}

export default ScalingoClient;
