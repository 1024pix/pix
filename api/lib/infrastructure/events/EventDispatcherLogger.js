class EventDispatcherLogger {
  constructor(monitoringTools, settings, performance) {
    this._monitoringTools = monitoringTools;
    this._settings = settings;
    this._performance = performance;
  }

  onEventDispatchStarted(event, eventHandlerName) {
    if (this._settings?.logging?.enableLogStartingEventDispatch) {
      this._monitoringTools.logInfoWithCorrelationIds({
        ...buildLogBody({ event, eventHandlerName }),
        message: 'EventDispatcher : Event dispatch started',
      });
    }
    return {
      startedAt: this._performance.now(),
    };
  }

  onEventDispatchSuccess(event, eventHandlerName, loggingContext) {
    if (this._settings?.logging?.enableLogEndingEventDispatch) {
      this._monitoringTools.logInfoWithCorrelationIds({
        ...buildLogBody({ event, eventHandlerName, duration: this._duration(loggingContext) }),
        message: 'EventDispatcher : Event dispatched successfully',
      });
    }
  }

  onEventDispatchFailure(event, eventHandlerName, error) {
    if (this._settings?.logging?.enableLogEndingEventDispatch) {
      this._monitoringTools.logInfoWithCorrelationIds({
        ...buildLogBody({ event, eventHandlerName, error }),
        message: 'EventDispatcher : An error occurred while dispatching the event',
      });
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

export default EventDispatcherLogger;
