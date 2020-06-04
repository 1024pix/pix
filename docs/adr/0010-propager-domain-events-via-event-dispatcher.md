# 10. Propager les _Domain Events_ via un _Event Dispatcher_ 

Date : 2020-06-04

Cet ADR étend l'ADR [#8](./0008-découplage-fonctionnel-via-evenements.md)

## État

En cours d'expérimentation

## Contexte

Actuellement, les _Domain Events_ sont distribués au _Event Handlers_ à la main dans le controller (orchestration).
Ceci était une solution temporaire, on souhaite que les _Domain Handlers_ puissent s'abonner à des _Domain Events_ (chorégraphie).   

## Décision

Les _Event Handlers_ définissent eux-même le type de _Domain Events_ auxquels ils réagissent.
Un mécanisme de _publisher/subscribers_ appelé _EventDispatcher_ est instancié au moment de l'injection de dépendances.
Tous les handlers sont abonnés aux _Domain Events_ qui les regardent au moment de leur injection.

## Conséquences

### Controller
_Avant :_ 
```javascript
  async completeAssessment(request) {
    const assessmentId = parseInt(request.params.id);

    await DomainTransaction.execute(async (domainTransaction) => {
      const assessmentCompletedEvent = await usecases.completeAssessment({ domainTransaction, assessmentId });
      const certificationScoringEvent = await events.handleCertificationScoring({ domainTransaction, assessmentCompletedEvent });

      await events.handleBadgeAcquisition({ domainTransaction, assessmentCompletedEvent });

      await events.handleCertificationAcquisitionForPartner({ domainTransaction, certificationScoringEvent });
    });

    return null;
  }
```

_Après :_
```javascript
  async completeAssessment(request) {
    const assessmentId = parseInt(request.params.id);

    await DomainTransaction.execute(async (domainTransaction) => {
      const event = await usecases.completeAssessment({ domainTransaction, assessmentId });
      await events.eventDispatcher.dispatch(domainTransaction, event);
    });

    return null;
  }
```

### Injection de dépendances
_Pseudo-code illustratif:_
```javascript
const handlersToBeInjected = {
  handleBadgeAcquisition: require('./handle-badge-acquisition'),
  handleCertificationScoring: require('./handle-certification-scoring'),
  handleCertificationAcquisitionForPartner: require('./handle-certification-partner')
};

function buildEventDispatcher() {
  const eventDispatcher = new EventDispatcher();
  for (const handler of handlersToBeInjected) {
    eventDispatcher.subscribe(handler.eventType, inject(handler));
  }
  return eventDispatcher;
}

module.exports = {
  eventDispatcher: buildEventDispatcher()
}
```


### Tests de chorégraphie
Il devient alors possible (et précieux à titre de non-régression) de tester la bonne mise en place des _Event Handlers_ en testant les chaînages.

```javascript
describe('Event Choregraphy | Score Partner Certification', function() {
  it('chains Certification Scoring and Partner Certification Scoring on Assessment Completed', async () => {
    // given
    const { handlerStubs, eventDispatcher } = buildEventDispatcherAndHandlersForTest();

    const domainTransaction = Symbol('a transaction');

    const assessmentCompleted = new AssessmentCompleted();
    const certificationScoringCompleted = new CertificationScoringCompleted({});

    handlerStubs.handleCertificationScoring.withArgs({ domainTransaction, event:assessmentCompleted }).resolves(
      certificationScoringCompleted
    );

    // when
    await eventDispatcher.dispatch(domainTransaction, assessmentCompleted);

    // then
    expect(handlerStubs.handleCertificationAcquisitionForPartner).to.have.been.calledWith({ domainTransaction, event:certificationScoringCompleted });
  });
});
```

## Références : 
- https://medium.com/ingeniouslysimple/choreography-vs-orchestration-a6f21cfaccae





