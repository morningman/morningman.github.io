---
title: "How Hard Is It to Add an Index to an Open Format: Lessons from the Apache Iceberg Community"
date: 2026-04-03 14:00:00 -0700
categories: [Data Engineering, Apache Iceberg]
tags: [iceberg, index, open format, big data, architecture]
description: "Adding a secondary index to Apache Iceberg isn't a file-layout problem — it's an ecosystem problem. A walkthrough of the design tradeoffs the Iceberg community is navigating."
---

> The [Apache Iceberg](https://iceberg.apache.org/) community is discussing "secondary indexes." This topic is far more complex than it appears on the surface. Adding an index is not a simple engineering problem of "how to store an index file." It requires deep thinking about how an open format should design an entire indexing ecosystem.

---

## TL;DR

If you are short on time, here are the core takeaways:

*   **The goal is not a single index:** The primary task for the Iceberg community is to define a universal foundation. Developers are currently standardizing the index lifecycle, snapshot binding relationships, and the Catalog API.
*   **The first candidate is mostly clear:** The [Bloom filter](https://en.wikipedia.org/wiki/Bloom_filter) skipping index (backed by Puffin) is the most likely candidate to land first. It requires zero changes to the write path and offers extremely clear correctness semantics.
*   **More powerful indices are coming later:** The community is exploring [B-Tree](https://en.wikipedia.org/wiki/B-tree), full-text search, and even vector indices. These will likely rely on Materialized Views or independent native structures in the future.
*   **The real challenges lie in the deep waters:** The true technical disagreements are not about specific file formats. Instead, engineers are debating update timing (sync vs. async), metadata placement, and how to maintain open compatibility across multiple write engines.

---

## 1. Iceberg Is Already Powerful. Why Does It Need Indexes?

Apache Iceberg already excels at data pruning. The format provides several mechanisms to skip irrelevant data:

*   **Partition Pruning:** Queries only scan data files within matching partitions.
*   **Manifest-Level Filtering:** Each manifest file records statistical summaries for all the data files it manages.
*   **File-Level Statistics:** Every data file tracks minimum values, maximum values, and null counts for each column.
*   **Format-Built-in Filtering:** Features like [Parquet](https://parquet.apache.org/) row-group statistics and [ORC](https://orc.apache.org/) bloom filters also participate in filtering.

Together, these mechanisms help query engines eliminate massive amounts of irrelevant data before they even open a data file.

So, why is the Iceberg community still seriously discussing secondary indexing?

The answer is simple: **In certain specific scenarios, the limitations of current mechanisms are painful enough for users.**

### 1.1 The "Needle in a Haystack" Scenario

Imagine you have an `orders` table holding 700 million records distributed across 700 Parquet files. You want to query all orders for a specific user:

```sql
SELECT * FROM orders WHERE user_id = 987654321;
```

Iceberg can filter out some files using partition pruning and file-level statistics. But if `user_id` is not a partition column, and the `user_id` ranges across files overlap heavily (since a user's orders might land in files from different time periods), the query engine might still need to open 658 files to find the single file that actually contains the target user.

This creates the classic **Needle in a Haystack** problem.

### 1.2 The Rise of AI and Vector Search

As [RAG (Retrieval-Augmented Generation)](https://en.wikipedia.org/wiki/Retrieval-augmented_generation) and multimodal search workloads enter the data lake, queries looking for "the K most similar records to a given vector" are becoming increasingly common. Existing min/max statistics offer almost no help for vector retrieval.

### 1.3 Read Amplification in Deletion Scenarios

Iceberg supports the Merge-on-Read (MOR) mode for handling updates and deletions. Deletions do not modify the data files directly. Instead, engines write them to separate delete files. When a table accumulates many equality delete files, the read path must reconcile every file to figure out which rows were deleted. This causes severe read amplification.

---

These three pain points reveal that Iceberg is not just looking for another optimization trick. The community is addressing a more fundamental issue:

> **In an open table format, how do we express and maintain multiple "alternative access paths" in a snapshot-aware, engine-agnostic way?**

This is the essence of the "index" concept.

---

## 2. Why Is "Adding an Index" So Hard?

In traditional databases like [MySQL](https://www.mysql.com/) or [PostgreSQL](https://www.postgresql.org/), adding an index to a table is entirely natural. Why does introducing indexes to Iceberg spark endless discussions and require countless design trade-offs?

The core reason is this: **Iceberg is an open format, not a closed storage engine.**

### 2.1 Who Writes the Index?

In a traditional database, the database itself maintains the indexes. You write the data, the database updates the indexes synchronously, and the user never needs to worry about the underlying details.

However, Iceberg relies on completely different engines (like [Spark](https://spark.apache.org/), [Doris](https://doris.apache.org/), [Trino](https://trino.io/), and [Dremio](https://www.dremio.com/)) to write data. If the Iceberg specification forced engines to synchronously update indexes during writes, several problems would arise:

*   Every writer would need to implement the index update logic.
*   Different engines might implement the same index type in drastically different ways.
*   The barrier to entry would rise significantly, and older engine versions would immediately lose compatibility.

Therefore, the first fundamental disagreement the community faces is: **Should index maintenance be synchronous or asynchronous?**

**The case for asynchronous maintenance:**
The system does not enforce index updates during writes. Instead, background jobs (similar to compaction) rebuild or merge indexes periodically. This approach imposes zero intrusion on writers and offers more flexibility.

**The case for synchronous maintenance:**
Some scenarios demand immediate index availability. For instance, high-concurrency point lookups need to work right after real-time writes. If the index always lags behind the data, the system introduces too much uncertainty for users.

**Current community consensus:** We prioritize asynchronous maintenance and treat synchronous updates as an optional enhancement.

### 2.2 Where Does Index Metadata Live?

This is another core issue that has stalled conversations.

Iceberg's TableMetadata currently records schema details, partition rules, and the snapshot chain. Stuffing index definitions and status states into this file would make the table metadata increasingly bloated. But if developers isolate the index metadata completely, query engines must issue an extra network request to read index information during query planning. This increases planning latency. That "entry cost" could completely offset the performance gains the index provides.

The current compromise direction is:
*   We will store the comprehensive index metadata in an independent location.
*   The table metadata will retain a lightweight reference or a quick-check interface. This allows the planner to quickly determine if a query can use a specific index and whether that index is valid for the current snapshot.

### 2.3 Binding Indexes to Snapshots

This challenge is unique to Iceberg. Iceberg datasets exist as versioned snapshots. You can query yesterday's snapshot just as easily as you query the current one.

This raises a tricky question: **If you build an index on snapshot_v5, is it valid for a query targeting snapshot_v3?**

The answer is not a simple "yes" or "no." It depends entirely on what happened between those two snapshots. If the system only appended data, the index might still be valid (just incomplete). If compaction or schema changes occurred, the index likely became invalid.

This requires the indexing system to track its own "freshness" and actively verify its validity during use.

### 2.4 Metadata-Only Changes Can Invalidate Indexes

There is an even more subtle problem: **Indexes do not only need updates when data files change.**

Consider a scenario where you add a new column to a table and specify a default value. This operation does not rewrite the old data files. However, during a query, those old records logically "possess" this new default value. If you happen to have an index on this column, the content of that index is now expired, even though the underlying files remain completely unchanged byte-for-byte.

This means the index maintenance logic must detect more than just data file modifications. It also needs to sense schema changes, default value updates, and other metadata-only operations.

### 2.5 The Framework Layer vs. The Feature Layer

Facing all these complexities, the community realized something crucial: **Before implementing any specific index, we must first build a unified indexing framework.**

This framework needs to answer the following questions:
*   What type of object is an "index" within Iceberg?
*   How do indexes establish relationships with table snapshots?
*   How does the Catalog manage the index lifecycle?
*   How does the system differentiate between a "mandatory index" and an "advisory index"?

Building the framework is the correct step, but it is also the most time-consuming. You must secure broad consensus before all engines can implement features according to a unified standard.

---

## 3. How Is the Community Solving This Dilemma?

Faced with the dilemma of "standardize the framework first" versus "build a concrete feature first," the Iceberg community adopted a pragmatic strategy: **Advance both simultaneously and let them validate each other.**

*   **Track 1: A universal index framework.** The community is defining the index object model, metadata organization, catalog APIs, and lifecycle semantics in Iceberg.
*   **Track 2: Bloom Filter Skipping Index as Phase 1.** Developers are using a specific index with the clearest possible boundaries to prove whether the framework design actually works.

This strategy is very practical. The framework gets a concrete implementation to keep it grounded. Meanwhile, the concrete implementation uses the framework to ensure it is not a short-sighted, one-off solution.

---

## 4. The Solution Landscape: Five Forms of Indexes

Let us examine the various index proposals surfacing in community discussions. They are not competing against each other. Instead, they represent parallel paths aimed at different problems and sitting at different maturity levels.

### 4.1 Bloom Filter Skipping Index: The Closest to Reality

**What problem it solves:** This targets the "needle in a haystack" scenario by eliminating irrelevant files before the engine even attempts to open them.

**How it works:**

Developers build a Bloom filter for a target column (like `user_id`) on a per-data-file basis. They store this Bloom data in a Puffin file (Iceberg's container format for statistics and index data).

When a query arrives:

```
query: SELECT * FROM orders WHERE user_id = 987654321

1. The system performs standard partition and statistical pruning -> leaving 658 candidate files.
2. The planner reads the Bloom data from the Puffin file (without opening any data files).
3. The Bloom filter determines that out of 658 files, only 1 "possibly contains" this user_id.
4. The query engine ultimately scans only this 1 file.
```

We must establish a critical understanding here: **A Bloom filter will only tell you "possibly yes" or "definitely no." It never gives a false negative, but it can give a false positive.** Therefore, it functions as a **Skipping Index** rather than a traditional index that points directly to specific rows.

**Best use cases:**
*   Point lookups on high-cardinality fields (like user IDs, device IDs, or order numbers).
*   Small `IN (...)` set queries.
*   Environments with massive file counts where object storage read penaltites are high.

**Its limitations:**
*   It cannot return results directly; it only reduces the candidate file count.
*   It offers limited benefits for low-selectivity predicates (like `WHERE status = 'active'` which hits many files).
*   The system requires extra overhead to manage Bloom data creation, updates, and expiration.

**Why the community expects it to land first:**
The use case is clear. The correctness semantics are simple to define (it affects performance, not query results). Engineers can build it asynchronously, and it does not require changes to the write path. As of March 2026, the corresponding Proof of Concept (PR #15311) already shows significant results, successfully dropping candidate file counts from 658 down to 1 in specific test scenarios.

---

### 4.2 B-Tree / Covering Index: Closer to Traditional Databases

**What problem it solves:** The goal moves beyond skipping files. The system attempts to "use the index to directly answer the query."

**How it works:**

The engine designates a column or group of columns as a key and stores other frequently queried columns directly inside the index structure (this is the definition of "covering"). When querying:

```sql
SELECT user_id, last_name, first_name FROM persons WHERE nationality = 'CN';
```

If a covering index exists with `nationality` as the key and includes `user_id, last_name, first_name`:

```
1. The engine locates nationality = 'CN' within the index.
2. It reads user_id, last_name, first_name directly from the index.
3. It bypasses the main data files entirely.
```

Unlike Bloom filters, this type of index does more work. It does not just tell the planner where to look; it **actively participates in answering the query.**

In community discussions, developers will likely back this type of index using a **[Materialized View](https://en.wikipedia.org/wiki/Materialized_view)**. Essentially, this means maintaining an extra Iceberg table optimized and sorted by the index key.

**Why it is not the top priority yet:**
The implementation complexity for B-Tree/Covering indexes far exceeds Bloom filters. It involves redundant data storage, update maintenance, and query rewrite capabilities inside the engine itself. If an engine cannot recognize and rewrite a query to use the index path, the universal value of this index across different engines drops significantly.

---

### 4.3 Full-Text / Term Index: Bringing Search to the Lakehouse

**What problem it solves:** This supports text search, allowing users to execute inverted retrievals directly within the data lake.

**How it works:**

You can intuitively understand a full-text index as an "inverted table":

```
Original data:
  doc1: "iceberg secondary index"
  doc2: "iceberg metadata"
  doc3: "vector index"

Term Index (Inverted structure):
  iceberg   -> [doc1, doc2]
  secondary -> [doc1]
  index     -> [doc1, doc3]
  metadata  -> [doc2]
  vector    -> [doc3]
```

When querying `"iceberg secondary index"`, the system consults the inverted table to find candidate documents, then fetches the full data from the main table as needed.

**Its challenges:**
Building a true full-text search system requires much more than maintaining a simple postings list. Tokenization rules, scoring models, phrase matching, and positional information will all trigger fierce standardization debates. The central controversy is this: How deep should the Iceberg core specification define the standard for "full-text retrieval"? If defined too shallowly, every engine creates an inconsistent implementation. If defined too deeply, the overhead becomes immense, far exceeding the responsibilities of a table format.

**Current status:** The community has incorporated it into the general index framework discussions, but it remains in the early conceptual stages.

---

### 4.4 Vector Indexes (IVF / ANN): The Demand of the AI Era

**What problem it solves:** This supports [approximate nearest neighbor (ANN)](https://en.wikipedia.org/wiki/Nearest_neighbor_search#Approximate_nearest_neighbor) search, helping Iceberg natively handle AI retrieval workloads.

**How it works:**

The core logic of a vector index (like IVF, or Inverted File Index) operates like this:

```
Input: An embedding vector
1. The system locates the closest "cluster centroid" in the index.
2. The engine scans only the candidate vectors belonging to that cluster.
3. It calculates exact distances and returns the top-k results.
```

**Why the community is prioritizing this direction:**
AI workloads like RAG, multimodal search, and semantic retrieval are flooding into data infrastructure. If Iceberg can natively manage vector data and its retrieval indexes, engineering teams gain unified version control and governance across their training data, vector data, and indexes.

**Why it is difficult:**
Vector indexes come in an overwhelming variety (IVF-PQ, HNSW, DiskANN, etc.). They differ drastically in distance functions, recall rates, latency, and quantization methods. Standardization is an order of magnitude harder than with Bloom filters. The current community split focuses on this question: Should we start with a simpler MV-backed approach, or leap straight into designing dedicated native vector index structures?

**Current status:** The open-source community has dedicated issues and proposals reviewing this, but no unified implementation is close to deployment.

---

### 4.5 Delete/MOR Acceleration Index: Optimizing Iceberg's Real Pain Points

**What problem it solves:** This accelerates the Merge-on-Read path when dealing with massive numbers of delete files.

This is a relatively "internal" index optimization. It does not expose itself directly to SQL users; instead, execution engines quietly leverage it during scanning:

```
1. The engine begins reading data file A.
2. It internally queries the delete acceleration index.
3. If the index shows no deleted records overlap this file -> the system skips the delete reconciliation step entirely.
4. If there is a hit -> the system retrieves the precise row positions and processes only the affected rows.
```

This index carries massive business value for "write-heavy, delete-heavy" upsert scenarios. It directly slashes the row-by-row validation costs during the MOR read path.

**Current status:** Developers proposed this in a previous issue that was later marked "not planned." However, it reappeared in the 2026 index synchronization agenda. This indicates the community has not abandoned the need, but simply deprioritized it from the current mainline plan.

---

## 5. A Horizontal View: How Do These Five Indexes Relate?

We can arrange these five proposals into a table to clarify their core positioning:

| Index Type | Core Goal | Directly Answers Queries? | Typical Storage Form | Current Maturity |
|---|---|---|---|---|
| Bloom Skipping Index | Reduces invalid file scans | No, only skips files | Puffin | Most advanced POC |
| B-Tree / Covering Index | Supports direct positioning and avoids table access | Potentially yes | MV-backed Iceberg table | Proposal stage |
| Full-text / Term Index | Supports inverted retrieval | Subject to design | Postings table / MV | Early concepts |
| Vector Index (IVF/ANN) | Supports approximate nearest neighbor search | Subject to design | MV-backed or native structures | Early discussions |
| Delete/MOR Acceleration Index | Optimizes read paths in deletion scenarios | No, acts as an internal engine optimization | Specialized metadata | Not main priority |

Here is a one-sentence summary for each index's core positioning:

*   **Bloom:** Reduces invalid file scanning operations.
*   **B-Tree/Covering:** Shortens data retrieval paths and strives to skip main table access.
*   **Full-text:** Provides users with inverted text retrieval capabilities.
*   **Vector:** Equips the system with AI nearest-neighbor retrieval tools.
*   **Delete/MOR Index:** Heavily optimizes read path performance during updates and deletions.

**They solve completely different problems and target entirely different workloads.** This explains why establishing a universal indexing framework is so critical. Without a unified object model and lifecycle management system, these index types would easily fragment into isolated implementations across different engines.

---

## 6. What Is the Community Still Debating?

While developers have reached a preliminary consensus on the broad technical direction, several major disagreements remain unresolved:

### 6.1 A Conceptual Dispute: Is Bloom a "Real" Index?

This is absolutely not a boring semantic game. The conclusion dictates whether developers attach Bloom under the unified IndexCatalog or place it closer to the "enhanced file statistics" side of the codebase.

One faction argues: Bloom has independent metadata, separate maintenance workflows, and actively alters the query access path. Therefore, it is definitely an index.

The opposing faction insists: Bloom itself never directly returns rows; it merely helps the planner exclude some files. It acts more like a massive upgrade to file-level stats. It does not qualify as a "true secondary index."

This theoretical divide impacts the next design decision: Does our universal index framework need to prioritize index types that align more closely with "traditional database definitions"?

### 6.2 Can Materialized Views Represent Certain Indexes?

The community repeatedly surfaces this idea: Some indexes do not require inventing brand new file formats. Reusing an additional Iceberg table to host them is perfectly sufficient.

The benefits are obvious. We reuse mature existing capabilities, making implementation extremely straightforward. The core controversy, however, centers on boundaries. If this "index table" requires the query engine to perform query rewriting just to use it, is it truly a unified indexing capability at the Iceberg level? Or is it simply an internal optimization trick living inside the engine?

### 6.3 The Design Dilemma of Mandatory Indexes

If the community eventually allows users to declare a specific index as "mandatory" (must be maintained), this move will trigger a cascade of difficult secondary problems:
*   Should the system ruthlessly block older legacy writers that cannot update indexes from writing to the table?
*   How does the system enforce strict atomicity between normal write commits and the corresponding index updates?
*   Should the execution engine hold this vital coordination responsibility, or should the catalog step in to orchestrate it uniformly?

Currently, the mainstream discussion leans this way: Do not demand that all writers natively support every complex index type. Doing so would immediately raise the barrier to entry, a move that contradicts Iceberg’s fundamental identity as an open data format.

---

## 7. What Do We Learn from the Iceberg Discussions?

If you are a developer interested in index design, these extensive Iceberg discussions are not just internal open-source trivialities. They offer a rare, complete, and public walkthrough of a massive systemic problem: "How to design an index architecture for an open format."

We can extract a few critical insights essentially for system design:

**1. "Index" is never a singular technical concept.**

Bloom filters, B-Trees, full-text indexes, and vector indexes target completely different problem categories. They require drastically different underlying storage structures and daily maintenance mechanisms. Therefore, "supporting indexes" never means doing just one thing; it means handling an entire category of related tasks.

**2. Designing indexes for open formats is much harder than for closed engines.**

In the closed world of traditional databases, the engine possesses uncompromising, total control over its storage media. This allows the engine to flawlessly bind index updates to the core write process. Iceberg, however, must define precise semantics, full-lifecycle management, and data consistency guarantees while facing the harsh reality of uncontrollable, diverse writers. This difficulty stems from the architectural essence, not just code-level implementation.

**3. Comprehensive metadata design is the true deep-water challenge.**

Understanding "how to save a Bloom filter file to a hard drive" is not a real system challenge. That is a basic engineering task. The truly difficult bottlenecks are these: Which exact data snapshot does this newly generated index tie to? Under what specific conditions does it expire? How does a query engine efficiently and cheaply check if a valid index is available right now? More often than not, these complex design questions hold far more life-or-death importance than the physical format of the index file itself.

**4. There is an irreconcilable tension between absolute consistency and peak performance.**

Choosing between safe synchronous updates and fast asynchronous ones, or deciding between strict mandatory indexes and best-effort advisory ones—every architectural path represents a painful, calculated tradeoff between strict data consistency and the quest for ideal performance. There is no universally correct, ultimate answer. There are only temporary compromises that fit specific workload demands better at a given time.

**5. Building the foundational framework first is far more important than rushing out a single feature.**

Looking past the surface, we see that the Iceberg community resolutely chose a steady path: "Build a universal indexing framework first, then use Bloom specifically to validate it." This choice proves they clearly understand a painful systems lesson. If they allow every different index to invent its own metadata format and isolated lifecycle rules, they might save effort today, but they guarantee utter architectural chaos in the long run.

---

## 8. Current Progress and Future Outlook

As of late March 2026, the Iceberg community has not yet successfully merged an official, complete secondary index specification. However, two core Proof of Concept (POC) proposals remain highly active and open for serious formatting and debate:

*   **PR #15101 (Universal Index Framework):** This patch attempts to precisely define independent objects like IndexType, Index, IndexVersion, and IndexSnapshot, alongside standard catalog APIs like listIndexes and createIndex.
*   **PR #15311 (Bloom filter POC):** This effectively demonstrates how the system can successfully reduce a candidate file pool from 658 files down to just 1 in a rigorous "needle in a haystack" retrieval scenario.

Overall, the mainstream consensus envisions this final form:

> **The Iceberg core specification standardizes the index object models, snapshot binding relationships, Catalog APIs, and lifecycle semantics. Meanwhile, it allows different index types to adopt the storage mediums that suit them best: Bloom uses Puffin; B-Tree/Covering uses materialized views; and vector indexes might rely on dedicated native structures.**

This design philosophy avoids forcing a single format onto all indexes. It aligns perfectly with Iceberg's historical trajectory: remaining open, expansible, and fiercely independent of any single query engine.

---

## Conclusion

Iceberg's extensive discussion surrounding indexes delivers a vivid, public masterclass in architecture design. It serves as a strong reminder to all software developers and architects: "Adding an index" to an open format system is never as easy as merely saving a file.

To introduce an index into a foundational data format like Iceberg—one hosting a massive ecosystem and multiple engine integrations—you must navigate deep waters. You have to resolve metadata binding mechanics, lifecycle management, strict consistency guarantees, and compatibility strategies across varying snapshots. Every problem you solve requires a difficult, precise tradeoff between consistency and performance.

If you enjoy exploring these backend logic subjects and architectural evolutions, I strongly recommend reading the original discussions in the community mailing lists and PRs. That is where you will find the freshest, most vibrant engineering design wisdom on the front lines.

**References:**
*   [PR #15101: Secondary Index metadata handling POC](https://github.com/apache/iceberg/pull/15101)
*   [PR #15311: Bloom filter index POC](https://github.com/apache/iceberg/pull/15311)
*   [Community Mailing List: Secondary Indexes Phase 1](https://www.mail-archive.com/dev%40iceberg.apache.org/msg12189.html)
*   [Issue #13000: Improving MOR Query Performance With Indexing](https://github.com/apache/iceberg/issues/13000)
