class EventDispatcherLogger {
  constructor(monitoringTools, settings) {
    this._monitoringTools = monitoringTools;
    this._settings = settings;
  }

  onEventDispatchStarted(event, eventHandlerName) {
    if (this._settings.logging.enableLogStartingEventDispatch) {
      this._monitoringTools.logInfoWithCorrelationIds({
        ..._buildLoggingContext({ event, eventHandlerName }),
        message: 'EventDispatcher : Event dispatch started.',
      });
    }
  }

  onEventDispatchSuccess(event, eventHandlerName) {
    if (this._settings.logging.enableLogEndingEventDispatch) {
      this._monitoringTools.logInfoWithCorrelationIds({
        ..._buildLoggingContext({ event, eventHandlerName }),
        message: 'EventDispatcher : Event dispatched successfully',
      });
    }
  }

  onEventDispatchFailure(event, eventHandlerName, error) {
    if (this._settings.logging.enableLogEndingEventDispatch) {
      this._monitoringTools.logInfoWithCorrelationIds({
        ..._buildLoggingContext({ event, eventHandlerName, error }),
        message: 'EventDispatcher : An error occurred while dispatching the event',
      });
    }
  }
}

function _buildLoggingContext({ event, eventHandlerName, error }) {
  return {
    metrics: {
      event_name: event.constructor.name,
      event_content: event,
      event_handler_name: eventHandlerName,
      event_error: error?.message ?
        error.message + ' (see dedicated log for more information)'
        : '-',
    },
  };
}

module.exports = EventDispatcherLogger;
