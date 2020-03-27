# 8. Découplage de pans fonctionnels via évènements métier

Date : 2020-03-27

## État

En cours d'expérimentation

## Contexte
Il y a une richesse métier spécifique importante qui gravite autour de la notion de "badge":
- Définition d'un badge
- Conditions d'obtention d'un badge
- Persitence d'un badge
- Relation entre badges et certification
- ... 

La notion de "badge" intervient auprès de plusieurs pans fonctionnels (*subdomains*) déjà riches de logiques métier qui leur est propre :
- L'évaluation (on attribue un badge en fin de parcours)
- La certification (on vérifie l'obtention ou non d'un badge au moment de l'attribution d'une certification)

On ne saurait rattacher ***entièrement*** la logique de "badge" ni au pan fonctionnel "Evaluation" ni au pan fonctionnel "Certification".

On peut donc considérer "Badge" comme étant un pan fonctionnel (*subdomain*) à part entière.

A ce titre, au niveau du code on cherchera à :
- Marquer clairement les frontières entre "Badge" et les autres contextes avec lesquels il interagit
- Centraliser et isoler la logique de badge pour ne pas qu'elle transpire dans celle des autres contextes et vice versa

En jargon Domain-Driven Design (DDD), cela revient à faire correspondre un *Bounded context* au *Subdomain* "Badge".

## Décision

Utiliser des événements métier (*domain events*) pour la collaboration entre contextes.

## Conséquences

L'architecture applicative est legèrement différente.

### Architecture

Voici l'implémentation à date du usecase `complete-assessment`:

```javascript
module.exports = async function completeAssessment({
  assessmentId,
  assessmentRepository,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringCertificationService,
}) {
  const assessment = await assessmentRepository.get(assessmentId);

  if (assessment.isCompleted()) {
    throw new AlreadyRatedAssessmentError();
  }
  assessment.setCompleted();

  if (assessment.isCertification()) {
    await _calculateCertificationScore({ assessment, assessmentResultRepository, certificationCourseRepository, competenceMarkRepository, scoringCertificationService });
  }
  await assessmentRepository.completeByAssessmentId(assessmentId);
  return assessment;
};
```

Pour y ajouter la sauvegarde du badge conditionnelle en fonction des résultats, on aurait pu ajouter ce bloc de code :

```javascript
      if (assessment.isSmartPlacement()) {
        const badge = await badgeRepository.findOneByTargetProfileId(assessment.campaignParticipation.campaign.targetProfileId);
        if (badge != null) {
          const campaignParticipationResult = await campaignParticipationResultRepository.getByParticipationId(assessment.campaignParticipation.id);
          const areBadgeCriteriaFulfilled = badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult });
          if (areBadgeCriteriaFulfilled) {
            await badgeAcquisitionRepository.create({ badgeId: badge.id, userId: userId });
          }
        }
      }
```

Cela revient à faire transpirer la logique propre au domain "Badge" dans la logique propre du domain "Evaluation".
Les deux seraient alors couplées.

On choisit de renvoyer un évènement `AssessmentCompleted` en sortie de usecase :

```javascript
module.exports = async function completeAssessment({
  assessmentId,
  assessmentRepository,
  assessmentResultRepository,
  certificationCourseRepository,
  competenceMarkRepository,
  scoringCertificationService
}) {
  const assessment = await assessmentRepository.get(assessmentId);

  if (assessment.isCompleted()) {
    throw new AlreadyRatedAssessmentError();
  }

  if (assessment.isCertification()) {
    await _calculateCertificationScore({ assessment, assessmentResultRepository, certificationCourseRepository, competenceMarkRepository, scoringCertificationService });
  }
  await assessmentRepository.completeByAssessmentId(assessmentId);

  return new AssessmentCompleted(
    assessment.userId,
    assessment.isSmartPlacement() ? assessment.campaignParticipation.campaign.targetProfileId : null,
    assessment.isSmartPlacement() ? assessment.campaignParticipation.id : null,
  );
};
```

Cet évènement est récupéré par le controller qui le transmet à un *event handler* (dont le rôle est de *réagir* à un *domain event*):
```javascript
  async completeAssessment(request) {
    const assessmentId = parseInt(request.params.id);
    const assessmentCompletedEvent = await usecases.completeAssessment({ assessmentId });
    await badgeCreationHandler.handle(assessmentCompletedEvent);

    return null;
  }
```

Ce *domain handler* est dédiée à la logique de création de badge:

```javascript
const badgeCreationHandler = {
  handle: async function(event) {
    if (event.targetProfileId != null) {
      const badge = await badgeRepository.findOneByTargetProfileId(event.targetProfileId);
      if (badge != null) {
        const campaignParticipationResult = await campaignParticipationResultRepository.getByParticipationId(event.campaignParticipationId);
        const areBadgeCriteriaFulfilled = badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult });
        if (areBadgeCriteriaFulfilled) {
          await badgeAcquisitionRepository.create({ badgeId: badge.id, userId: event.userId });
        }
      }
    }
  }
}
```

Ainsi le usecase `complete-assessment` ne sait rien de la logique d'acqusition de badges qu'il provoque. De la même façon, le handler d'acquisition de badges ne sait rien de la logique de complétion d'un parcours qui le déclenche. Les deux logiques métiers sont complètement découplées.     

## Références

Articles :

- https://docs.microsoft.com/fr-fr/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-events-design-implementation
- http://udidahan.com/2008/08/25/domain-events-take-2/
- https://lostechies.com/jimmybogard/2010/04/08/strengthening-your-domain-domain-events/
- https://lostechies.com/jimmybogard/2014/05/13/a-better-domain-events-pattern/
- https://matthiasnoback.nl/2015/01/from-commands-to-events/
- https://martinfowler.com/articles/201701-event-driven.html
- https://martinfowler.com/eaaDev/EventNarrative.html#HandlingEvents
- https://martinfowler.com/eaaDev/EventCollaboration.html

Livres :

- _Object Design Style Guide_, chapitre 7.2 : _Limit the scope of a command method, and use events to perform secondary tasks_
- _Implementing Domain-Driven Design_, chapitre 8 : _Domain Events_
- _Patterns, Principles and Practices of DDD_, chapitre 18 : _Domain Events_
