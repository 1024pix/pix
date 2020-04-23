# 9. Transactions métier

Date : 2020-03-27

## État

En cours d'expérimentation

## Contexte
Le mécanisme de transaction permet de garantir qu'une suite d'effets de bord n'a lieu que si chacun d'entre eux réussit.
Si l'un des effets de bord échoue, aucun des autres effets ne sera appliqué. 

A date, on ne sait travailler avec les transactions qu'au niveau `repositories`.
Dans le même `repository`, on sait par exemple écrire dans différentes tables en plusieurs étapes de façon transactionnelle.

Limiter la gestion des transactions au niveau `repository` pose plusieurs problèmes :

### Appel de plusieurs `repositories` au sein d'un même `usecase`
```javascript
completeAssessment({assessment, assessmentRepository, badgeRepository}) {
    if (!assessment.isComplete()) {
        await assessmentRepository.completeByAssessmentId(assessment.id); // S'exécute sans problème
        await badgeRepository.acquireBadge(); // Échoue 
    }
}
```
Dans l'exemple ci-dessus, les données de la base seront dans un état inconsistent.
Le parcours sera flaggé comme terminé alors que l'enregistrement du badge à échouer. 

Or on ne sait pas :
- Detecter cette anomalie
- Rejouer l'acquisition du badge sans rejouer la completion du parcours

### Design des objets métier / repositories par l'axe chronologique  
Pour palier à ce problème là, on pourrait déléguer la transaction à un seul repository:
```javascript
completeAssessment({assessment, assessmentRepository}) {
    if (!assessment.isComplete()) {
        assessment.badge = new Badge();
        await assessmentRepository.completeAssessment(assessment);
    }
}
```
Cela amène à regrouper des objets par chronologie : l'assessment et le badge sont modifiés *au même moment* donc on les regroupe.
Or cette solution amène du couplage entre deux aspects fonctionnels distincts qu'on voudrait pouvoir faire vivre et évoluer indépendemment.

## Décision

Englober le usecase dans une transaction métier.

## Conséquences

L'architecture applicative est legèrement différente.

### Architecture

#### DomainTransaction:
```javascript
class DomainTransaction {
  constructor(knexTransaction) {
    this.knexTransaction = knexTransaction;
  }

  static execute(lambda) {
    return knex.transaction((trx) => {
      return lambda(new DomainTransaction(trx));
    });
  }
}
```

#### Controller :
```javascript
  async completeAssessment(request) {
    const assessmentId = parseInt(request.params.id);

    await DomainTransaction.execute(async (domainTransaction) => {
      await usecases.completeAssessment({ domainTransaction, assessmentId });
    });

    return null;
  }
```

#### Usecase :
```javascript
completeAssessment({assessment, domainTransaction, assessmentRepository, badgeRepository}) {
    if (!assessment.isComplete()) {
        await assessmentRepository.completeAssessment(assessment.id, domainTransaction);
        await badgeRepository.acquireBadge(domainTransaction);
    }
}
```

#### Repository :
```javascript
  completeByAssessmentId(assessmentId, domainTransaction = DomainTransaction.emptyTransaction()) {
      const assessment = await BookshelfAssessment
          .where({ assessmentId })
          .save({ Assessment.states.COMPLETED }, { require: true, patch: true, transacting: domainTransaction.knexTransaction });
      return bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessment);
  }
```

#### Handlers :
L'utilisation de `DomainTransaction` permet également de placer un `usecase` ainsi qu'un ou plusieurs handlers dans la même transaction:

```javascript
  async completeAssessment(request) {
    const assessmentId = parseInt(request.params.id);

    await DomainTransaction.execute(async (domainTransaction) => {
      const assessmentCompletedEvent = await usecases.completeAssessment({ domainTransaction, assessmentId });
      await badgeCreationHandler.handle(domainTransaction, assessmentCompletedEvent);
    });

    return null;
  },
```
