---
title: "Beyond JSON: The Evolution of Variant Data Types in Modern Analytics"
date: 2026-04-13 17:00:00 -0700
categories: [Data Engineering, Semi-Structured Data]
tags: [variant, json, snowflake, apache doris, iceberg, parquet, semi-structured, subcolumn extraction, analytics]
description: "JSON stopped being a supporting format and became core business data. Why analytics engines need Variant types to keep up — and how Snowflake, Doris, and Iceberg are solving it."
---

JSON is the one format that every system in your stack already speaks. It is also the one format that most analytics engines still struggle to handle efficiently. Two examples show why this matters more than ever.

**Scenario one.** You have an ETL pipeline that's been running for two years. It reads user behavior events from Kafka, parses JSON, and writes to a structured table in your warehouse. Last week the product team added a set of nested attributes to the event schema. Your pipeline broke. You patched the schema, backfilled the data, and lost another weekend. Next week? Next month?

**Scenario two.** You're building an observability platform for a multi-agent system. Each agent's full execution trace (multi-turn conversation context, LLM inference inputs and outputs, tool-call logs across the full chain, RAG retrieval slices and recall results) is JSON. A single agent trace can run tens of kilobytes to several megabytes, nested seven or eight levels deep, with field structures that change every time the agent code is updated. You want to store it all. You want real-time queries and aggregate analytics. You want to manage a user's complete interaction lifecycle as a first-class citizen in your database, not shove metadata into one store, dump raw JSON into S3, and stitch the pieces back together at query time.

What do these two scenarios have in common?

**JSON is no longer a supporting data format. It is the core business data itself.** And our analytics infrastructure has not fully caught up.

