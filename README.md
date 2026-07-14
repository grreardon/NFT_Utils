# NFT Utils

A multi-tenant Discord bot that streams live OpenSea sales into Discord servers. Every server that adds the bot points it at its own NFT collection and its own channel, and the bot posts an embed within seconds of each sale settling on-chain.

Written in TypeScript in 2022, when I was 16. It ran in production against real Discord servers, which is where most of the design below came from: the naive version of this bot works fine for one server and falls over immediately at ten.

## What it does

A server admin runs two commands (`/collection_slug` to pick the collection, `/setup` to pick the channel) and the bot starts posting sales. Everything else is optional configuration.

| Command | Who can run it | What it does |
| --- | --- | --- |
| `/collection_slug <slug>` | Admin | Sets the OpenSea collection this server tracks |
| `/setup <channel>` | Admin | Sets the channel sales get posted to |
| `/salesposting <bool>` | Admin | Toggles the sales feed without losing configuration |
| `/hex <color>` | Admin | Sets the accent color for this server's embeds |
| `/config` | Admin | Dumps the server's current configuration |
| `/stats` | Anyone | Collection stats (volume, floor, owners, supply, and so on) |
| `/floor` | Anyone | Current floor price |
| `/asset <token id>` | Anyone | An asset's image, owner, and full trait list |

## Architecture

```
src/
├─ bot/
│  ├─ commands/     8 slash commands, one class per file
│  ├─ events/       Discord gateway event handlers
│  ├─ cronjobs/     the sales poller
│  └─ index.ts      entrypoint
└─ lib/
   ├─ extensions/   discord.js classes, subclassed
   └─ additions/    data, cache, database, logging layers
```

Four pieces are worth actually looking at.

### The sales poller is the hard part

`src/bot/cronjobs/sales.ts` is where the interesting problems live. OpenSea's events API is rate limited, paginated, and does not push. Polling it correctly for N servers at once means solving four things at once:

**Round-robin scheduling.** The job fires every 7.5 seconds and services exactly one server per tick, cycling through the registered servers in order. This makes API load constant regardless of how many servers the bot is in, instead of scaling linearly with them and immediately tripping the rate limit. Adding the 500th server costs the same number of requests per tick as the first.

**Per-server watermarks with deliberate overlap.** Each server tracks its own `lastTimestamp` and asks OpenSea only for events after it. Rather than advancing the watermark to exactly where the last poll ended, each poll rewinds it 60 seconds and re-reads that window. OpenSea does not index events instantly, so a sale can land in the API slightly after it actually occurred. Reading a strictly disjoint window drops those. Overlapping windows means the bot sees every sale at least once, and hands the deduplication problem off to:

**A bounded dedupe cache.** Because polls overlap, the same sale gets fetched more than once, and posting a sale twice is the most visible possible bug. Each server keeps a `Set` of recently-seen event IDs, capped at 100 and evicted FIFO, so memory stays flat no matter how long the process runs. Hitting an already-seen ID also short-circuits pagination entirely, since events come back newest-first and one known ID means everything past it is known too. The common case (no new sales) costs exactly one API call.

**Rate limits and self-healing.** A `429` from OpenSea puts the job into a backoff that skips an increasing number of ticks (multiplying the skip count by 10 each time it is hit again) rather than hammering a limit that is already angry. Non-429 errors are treated as a dead configuration: if a server deleted the channel, kicked the bot, or revoked its send permission, the bot drops that server from the rotation instead of retrying a request that will never succeed. Bad configurations clean themselves up.

### A read-through cache in front of Mongo

Every command needs the calling server's configuration, so config reads are the hottest path in the bot and MongoDB is the slowest thing it talks to. `DataManager` (`src/lib/additions/DataManager.ts`) sits in front of both stores and makes the cache invisible to callers: reads check Redis, fall back to Mongo on a miss, and populate Redis on the way back so the next read is cheap. Writes go to both, so the cache cannot serve a stale config after an admin changes something.

Every consumer just calls `get`/`set` and gets caching for free. No command in the codebase knows Redis exists.

### discord.js, subclassed rather than wrapped

`src/lib/extensions/` uses discord.js's `Structures.extend` to subclass the library's own `Guild`, `GuildMember`, `Message`, and `Client` classes, so a server's configuration is reachable as `interaction.guild.getSettings()` anywhere a guild object exists. The alternative (threading a settings service through every call site, or reaching into a global) is the thing this avoids. Commands read as if per-server config were a native property of Discord's own objects.

`BetterClient` also carries the bot's own state: the command registry, the loaded cronjobs, and the in-memory map of active server configs that the sales poller round-robins over.

### Filesystem-based registration

Commands, events, and cronjobs are discovered by reading their directories at boot and instantiating whatever they find. Adding a command means adding one file that extends `BaseCommand`. There is no central registry to update and no import list to keep in sync, which is the usual place this kind of bot rots. Slash commands are then bulk-registered with Discord's REST API, scoped to a single test guild in development (instant propagation) and globally in production.

## Stack

TypeScript (strict), Node, discord.js v13, MongoDB, Redis (ioredis), OpenSea API v1.


