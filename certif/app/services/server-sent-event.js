import Service, { inject as service } from '@ember/service';
import ENV from 'pix-certif/config/environment';

// source d'inspi:  https://github.com/lukeed/fetch-event-stream/blob/main/mod.ts
// source d'inspi:  https://developer.mozilla.org/en-US/docs/Web/API/TextDecoderStream#examples
// source d'inspi:  https://yama-corp.com/fr/developpement/2024-08-02/les-server-sent-events-sse/
export default class ServerSentEventService extends Service {
  @service store;
  @service session;

  // Stream properties
  #ongoingEventStream;
  #abortController;

  // Externals handlers
  #onModelUpdateHandler;
  #onErrorHandler;

  async connect(sessionId) {
    try {
      // Allows user to close the connection (for example an UI 'quit' button)
      // @see https://developer.mozilla.org/en-US/docs/Web/API/AbortController
      this.#abortController = new AbortController();
      const timeoutSignal = AbortSignal.timeout(5000);

      // Init the stream
      const response = await fetch(
        `${ENV.APP.API_HOST}/api/sessions/${sessionId}/supervision-events`,
        {
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${this.session.data.authenticated.access_token}`,
            'Content-Type': 'text/event-stream',
          },
        },
        { signal: AbortSignal.any([this.#abortController.signal, timeoutSignal]) },
      );

      // Connection established
      this.#ongoingEventStream = response;
    } catch (error) {
      // Server sie errors
      this.#onError(error);
    }
  }

  async startListening() {
    try {
      const reader = await this.#ongoingEventStream?.body?.getReader();

      while (true) {
        // TODO : extract this to a setInterval to evaluate connection separately from stream reading
        // @see https://stackoverflow.com/questions/65748344/how-can-i-interrupt-a-reader-when-it-hangs-need-a-timeout-on-reader-read
        if (this.#abortController.signal.aborted) {
          // Stream connection closed on client side
          return this.#onStreamDone();
        }

        const { done, value } = await reader.read();

        if (value) {
          const asText = new TextDecoder('utf-8').decode(value);
          const decoded = this.#split(asText);
          await this.#onModelUpdate(decoded);
        }

        if (done) {
          // Might happen if user lost authorization
          this.#onError(new Error('Stream ended'));
          return;
        }
      }
    } catch (error) {
      // Stream no readable or parseable
      this.#onError(error);
    }
  }

  stopListening() {
    return this.#abortController?.abort();
  }

  /**
   * @param {Promise<void>} handler - @see {#onModelUpdate}
   */
  registerOnModelUpdateHandler(handler) {
    this.#onModelUpdateHandler = handler;
    return this;
  }

  async #onModelUpdate(event) {
    if (!this.#onModelUpdateHandler) {
      console.warn('Event received but no event handler provided', event);
      return;
    }

    await this.#onModelUpdateHandler(event);
  }

  /**
   * @param {Function<void>} handler  - @see {#onError}
   */
  registerOnErrorHandler(handler) {
    this.#onErrorHandler = handler;
    return this;
  }

  #onError(error) {
    if (!this.#onErrorHandler) {
      console.error('Stream error but no event handler provided', error);
      return;
    }
    this.#onErrorHandler(error);
  }

  #onStreamDone() {
    console.warn('Stream done but no event handler provided');
  }

  /**
   * Separates fields from data
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#sending_events_from_the_server
   */
  #split(data) {
    // field and data are separated using a semicolon
    const regex = /[:]\s*/;
    const match = regex.exec(data);
    // In case we send a stream comment, ": comment" -> index=0 -> ignore
    const hasValue = match && match.index;

    if (hasValue) {
      return {
        field: data.substring(0, hasValue),
        value: JSON.parse(data.substring(hasValue + match[0].length)),
      };
    }
  }
}
