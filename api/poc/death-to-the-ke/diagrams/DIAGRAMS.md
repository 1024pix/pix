# KnowledgeState — Mécanisme et diagrammes

## 1. Flux de traitement d'une réponse

```mermaid
flowchart TD
    subgraph AVANT["Ancien modele - KnowledgeElement"]
        A1[Utilisateur repond a l acquis niveau 3] --> B1[Creer KE direct : skill_3 = validated]
        B1 --> C1[Inferer : skill_1 = inferred-validated]
        C1 --> D1[Inferer : skill_2 = inferred-validated]
        D1 --> E1[(Ecriture 3 lignes en DB - knowledge_elements)]
        E1 --> F1[Lecture : deduplication + tri par date + filtrage status != reset]
    end

    subgraph APRES["Nouveau modele - KnowledgeState"]
        A2[Utilisateur repond a l acquis niveau 3] --> B2[Charger etat du tube]
        B2 --> C2{Reussite ?}
        C2 -->|Oui| D2["floor = max(floor, 3)"]
        C2 -->|Non| E2["ceiling = min(ceiling, 3)"]
        D2 --> F2["directLevels = directLevels + 3"]
        E2 --> F2
        F2 --> G2[(UPSERT 1 ligne - knowledge_states)]
        G2 --> H2["Lecture : skill.difficulty <= floor -> valide"]
    end
```

---

## 2. Structure de données — avant / après

### Avant

```mermaid
erDiagram
    KNOWLEDGE_ELEMENTS {
        uuid id PK
        int userId FK
        string skillId
        string status "validated / invalidated / reset"
        string source "direct / inferred"
        float earnedPix "fige a la reponse"
        timestamp createdAt
    }
```

### Après

```mermaid
erDiagram
    KNOWLEDGE_STATES {
        int userId FK
        string tubeId FK
        int floor "plus haut niveau valide"
        int ceiling "plus bas niveau invalide, nullable"
        string directLevels "niveaux reellement poses, ex: 1,3,5"
        timestamp updatedAt
    }
```

---

## 3. Mécanique des bornes floor / ceiling

```
Tube : [1]──[2]──[3]──[4]──[5]──[6]──[7]
                  ^              ^
               floor=3        ceiling=5
         OK OK OK     ?     KO KO KO
```

```mermaid
flowchart LR
    subgraph ETAT["Etat stocke en base"]
        F["floor = 3\nniveaux 1, 2, 3 valides"]
        C["ceiling = 5\nniveaux 5, 6, 7 invalides"]
        U["niveau 4 = non teste"]
    end

    subgraph INFERENCE["Reconstruction a la lecture"]
        V["validatedSkills()\nskill.difficulty <= floor\n=> 1, 2, 3"]
        I["invalidatedSkills()\nskill.difficulty >= ceiling\n=> 5, 6, 7"]
    end

    F --> V
    C --> I
```

---

## 4. Cycle de vie complet — de la réponse au score

```mermaid
sequenceDiagram
    actor User
    participant UC as save-and-correct-answer
    participant Domain as KnowledgeState
    participant Repo as knowledge-state-repository
    participant DB as knowledge_states
    participant Score as scorecard-service

    User->>UC: repond a skill_web_3 OK
    UC->>Repo: findByUserId(userId)
    Repo->>DB: SELECT * WHERE userId = X
    DB-->>Repo: tubeWeb floor=1 ceiling=null directLevels=1
    Repo-->>UC: KnowledgeState

    UC->>Domain: withAnswer(skill_web_3, isOk=true, tubeSkills)
    Domain-->>UC: KnowledgeState tubeWeb floor=3 ceiling=null directLevels=1,3

    UC->>Repo: save(knowledgeState, tubeIds=[tubeWeb])
    Repo->>DB: INSERT ON CONFLICT (userId, tubeId) DO UPDATE
    Note over DB: 1 seule ligne modifiee

    User->>Score: consulte son profil
    Score->>Repo: findByUserId(userId)
    Repo-->>Score: KnowledgeState
    Score->>Domain: validatedSkills(referentielSkills)
    Domain-->>Score: skill_web_1, skill_web_2, skill_web_3
    Note over Domain: skill.difficulty <= floor=3
    Score-->>User: score = sum(pixValue de chaque acquis)
```

---

## 5. Rétrocompatibilité des snapshots de campagne

```mermaid
flowchart TD
    S1["Snapshot v1\narray de KE\nskillId + status + source"]
    S2["Snapshot v2\nmap de tubes\nversion=2, tubeId -> floor/ceiling/directLevels"]

    S1 -->|"deserializeSnapshot()\nconversion a la lecture"| STATE["KnowledgeState"]
    S2 -->|"deserializeSnapshot()"| STATE

    STATE -->|"serializeKnowledgeState()\nau prochain partage"| S2

    style S1 fill:#f9f0d0,stroke:#c8a800
    style S2 fill:#d0f0d0,stroke:#00a800
    style STATE fill:#d0e8ff,stroke:#0066cc
```

---

## 6. Compression volumétrique

```mermaid
xychart-beta
    title "Lignes en base par utilisateur (mediane)"
    x-axis ["KnowledgeElement (avant)", "KnowledgeState (apres)"]
    y-axis "Nombre de lignes" 0 --> 300
    bar [295, 73]
```

| Métrique | Résultat |
|---|---|
| Facteur de compression (lignes DB) | **4,13x** |
| Facteur de compression (snapshots) | **3,22x** |
| Écarts de score expliqués | 649 / 649 (100 %) |
| Impact certifiabilité | 0 gain / 0 perte |
