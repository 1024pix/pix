import Service, { inject as service } from '@ember/service';
import ENV from 'pix-certif/config/environment';

export default class ServerSentEventService extends Service {
  @service store;
  @service session;

  #stream;

  async start(sessionId) {
    // init the stream
    const response = await fetch(`${ENV.APP.API_HOST}/api/sessions/${sessionId}/supervision-events`, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${this.session.data.authenticated.access_token}`,
        'Content-Type': 'text/event-stream',
      },
    });

    // connection established
    this.#stream = response;

    // Init the ember model that will be filled with server data
    const model = this.store.push({
      data: {
        type: 'session-for-supervising',
        id: sessionId,
        attributes: {},
      },
    });

    // Update the model with the new event in background
    (async () => {
      for await (const value of this.#events()) {
        console.log('Store updated');
        const decoded = value;
        this.store.pushPayload('session-for-supervising', decoded);
      }
    })();

    // Return the ember model to the UI
    return model;
  }

  async *#events() {
    const reader = await this.#stream?.body?.pipeThrough(new TextDecoderStream()).getReader();

    while (true) {
      const { done, value } = await reader.read();

      if (value) {
        yield JSON.parse(value);
      }

      // TODO : handle done()
      // TODO : add AbortController on fetch
      // TODO : inform consmer on close / done / abort (for example to duisplay a notif)
    }
  }
}
