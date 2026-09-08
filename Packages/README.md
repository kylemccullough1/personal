# Packages

Shared code that more than one thing in this repo uses. Nothing in here is an application and
nothing in here is deployed on its own.

## What is here now

- `win95-ui/` — the Windows 95 component library the front end is built out of. An npm workspace,
  not a published package: `Api/App` depends on it as `"@duckdgoose/win95-ui": "*"` and npm
  symlinks the folder into `node_modules`. Editing a file in here shows up in the running dev
  server immediately, with no publish and no version bump, because Vite is compiling the source
  and not a build artifact.

## The question this folder was created to answer

> How do I use my individual projects — each with its own repo, its own architecture, its own
> vision — on the portfolio site, without deploying them separately?

**Short answer: you don't reference them at all.** That turned out to be the wrong question, and
the reason is worth writing down because it is not obvious.

There are two different things you might want from another project, and they have completely
different answers:

**1. You want its code** — a type, a rule, a helper that both repos need to agree on.
That is a package. In .NET it is a NuGet `PackageReference`, and across repos it hurts: NuGet
caches by `(id, version)`, so every edit in the other repo means bump the version, pack, clear the
cache, restore here. There is no `npm link` equivalent that makes it painless. Only accept that
cost for something genuinely shared and genuinely stable.

**2. You want the running app** — the thing a visitor clicks around in.
That is not a code reference. It is a URL. The portfolio embeds the deployed app in an iframe,
and the only coupling is one string: `embedUrl` in `Api/App/src/content/projects.ts`. No shared
build, no version to keep in step, no rebuild here when that project ships. Whatever it last
deployed is what the window shows.

Charter Trip is case 2, which is why nothing in this repo references it any more, and why
`Api/Portfolio.Api` has no `ProjectReference` to a project of yours. Each project stays its own
repo with its own architecture — exactly what you wanted — and the portfolio owns nothing but a
link to it.

So this folder holds shared code **within this repo**. A future project of yours belongs in it
only if this repo needs to compile against it, which so far none do.

The full reasoning, including the hosting and cost side, is in
`notes/personal/research/07-architecture.md`.
