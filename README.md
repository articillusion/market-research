# Market Research App (minimal)

Minimal setup to run the mock server for development.

Steps:

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

3. Open http://localhost:4000/ to see the running API.

Prisma setup (optional)
-----------------------

If you want to use Prisma-backed persistence (recommended):

1. Generate Prisma client:

```bash
npx prisma generate
```

2. Apply migrations to create the SQLite database:

```bash
npx prisma migrate dev --name init
```

3. To reset the DB during development:

```bash
npx prisma migrate reset
```

CI note
-------

The included GitHub Actions workflow runs Prisma generate and deploy before running typechecks and tests. If you change the Prisma schema, ensure you add a new migration and push it to the repo.
