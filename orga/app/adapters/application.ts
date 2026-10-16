import { service } from '@ember/service';
import { JSONAPIAdapter } from '@warp-drive/legacy/adapter/json-api';
import type { AdapterPayload } from '@warp-drive/legacy/compat';
import ENV from 'pix-orga/config/environment';

import type AjaxQueueService from '../services/ajax-queue';
import type LocaleService from '../services/locale';
import type SessionService from '../services/session';

export default class ApplicationAdapter extends JSONAPIAdapter {
  @service declare ajaxQueue: AjaxQueueService;
  @service declare locale: LocaleService;
  @service declare session: SessionService;

  host = ENV.APP.API_HOST;
  namespace = 'api';

  buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.session.isAuthenticated) {
      headers['Authorization'] = `Bearer ${String(this.session.data.authenticated.access_token)}`;
    }
    headers['X-App-Version'] = ENV.APP.APP_VERSION;
    return headers;
  }

  ajaxOptions(...args: Parameters<JSONAPIAdapter['ajaxOptions']>): ReturnType<JSONAPIAdapter['ajaxOptions']> {
    const requestOptions = super.ajaxOptions(...args) as ReturnType<JSONAPIAdapter['ajaxOptions']> & {
      headers?: Record<string, unknown>;
    };
    requestOptions.headers = { ...this.buildHeaders(), ...requestOptions.headers };
    return requestOptions;
  }

  ajax(...args: Parameters<JSONAPIAdapter['ajax']>): Promise<AdapterPayload> {
    return this.ajaxQueue.add(() => super.ajax(...args)) as Promise<AdapterPayload>;
  }
}
