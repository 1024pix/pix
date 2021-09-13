const { expect, sinon } = require('../../test-helper');
const EventDispatcherLogger = require('../../../lib/infrastructure/events/EventDispatcherLogger');

describe('Integration | Infrastructure | EventHandlerLogger', function() {
  context('when logging on event dispatch start is enabled', function() {
    it('logs an event dispatch started as info', function() {
      // given
      const event = new TestEvent('the content');
      const eventHandlerName = 'the event handler\'s name';
      const monitoringTools = _getMonitoringToolsMock();
      const settings = _getSettingsMock();
      settings.logging.enableLogStartingEventDispatch = true;
      const eventDispatcherLogger = new EventDispatcherLogger(monitoringTools, settings);

      // when
      eventDispatcherLogger.onEventDispatchStarted(event, eventHandlerName);

      // then
      expect(monitoringTools.logInfoWithCorrelationIds)
        .to.have.been.calledWith({
          metrics: {
            event_name: 'TestEvent',
            event_content: event,
            event_handler_name: 'the event handler\'s name',
            event_error: '-',
          },
          message: 'EventDispatcher : Event dispatch started.',
        });
    });
  });

  context('when logging on event dispatch start is disabled', function() {
    it('logs an event dispatch started as info', function() {
      // given
      const event = new TestEvent('the content');
      const eventHandlerName = 'the event handler\'s name';
      const monitoringTools = _getMonitoringToolsMock();
      const settings = _getSettingsMock();
      settings.logging.enableLogStartingEventDispatch = false;
      const eventDispatcherLogger = new EventDispatcherLogger(monitoringTools, settings);

      // when
      eventDispatcherLogger.onEventDispatchStarted(event, eventHandlerName);

      // then
      expect(monitoringTools.logInfoWithCorrelationIds)
        .not.to.be.called;
    });
  });

  context('when logging on event dispatch end is enabled', function() {
    it('logs an event dispatch success as info', function() {
      // given
      const event = new TestEvent('the content');
      const eventHandlerName = 'the event handler\'s name';
      const monitoringTools = _getMonitoringToolsMock();
      const settings = _getSettingsMock();
      settings.logging.enableLogEndingEventDispatch = true;
      const eventDispatcherLogger = new EventDispatcherLogger(monitoringTools, settings);

      // when
      eventDispatcherLogger.onEventDispatchSuccess(event, eventHandlerName);

      // then
      expect(monitoringTools.logInfoWithCorrelationIds)
        .to.have.been.calledWith({
          metrics: {
            event_name: 'TestEvent',
            event_content: event,
            event_handler_name: 'the event handler\'s name',
            event_error: '-',
          },
          message: 'EventDispatcher : Event dispatched successfully',
        });
    });

    it('logs an event dispatch failure as info', function() {
      // given
      const event = new TestEvent('the content');
      const eventHandlerName = 'the event handler\'s name';
      const monitoringTools = _getMonitoringToolsMock();
      const settings = _getSettingsMock();
      settings.logging.enableLogEndingEventDispatch = true;
      const eventDispatcherLogger = new EventDispatcherLogger(monitoringTools, settings);
      const anError = new Error('an error');

      // when
      eventDispatcherLogger.onEventDispatchFailure(event, eventHandlerName, anError);

      // then
      expect(monitoringTools.logInfoWithCorrelationIds)
        .to.have.been.calledWith({
          metrics: {
            event_name: 'TestEvent',
            event_content: event,
            event_handler_name: 'the event handler\'s name',
            event_error: 'an error (see dedicated log for more information)',
          },
          message: 'EventDispatcher : An error occurred while dispatching the event',
        });
    });
  });

  context('when logging on event dispatch end is disabled', function() {
    it('logs an event dispatch success as info', function() {
      // given
      const event = new TestEvent('the content');
      const eventHandlerName = 'the event handler\'s name';
      const monitoringTools = _getMonitoringToolsMock();
      const settings = _getSettingsMock();
      settings.logging.enableLogEndingEventDispatch = false;
      const eventDispatcherLogger = new EventDispatcherLogger(monitoringTools, settings);

      // when
      eventDispatcherLogger.onEventDispatchSuccess(event, eventHandlerName);

      // then
      expect(monitoringTools.logInfoWithCorrelationIds)
        .to.not.have.been.called;
    });

    it('logs an event dispatch failure as info', function() {
      // given
      const event = new TestEvent('the content');
      const eventHandlerName = 'the event handler\'s name';
      const monitoringTools = _getMonitoringToolsMock();
      const settings = _getSettingsMock();
      settings.logging.enableLogEndingEventDispatch = false;
      const eventDispatcherLogger = new EventDispatcherLogger(monitoringTools, settings);
      const anError = new Error('an error');

      // when
      eventDispatcherLogger.onEventDispatchFailure(event, eventHandlerName, anError);

      // then
      expect(monitoringTools.logInfoWithCorrelationIds)
        .to.not.have.been.called;
    });
  });

});

class TestEvent {
  constructor(content) {
    this.content = content;
  }
}

function _getMonitoringToolsMock() {
  return {
    logInfoWithCorrelationIds: sinon.stub(),
  };
}

function _getSettingsMock() {
  return {
    logging: {
      enableLogStartingEventDispatch: false,
      enableLogEndingEventDispatch: false,
    },
  };
}
