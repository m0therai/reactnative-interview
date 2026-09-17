# Notes: live coding exercise

A cut-down version of our stack: a React Native app, a React web app, and a backend of
Supabase-style edge functions. All three talk to the same notes API.

```
mobile/    React Native (Jest + React Native Testing Library)
web/       React (Jest + Testing Library)
backend/   Edge functions: plain (Request) => Response handlers, in-memory Supabase stand-in
```

There is **no app to run**. No simulator, no browser, no Supabase CLI. Jest is the harness
for everything. Each package has its own tests; the root scripts run them per exercise.

## Setup

Node 20 or newer.

```bash
npm install
npm test          # runs every suite in all three packages
```

Some suites fail on a fresh checkout. That is the point: each exercise below tells you which.

## Ground rules

- **Done means code you would merge to production.** Green tests are the floor, not the
  finish line. We review your submission the way we would review a pull request. If a
  test passes but the behaviour is wrong, that counts against you, not for you.
- **Record assumptions in `NOTES.md`.** If a requirement could be read more than one way,
  write down which reading you chose and why. A short line is enough.
- **Commit as you go.** One commit per exercise at minimum. We read the history.
- **Don't edit the tests** unless an exercise tells you to.
- Exercise 1 is done without AI tools. Every other exercise, use whatever you normally use.
- Talk through what you're doing as you go.

## Exercise 1: fix the mobile app (no AI)

Three things are broken in `mobile/`. The failing tests describe the symptoms.

```bash
npm run ex1
```

Make the tests pass. Each fix is a few lines.

## Exercise 2: offline edits (AI allowed)

Edits must sync across devices without losing anyone's work.

The mobile app already queues edits made while offline (`mobile/src/offline/queue.ts`).
Nothing pushes that queue to the server yet.

- **Mobile:** implement `syncQueuedEdits` in `mobile/src/offline/sync.ts`. It runs when
  connectivity returns and must be safe to call repeatedly.
- **Web:** `web/src/components/NoteEditor.tsx` loses what the user typed if the note was
  changed on another device while they were editing. It must not.

```bash
npm run ex2
```

Before you write or generate any code, produce a plan and walk us through it. Then build it.
The tests cover the basics. They do not cover everything the requirement implies.

## Exercise 3: review the share-note branch

Someone ran an AI agent on this repo overnight and it produced the `feature/share-note`
branch: share a note with anyone via a link, across backend, mobile and web. Its tests pass.

```bash
git checkout feature/share-note
npm run ex3
```

The branch was cut from the original `main`, so your Exercise 1 and 2 work is not on it and
those suites still fail there. Only `npm run ex3` matters on this branch.

Review it as if it were a pull request to production.

- Fill in `REVIEW.md` on that branch: what you found, what you changed, and whether you
  would merge it.
- Fix what you would fix before merging. Commit on the branch.
- If you would not merge it at all, say why in `REVIEW.md`.

## Exercise 4 (bonus): fix the summarization function

`backend/src/functions/summarize-note.ts` calls an LLM to summarize a note. The
configuration and prompt have problems. The tests mock the SDK and check what your code
sends to it.

```bash
npm run ex4
```

Be ready to explain your choices: model, temperature, prompt structure, and how you handle
a bad response.

## Submitting

When we stop, push everything (all branches) to a **private** repo and share access, or
zip the folder without `node_modules` and send it over. Do not push to this repo.
