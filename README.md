# Notes: live coding exercise

A cut-down version of our stack: a React Native app, a React web app, and a backend of
Supabase-style edge functions. All three talk to the same notes API.

```
mobile/    React Native (Jest + React Native Testing Library)
web/       React (Jest + Testing Library)
backend/   Edge functions: plain (Request) => Response handlers, in-memory database stand-in
```

**There is no app to run.** No simulator, no browser, no Supabase. The tests are the
interface: each exercise has tests that fail until it is done, and each failing test says
what the user would see.

## Setup

Node 20 or newer.

```bash
npm install
npm run ex1
```

The first run takes a while; it is compiling React Native. After that it is quick.

## How the session works

About an hour. The exercises are independent and each has a time limit. When I call time,
move on. Talk through what you are doing as you go; I am watching, not helping.

At the end I will ask you to zip the folder (without `node_modules`) or push it to a
private repo of your own. Do not push to this repo.

## Exercise 1: five bugs, no AI (20 minutes)

Five bugs in the mobile app, easiest first. Each has one failing test that describes
what the user sees, and each test file starts with how to reproduce it on a device.

```bash
npm run ex1
```

| # | What the user sees | Where |
|---|---|---|
| 1 | Title edits are lost | `mobile/src/screens/NoteEditorScreen.tsx` |
| 2 | The app crashes when there are no notes | `mobile/src/screens/NotesListScreen.tsx` |
| 3 | Notes refresh twice after reopening the list | `mobile/src/hooks/useAppForeground.ts` |
| 4 | Opening a second note shows the first one | `mobile/src/screens/NoteEditorScreen.tsx` |
| 5 | The search filter disappears after 30 seconds | `mobile/src/hooks/useNotes.ts` |

No AI tools for this one. Don't edit the tests.

## Exercise 1B: check your work, with AI (10 minutes)

Now use your AI tool. Have it check your exercise 1 fixes, and fix anything you did not get to.

When you're done, tell me what it changed and whether you agree with it.

## Exercise 2: add "New note" (20 minutes, AI allowed)

The app can only edit notes that already exist. Add creating one, end to end.

- **Backend:** `backend/src/functions/create-note.ts` is a stub. It takes a title and
  content and returns the new note. A note with no title and no content is rejected.
- **Mobile:** a "New note" button on the list opens the editor empty. Save creates the
  note. Back on the list, the new note is at the top straight away.
- **Web:** the same.

The API clients already have `createNote`. The tests say which buttons they look for.

```bash
npm run ex2
```

When you're done, walk me through what changed in each of the three places.

## Bonus: search on the server (10 minutes, AI allowed)

Search happens on the phone today: the app downloads every note and filters locally.
Move it to the backend.

- **Backend:** `list-notes` takes a `q` parameter and returns only matching notes.
- **Mobile:** the notes hook sends the query to the server instead of filtering. Typing
  should not send a request on every keystroke.
- **Web:** add a search box to the list that does the same.

```bash
npm run bonus
```

When you're done, tell me why you would want this on the server rather than the client.
