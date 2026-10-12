# Contribuer

## Workflow git

- Ne jamais travailler sur `main` : une branche par sujet (`feat/…`, `fix/…`, `chore/…`).
- Un commit = une intention, au format Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`). Ne pas mélanger refactorisation et changement de comportement.
- Pull request vers `main`, tests et lint au vert.

## Avant de pousser

```bash
make lint && make test
```

## Conventions

- Backend : `controller → service → repository`, DTO pour toute entrée/sortie d'API ; erreurs explicites (pas de `catch` muet).
- Frontends : pas de code commenté ni de données simulées en production ; l'URL de l'API vient de `VITE_API_URL` (préfixe `/api` inclus).
- Aucun secret dans le dépôt : `.env` et `secrets/` sont ignorés. Toute nouvelle variable est ajoutée à `.env.example`.
- Toute décision structurante est consignée dans `docs/DECISIONS.md`.