Traditional analytics architectures rest on one assumption: data has a fixed schema. Reality disagrees. Log fields change. API responses change. Agent behavior traces change with every version. In the era of long-context interactions, multi-turn conversations, and AI agents, JSON schemas are not just shifting; the data volumes are exploding. Anthropic's [MCP](https://modelcontextprotocol.io/) and Google's [A2A](https://google.github.io/A2A/) protocols both run on [JSON-RPC 2.0](https://www.jsonrpc.org/specification). [OpenTelemetry](https://opentelemetry.io/docs/specs/semconv/gen-ai/) is defining dedicated trace semantic conventions for generative AI workloads. When multiple agents collaborate, the volume of JSON interactions multiplies fast.

**Data needs to be flexible. Analytics need to be fast. Storage needs to be complete.** In the agent era, all three demands arrive at once, and that is exactly why we need to rethink how we handle JSON.

Can we preserve JSON's flexibility, achieve columnar analytics performance, and natively store large semi-structured payloads all at the same time?

## TL;DR

- **JSON stopped being a supporting format.** It is now core business data — especially with AI agents producing kilobyte-to-megabyte traces at scale. Analytics engines built around fixed schemas are struggling to keep up.
- **Subcolumn extraction is the shared answer.** Frequent JSON fields get pulled into columnar storage automatically; rare or sparse fields stay in binary. Snowflake, Apache Doris, ClickHouse, Apache Iceberg, and Parquet all implement this idea.
- **Three philosophies, not three parameter sets:**
  - **Snowflake** — fully managed, zero knobs, conservative defaults (200-column limit, fall back to binary on type conflict).
  - **Apache Doris** — performance-first, aggressive defaults (2,000-column limit), fine-grained controls (Schema Template, inverted / Bloom / MinMax indexes) when you need them.
  - **Iceberg / Parquet** — open standard, engine-agnostic shredding; formats own data organization, engines own query optimization.
- **Open formats are winning the interoperability layer.** Iceberg Variant + Parquet Shredding move subcolumn extraction out of any single engine's proprietary format. That decoupling is where the industry is converging.

<iframe src="/assets/animations/variant-data-types/index.html"
        style="width: 100%; aspect-ratio: 16 / 9; border: 0; border-radius: 8px; display: block; margin: 1.5em 0; background: #06080B;"
        loading="lazy"
        title="Beyond JSON — Variant data types in 30 seconds"
        allowfullscreen></iframe>

## An Elegant Idea

The answer is **subcolumn extraction**.

The core idea is straightforward. When the storage engine ingests JSON data, it automatically analyzes the field structure and extracts frequently occurring fields into independent columnar storage. At query time, these fields read as efficiently as ordinary structured columns. Fields that were not extracted stay in a binary encoding, so flexibility is never lost.

Here is a concrete example. Suppose you have a stream of JSON events:

```json
{"user_id": 12345, "event": "click", "ts": "2026-04-13T10:00:00Z", "props": {"page": "/home", "duration": 3.2}}
{"user_id": 12346, "event": "purchase", "ts": "2026-04-13T10:01:00Z", "props": {"item": "widget", "amount": 29.99}}
```

After subcolumn extraction, high-frequency fields like `user_id`, `event`, and `ts` are automatically extracted into independent columns, just as if you had built a structured table by hand. The variable nested fields under `props` stay in binary format and are parsed on demand.

**You don't need to define a schema up front. Data arrives and gets written. But query performance approaches that of a pre-defined structured table.**

This is the technical idea behind the Variant data type. No single vendor invented it. [Snowflake](https://docs.snowflake.com/en/sql-reference/data-types-semistructured), [Apache Doris](https://doris.apache.org/docs/4.x/sql-manual/basic-element/sql-data-types/semi-structured/VARIANT), and [ClickHouse](https://clickhouse.com/docs/en/sql-reference/data-types/json) all implement it. [Apache Iceberg](https://iceberg.apache.org/spec/#variant) and [Parquet](https://github.com/apache/parquet-format/blob/master/VariantEncoding.md) are standardizing it as an open format.

The idea is elegant. The engineering is not.

## When the Elegant Idea Meets Real Data

Implementing subcolumn extraction in production, you immediately run into five hard engineering problems. Before reading on, try to think about how you would solve each one.

1. **Column explosion.** JSON can contain thousands of distinct field paths. Extract them all? Metadata bloats, write amplification spikes, and query planning overhead grows fast. How many fields is the right number to extract?
2. **Sparse columns.** Many JSON fields appear in only a small fraction of records. Extracting them creates columns that are almost entirely NULL. How do you handle these gaps?
3. **Type drift.** A field called `price` is an integer in this batch and a string in the next. How does the storage engine handle that change?
4. **Index management.** Dynamically extracted subcolumns need indexes to speed up filter queries, but these columns are created automatically. Who builds the indexes? Who manages them?
5. **Schema controllability.** Fully automatic inference is not always correct. Critical fields need precise type and index definitions. How do users intervene?

These five problems have no "correct" answers, only different design trade-offs. Let's look at how three representative systems respond: Snowflake (a proprietary cloud data warehouse), Apache Doris (an open-source real-time analytics engine), and Iceberg/Parquet (open table format standards). They give three very different answers, and behind those answers lie three completely different design philosophies.

### "We Handle It for You": Snowflake's Fully Managed Philosophy

Snowflake's design philosophy fits in one sentence: **users should not have to care about storage-level details.**

For Variant, this means the system makes nearly every decision automatically. Users get no tuning knobs, and they don't need any.

Column extraction? The system decides, with a default limit of 200 columns per partition. Fields beyond that limit stay in the raw Variant binary. You cannot adjust this threshold unless you contact Snowflake support.

Type conflicts? Say the same field is an integer in one batch and a string in the next. Snowflake's approach is straightforward: don't extract that field. Fall back to Variant binary. Correctness is guaranteed; query performance takes the hit.

Indexing? Snowflake offers the [Search Optimization Service](https://docs.snowflake.com/en/user-guide/search-optimization-service), a managed cloud service. You don't create or manage indexes; the platform handles everything. The cost is an additional service fee, plus no fine-grained control over index strategy.

User controllability? None. Subcolumn extraction is entirely system-driven. If you need precise control, your only option is to abandon Variant and manually use [FLATTEN](https://docs.snowflake.com/en/sql-reference/functions/flatten) to expand JSON into dedicated structured columns.

This is not a flaw. It is a design choice. Snowflake targets organizations willing to pay for "not having to think about it." Zero ops, zero config. The trade-off is flexibility and granular control.

Querying unextracted fields costs roughly 40% to 60% in performance. Fields with inconsistent types fall back entirely to binary. These are known trade-offs, and Snowflake's stance is clear: for most workloads, automatic inference is good enough.

### "Here Are the Knobs": Apache Doris's Performance-First Philosophy

[Apache Doris](https://doris.apache.org/docs/sql-manual/data-types/semi-structured/VARIANT) starts from a different place. As an open-source real-time analytics engine, it typically serves high-concurrency, low-latency query workloads where performance matters at every level.

For Variant, this translates into **aggressive defaults that work well out of the box, with additional controls available when you need them**.

The default column extraction limit is 2,000 (ten times Snowflake's default). For most JSON workloads, this means nearly all of your fields are automatically extracted into columnar storage without any configuration. Low-frequency fields are not discarded; they are packed into a structure called a Sparse Column using JSONB encoding. Queries against these fields still work, just with slightly lower performance than independent columns.

Type evolution also works automatically. Within a single data file, types promote seamlessly: int to bigint to double. Across data files, different types can coexist. The storage layer records type information per file, and the query engine handles compatibility at read time. Instead of falling back to binary on type conflict (as Snowflake does), Doris preserves columnar storage performance wherever possible.

Where Doris really differentiates is in what it offers when you hit edge cases. If your JSON has 5,000 distinct fields, you can raise the extraction threshold. If certain fields need inverted indexes for full-text search or Bloom filters for high-cardinality equality filtering, you can add them. If a critical field like `order_id` must always be stored as BIGINT regardless of what the data looks like, Schema Template lets you pin the type at table creation, with wildcard matching support (for example, `metrics.*`).

The key point: **you don't have to use any of these features to get good performance.** Doris's defaults handle the majority of semi-structured workloads well. The advanced controls exist for teams that encounter extreme column counts, need sub-path-level indexing, or want precise type guarantees on critical fields. They are options, not requirements.

### "We Define the Standard": Iceberg/Parquet's Open Format Philosophy

Iceberg and Parquet are not analytics engines. They are data format standards. Their design starting point differs fundamentally from Snowflake and Doris: **not "how do we process JSON fastest," but "how do we define a format that lets every engine process JSON efficiently."**

The [Iceberg Variant specification](https://iceberg.apache.org/spec/#variant) defines a binary encoding for semi-structured data. [Parquet Shredding](https://github.com/apache/parquet-format/blob/master/VariantShredding.md) defines how to decompose (shred) Variant data into independent columns. Together, they form the open-format version of subcolumn extraction.

In practice, each shredded field produces two columns: `typed_value` (the strongly typed value) and `untyped_value` (the raw Variant binary). At read time, the engine takes `typed_value` first; if it is null, it falls back to `untyped_value`. This dual-track mechanism supports schema evolution naturally. When a field's type changes, older data remains accessible through `untyped_value`.

Column limits? The spec imposes none; the writing engine decides its own shredding strategy. Sparse data? Parquet's definition levels natively support efficient NULL encoding with near-zero storage overhead. Indexing? Parquet provides column-level min/max statistics and Bloom filters as baseline capabilities, but application-level indexes like inverted indexes are left to the engine.

Controllability comes through shredding configuration. In Iceberg v3, users can specify which fields to shred into independent columns via table properties. This configuration is itself a form of schema control.

The significance of this design is **decoupling**. The format handles physical data organization; the engine handles query optimization. Any Iceberg/Parquet-compatible engine (Doris, [Spark](https://spark.apache.org/), [Trino](https://trino.io/), [DuckDB](https://duckdb.org/)) can read and write the same Variant data while layering its own optimizations on top.

This "let the format define the contract, let engines compete on optimization" approach shows up elsewhere in the Iceberg ecosystem — [the community's ongoing secondary-index debate](/posts/how-hard-is-it-to-add-an-index-to-an-open-format/) wrestles with the same tension between standardization and engine independence.

Data is no longer locked inside any single engine's proprietary format.

## Three Philosophies, One Landscape

Viewed side by side, the differences go beyond technical parameters. They represent three distinct product visions:

| | Snowflake | Apache Doris | Iceberg/Parquet |
|---|-----------|--------------|-----------------|
| **Core philosophy** | Fully managed, zero ops | Flexible control, peak performance | Open standard, engine-agnostic |
| **Column limit** | Conservative (200), system-decided | Aggressive (2,000), user-adjustable | No spec limit, engine-decided |
| **Type conflicts** | Fall back to binary, safety first | Type promotion + cross-file coexistence | Dual-track typed/untyped |
| **Indexing** | Managed service, no user management | Inverted/BF/MinMax, sub-path control | Native stats + Bloom |
| **Controllability** | Not available | Schema Template + wildcards | Shredding configuration |
| **Best fit** | Teams that want zero ops | Teams that want performance and flexibility | Ecosystems that want data interoperability |

No single approach wins across every dimension. Your choice depends on your priorities:

- If **zero ops** is your priority, and your team does not want to manage storage details, Snowflake's fully managed approach is the simplest path.
- If you need to extract every ounce of performance in **high-concurrency, low-latency** scenarios, Doris's rich indexing and fine-grained control are the key advantages.
- If your data platform requires **multi-engine interoperability**, and you don't want to be locked into any engine's proprietary format, Iceberg/Parquet is the future-facing choice.

## A Convergence in Progress

Across these three paths, an interesting trend is emerging: **they are converging.**

In the past, every engine's Variant implementation was closed. Snowflake had its own internal storage format. Doris had its own subcolumn storage scheme. Once data was written into an engine, it was locked into that engine's format.

Iceberg Variant and Parquet Shredding are changing this. They extract the core capability of subcolumn extraction from proprietary engine implementations and turn it into a public standard that any engine can read and write.

A new division of labor is forming:

- **Open formats** own data organization and interoperability. Different engines and tools share the same data.
- **Analytics engines** own differentiated query optimization: indexing strategies, vectorized scanning, predicate pushdown, concurrency control.

Here is a concrete example. Apache Doris can read and write Variant data in Iceberg tables — and [as of Doris 4.1, run full DML on V3 tables](/posts/apache-doris-41-iceberg-v3-lakehouse/) from the same SQL client — then build its own inverted indexes on top to accelerate filter queries. Spark can read the same data and run large-scale batch processing in its own way. DuckDB can do interactive analysis on the same data locally. The data is shared; the optimizations are each engine's own.

**Open formats provide the foundation. Engines build their own houses on top.** This is the direction the industry is converging toward.

## Closing Thoughts

Three takeaways.

**Subcolumn extraction is consensus.** Whether we're talking about proprietary cloud warehouses, open-source analytics engines, or open format standards, every major approach automatically extracts JSON fields into columnar storage. The question is no longer "whether to do it," but how to handle the implementation trade-offs.

**Design philosophy matters more than technical parameters.** Whether the column limit is 200 or 2,000, whether type conflicts trigger a fallback or a promotion: these parameters reflect fundamentally different product visions. Understanding *why* each system makes its choices is more valuable than simply comparing *how much* each one does.

**Open standards are the future direction.** Iceberg Variant + Parquet Shredding is moving subcolumn extraction out of proprietary engines and into the open data lake. For teams building next-generation data platforms, this may be the most important trend to watch.

If you're handling large-scale semi-structured data, consider evaluating all three paths for your workload. Don't just run a benchmark. Ask whether each system's design philosophy aligns with your team's operational needs and engineering values.

We'd love to hear about your experience.
