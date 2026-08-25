# 3. Mécanique des bornes floor / ceiling

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
