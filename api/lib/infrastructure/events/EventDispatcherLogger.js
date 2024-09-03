class EventDispatcherLogger {
  constructor(logger, settings, performance) {
    this._logger = logger;
    this._settings = settings;
    this._performance = performance;
  }

  onEventDispatchStarted(event, eventHandlerName) {
    if (this._settings?.logging?.enableLogStartingEventDispatch) {
      this._logger.info(
        {
          ...buildLogBody({ event, eventHandlerName }),
        },
        'EventDispatcher : Event dispatch started',
      );
    }
    return {
      startedAt: this._performance.now(),
    };
  }

  onEventDispatchSuccess(event, eventHandlerName, loggingContext) {
    if (this._settings?.logging?.enableLogEndingEventDispatch) {
      this._logger.info(
        {
          ...buildLogBody({ event, eventHandlerName, duration: this._duration(loggingContext) }),
        },
        'EventDispatcher : Event dispatched successfully',
      );
    }
  }

  onEventDispatchFailure(event, eventHandlerName, error) {
    if (this._settings?.logging?.enableLogEndingEventDispatch) {
      this._logger.info(
        {
          ...buildLogBody({ event, eventHandlerName, error }),
        },
        'EventDispatcher : An error occurred while dispatching the event',
      );
    }
  }

  _duration(context) {
    return context?.startedAt ? this._performance.now() - context.startedAt : undefined;
  }
}

function buildLogBody({ event, eventHandlerName, error, duration }) {
  return {
    metrics: {
      event_name: event.constructor.name,
      event_content: event,
      event_handler_name: eventHandlerName,
      event_error: error?.message ? error.message + ' (see dedicated log for more information)' : undefined,
      event_handling_duration: duration,
    },
  };
}

export { EventDispatcherLogger };
