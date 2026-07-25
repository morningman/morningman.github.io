# HOW-TO-PUBLIC-POST

把一篇普通的 Markdown 稿件，转换成本站（Jekyll + Chirpy 主题）可发布的博客文章的**文件改动手册**。

**范围**：本文档只覆盖"要新增哪些文件、要改哪些文件、每个文件写成什么样"。本地构建、校验、提交、部署、收录提交等操作不在范围内，由人工另行处理。

**面向对象**：人工操作者，或被指派"把这篇稿子改造成本站文章"的 AI agent。

**使用方式**：按 §1 的总览表逐项落地，§2–§7 给出每一项的精确规则。§9 是可勾选的 checklist，§10 是可复制的空白模板。

**相关文档**：
- `SEO-GEO-SOP.md` — SEO/GEO 的长期维护 SOP（周期性检查、标签词表治理、站点级基础设施）。本文档是"单篇改造"的落地规则，标签词表以 `SEO-GEO-SOP.md` §3 为准。
- `prompt/style.md` — 配图的统一视觉风格提示词。

---

## 1. 一次发布需要新增/改动哪些文件

| # | 文件 | 动作 | 是否必须 |
|---|---|---|---|
| 1 | `_posts/YYYY-MM-DD-<slug>.md` | 新增 | ✅ 必须 |
| 2 | `assets/img/posts/YYYY-MM-DD-<slug>-og.png` | 新增 | ✅ 必须 |
| 3 | `assets/img/posts/YYYY-MM-DD-<slug>/fig-N-<desc>.png` | 新增 | 有配图时必须 |
| 4 | `prompt/YYYY-MM-DD-<slug>.md` | 新增 | 推荐 |
| 5 | `llms.txt` | 改：`## Posts` 段首插一条 | ✅ 必须（最容易漏） |
| 6 | 相关的 `_posts/*.md`（老文章） | 改：加回链 | 有关联时必须 |
| 7 | `SEO-GEO-SOP.md` §3 | 改：补标签词表 | 仅当引入新标签 |

**不需要动的文件**（自动生成或站点级配置）：

- `sitemap.xml` — 由 `jekyll-sitemap` 构建时自动生成，仓库里没有这个文件，**不要手工维护**。
- `feed.xml` — 同上，自动生成。
- 分类页 / 标签页 / 归档页 — 由 `jekyll-archives` 按 `_config.yml` 的 `jekyll-archives.permalinks` 规则自动生成。只要 front matter 里的 `categories` / `tags` 写对就有。
- `robots.txt` — 站点级 AI 爬虫策略，新增文章不需要改。
- `_config.yml` — 站点级配置，新增文章不需要改。
- 文章里的 `last_modified_at` — 由 `_plugins/posts-lastmod-hook.rb` 从 git 历史自动注入（文件有 >1 次提交时生效），**不要手写这个字段**。

---

## 2. 目录与命名规则

### 2.1 正文

```
_posts/YYYY-MM-DD-<slug>.md
```

- **日期**：发布日（或更早），与 front matter 里的 `date` 保持一致。
- **slug**：全小写、英文、单词之间用 `-` 连接，不带日期。
- slug 直接决定线上 URL。`_config.yml` 里 `permalink: /posts/:title/`，`:title` 取自文件名去掉日期前缀的部分：

  ```
  _posts/2026-04-24-doris-41-vector-index.md
    → https://morningman.vip/posts/doris-41-vector-index/
  ```

- slug 应短、含核心实体（产品名/技术名），不要照抄整个标题。参考现有：
  - `doris-41-vector-index`
  - `segment-v3-vs-open-formats`
  - `doris-lance-rust-integration`
  - `beyond-json-variant-data-types`
  - `apache-doris-41-iceberg-v3-lakehouse`
- **slug 一旦发布不要改**，改了等于换 URL，会丢掉已有收录和外链。

### 2.2 图片

图片一律放在 `assets/img/posts/` 下，分两类：

**（a）OG 封面图 —— 平铺在 posts 目录，文件名带 `-og` 后缀**

```
assets/img/posts/YYYY-MM-DD-<slug>-og.png      # 或 .jpg
```

即前缀与正文文件名完全一致，只是把 `.md` 换成 `-og.png`。规格 1200 × 630。

**（b）正文配图 —— 每篇文章一个同名子目录**

```
assets/img/posts/YYYY-MM-DD-<slug>/fig-<N>-<short-desc>.png
```

子目录名 = 正文文件名去掉 `.md`。图片文件名用 `fig-` 开头，编号 + 短描述，全小写连字符。两种编号风格都在用，任选其一但一篇之内保持统一：

- 顺序编号：`fig-1-three-architectures.png`、`fig-2-hnsw-vs-ivf.png`
- 章节编号（图多、需要对应到小节时）：`fig-1-2-footer-first-flow.png`、`fig-6-1-segment-v2-vs-v3.png`

正文里一律用**站点绝对路径**引用（以 `/` 开头，不要用相对路径）：

```markdown
![完整的英文 alt 描述](/assets/img/posts/2026-04-24-doris-41-vector-index/fig-1-three-architectures.png)
```

> 允许把某张正文配图直接复用为 OG 图（`2026-04-23-segment-v3-vs-open-formats` 就是这么做的，`image.path` 直接指向子目录里的 `fig-1-4-*.png`）。这种情况下可以不单独产出 `-og` 文件。

### 2.3 动画 / 交互内容（可选）

HTML 动画放在：

```
assets/animations/<name>/index.html
```

正文中用 iframe 内嵌（放在 TL;DR 之后、正文第一个 H2 之前）：

```html
<iframe src="/assets/animations/doris-iceberg-v3/index.html"
        style="width: 100%; aspect-ratio: 16 / 9; border: 0; border-radius: 8px; display: block; margin: 1.5em 0; background: #05080B;"
        loading="lazy"
        title="Apache Doris 4.1 × Iceberg V3 — 30s animation"
        allowfullscreen></iframe>
```

动画的开发中版本放在 `draft/<name>/`（`draft/` 是草稿区，不参与站点内容组织）。

### 2.4 配图提示词

```
prompt/YYYY-MM-DD-<slug>.md
```

文件名与正文同名。`prompt/` 已在 `_config.yml` 的 `exclude` 里，不会被发布。内容结构参考 `prompt/2026-04-23-segment-v3-vs-open-formats.md`：

````markdown
# OG image prompt — <文章短标题>

**Post:** [/posts/<slug>/](../_posts/YYYY-MM-DD-<slug>.md)
**Output path (after generation):** `/assets/img/posts/YYYY-MM-DD-<slug>-og.png`
**Dimensions:** 1200 × 630 px (OG standard)

---

```
<粘贴 prompt/style.md 的完整风格段，然后接本图的 Scene 描述>
```
````

### 2.5 一张表总结

以 `2026-05-15-paimon-doris-streaming` 这篇假想文章为例，落盘的文件是：

```
_posts/2026-05-15-paimon-doris-streaming.md
assets/img/posts/2026-05-15-paimon-doris-streaming-og.png
assets/img/posts/2026-05-15-paimon-doris-streaming/fig-1-lsm-on-object-storage.png
assets/img/posts/2026-05-15-paimon-doris-streaming/fig-2-cdc-pipeline.png
prompt/2026-05-15-paimon-doris-streaming.md
```

---

## 3. Front matter 规范

正文开头必须是 YAML front matter，字段**按下列顺序**书写，7 个字段全部必填：

```yaml
---
title: "Apache Paimon on Doris: Streaming Meets MPP"
date: 2026-05-15 10:00:00 -0700
categories: [Data Engineering, Apache Paimon]
tags: [apache paimon, apache doris, lakehouse, cdc, streaming]
description: "How Apache Doris integrates with Paimon's LSM-on-object-storage design, and what changes when streaming writes meet MPP analytics."
image:
  path: /assets/img/posts/2026-05-15-paimon-doris-streaming-og.png
  alt: "Apache Doris reading from a Paimon table with streaming writes flowing in"
---
```

逐字段规则：

| 字段 | 规则 |
|---|---|
| `title` | 英文，**用双引号包裹**（标题里常有冒号，不加引号会让 YAML 解析失败）。< 70 字符，必须包含核心实体/产品名。常用"主概念: 副标题"结构。 |
| `date` | `YYYY-MM-DD HH:MM:SS ±HHMM`，**必须带时区偏移**。站点时区 `America/Los_Angeles`：夏令时用 `-0700`，冬令时（11 月初～3 月初）用 `-0800`。 |
| `categories` | 数组，1–2 个。第一个固定 `Data Engineering`（现有全部文章如此，它是分类树的父节点）；第二个是具体领域。现有取值：`Apache Doris` / `Apache Iceberg` / `Semi-Structured Data`。 |
| `tags` | 数组，**4–7 个**，只能从 §5.2 的固定词表里取。全小写，词间用空格（不是连字符），URL 由 jekyll-archives 自动 slug 化。 |
| `description` | **120–160 字符**，包含主关键词，能独立成句地当搜索结果摘要读。不要写成"本文介绍…"式的空话，直接给结论或具体机制。 |
| `image.path` | OG 图的站点绝对路径，1200 × 630。 |
| `image.alt` | OG 图的无障碍描述，一句完整英文，描述图里画了什么。 |

**关键约束：`date` 不能是未来时间。** Jekyll 默认不构建未来日期的文章，写成未来时间等于这篇文章不存在（历史上踩过：commit `fddf42d` 就是把日期改回过去才发布成功）。

**不要加的字段**：`layout`（`_config.yml` 已 default 为 `post`）、`toc`（已 default `true`）、`comments`（已 default `true`）、`last_modified_at`（插件自动注入）、`permalink`（全局规则统一）。

---

## 4. 正文内容与结构要求

### 4.1 硬性要求

- **全英文**。本站是英文博客，正文、标题、alt、图注、代码注释一律英文。中文稿件必须先完整翻译改写，不是逐句直译 —— 按英文技术写作的节奏重组。
- **不要在正文里再写一遍 H1 标题**。`title` 由主题渲染，正文从第一段直接开始。
- **正文最高层级是 H2（`##`）**，小节用 H3（`###`）。Chirpy 用 H2/H3 自动生成右侧 TOC，层级错了 TOC 就乱。

### 4.2 推荐骨架

```markdown
---
<front matter>
---

<开场 2–4 段：具体场景或问题，落到细节上。禁止 "In today's fast-paced world..." 这类 AI 味开场。
 可以用引言块 > 起手，也可以直接叙述，两种现有文章都有。>

## TL;DR

- <要点 1：直接给结论/数字，不铺垫>
- <要点 2>
- ...
（4–7 条）

<可选：iframe 动画嵌入>

## 1. <第一个大节，标题里带命名实体>

### 1.1 <小节>

![alt 描述](/assets/img/posts/<date>-<slug>/fig-1-xxx.png)

...

## <末节：CTA / Getting Started / Closing>

- **Read the spec**: [...](...)
- **Download**: [...](...)
- **Questions or feedback**: [...](...)
```

### 4.3 各部分的具体要求

**开场**
2–4 段把问题落到具体场景（某个报错、某次凌晨排障、某个真实的 schema 变更），2 句之内让读者知道这篇讲什么。介绍陌生产品时给一句"是什么"的定位并带官网链接。

**TL;DR（必须有）**
放在开场之后、第一个 H2 之前，用 `## TL;DR` 作为独立 H2。4–7 条 bullet，每条直接给可验证的结论、数字或机制名。这一块是 skim 读者和 LLM 引用时抓取率最高的部分，写作优先级最高。

**章节标题**
- H2 里放命名实体（`Apache Doris`、`Iceberg V3`、`Deletion Vector`），不要写成 `Background` / `Overview` / `Conclusion` 这种纯功能词 —— 实体名对 LLM 检索有效，功能词没有信息量。
- 章节可以编号（`## 1. Where Vector Search Should Live`），也可以不编号（`## Bringing DML Back to the Query Layer`）。一篇之内统一即可。
- 长文可在 TL;DR 里加一句锚点跳转：`jump to [Quick Start](#quick-start-try-it-in-five-minutes)`。锚点是标题小写、空格转 `-`、去掉标点后的结果。

**图片**
- 每张图必须有 alt。alt 要写成完整的英文描述句，说明图里画了什么、传达什么结论，不是 `fig-1` 这种占位符。
- 图片单独成行，前后各空一行，图后**不要**写 `_caption_` 图注（本站不用图注，靠 alt + 上下文）。

**代码块**
标注语言（```sql / ```cpp / ```bash / ```yaml）。`_config.yml` 已开启 rouge 行号（`block.line_numbers: true`），无需手动加。

**表格**
标准 GFM 管道表格，用 `|---|---|` 分隔。对比类内容（选型矩阵、格式对比、性能数字）优先用表格，LLM 抽取友好。

**结尾**
以 CTA 段收口 —— 下载链接、文档链接、社区渠道（Slack / GitHub Discussions / PR 链接）。参考 `2026-04-23-segment-v3-vs-open-formats.md` 的 `## Try Segment V3` 和 `2026-04-24-doris-41-vector-index.md` 的 `## 9. Getting Started and Resources`。

---

## 5. SEO 要求

### 5.1 元数据

由 `jekyll-seo-tag` 自动从 front matter 生成 `<title>`、`<meta name="description">`、`og:*`、`twitter:*` 和 BlogPosting JSON-LD。所以 **SEO 质量 = front matter 质量**，没有额外的手工标签要写。要点：

- `title` 含核心实体，< 70 字符（超了在 SERP 会被截断）。
- `description` 120–160 字符，包含主关键词，能独立成句。
- `image.path` 必须有，否则 `_config.yml` 的 `social_preview_image` 是空的，社交平台分享会没有卡片图。

### 5.2 固定标签词表（15 个，不得自造）

| 类别 | 标签 |
|---|---|
| 引擎 / 产品 | `apache doris`、`apache iceberg`、`apache parquet` |
| 主题 | `lakehouse`、`open format`、`semi-structured`、`indexing`、`cdc`、`query engine`、`ai` |
| 检索 | `full text search`、`vector retrieval`、`hybrid search` |
| 格式 / 规范 | `iceberg v3`、`variant` |

规则：每篇 4–7 个，全小写、空格分词。**不要为单篇文章造一次性标签**（`deletion vector`、`puffin`、`json`、`big data` 这类已被明确否决）。确实出现了能覆盖 ≥2 篇现有/计划文章的新主题时，先在 `SEO-GEO-SOP.md` §3 的表里加上，再在文章里用。

### 5.3 内部链接（必做）

至少 1–2 处链到本站已有的相关文章，用 Jekyll 的 `post_url` 标签而不是硬编码 URL：

```markdown
see [How Hard Is It to Add an Index to an Open Format]({% post_url 2026-04-03-how-hard-is-it-to-add-an-index-to-an-open-format %})
```

`post_url` 的参数是**不带 `.md` 的完整文件名（含日期）**。用它的好处是文件不存在时构建会直接报错，不会产生死链；硬编码 URL 在 slug 变更后会静默变成死链。

内链要落在正文自然位置（讲到相关话题时顺带引一句），不要堆一个 "Related posts" 列表。

### 5.4 外部链接

链一手来源：官方文档、规范、GitHub PR/Issue、论文、维基百科词条。不要链聚合站、SEO 农场、二手转载。首次出现的产品名/概念给一次链接即可，不要重复链。

---

## 6. GEO 要求（面向生成式引擎 / LLM）

GEO = 让 ChatGPT / Perplexity / Claude / Gemini 这类系统能检索到、看得懂、愿意引用这篇文章。

### 6.1 结构层面（写作时就要满足）

- **TL;DR 是第一优先级**。LLM 引用时最常抓这一块，每条 bullet 要能脱离上下文独立成立 —— 带上主语（产品名、版本号），不要写 "It improves performance by 4x"，要写 "Ann Index Only Scan delivers roughly 4× end-to-end speedup"。
- **给具体数字和版本号**。"900 QPS at 97% recall"、"Apache Doris 4.1"、"~48× compression" 这类可核对的事实，比形容词更容易被引用。
- **H2 里带命名实体**，方便按实体检索时命中。
- **对比结论用表格**，结构化内容抽取率高于长段落。
- **一节讲一件事**，段落之间不要跨节指代（"as mentioned above" 这类在被切片检索时会失效）。

### 6.2 llms.txt（必须更新，最容易漏的一步）

`llms.txt` 是给 LLM agent 看的站点索引（遵循 [llmstxt.org](https://llmstxt.org/)）。**每篇新文章都必须加一条**，加在 `## Posts` 段的**最前面**（按时间倒序）：

```markdown
- [完整文章标题](https://morningman.github.io/posts/<slug>/): 2–3 句能独立成立的摘要。开头直接给具体发现或技术手段，不要写背景铺垫。
```

要求：

- 摘要 **250–400 字符**，明显长于 front matter 的 `description`。
- **重新写，不要复制 `description`**。两者用途不同：`description` 是 SERP 摘要（120–160 字符、关键词导向）；`llms.txt` 的摘要是给 agent 判断"值不值得抓全文"用的，要含具体机制名、数字、结论。
- 参考现有条目的写法，尤其是 vector-index 和 segment-v3 那两条。

### 6.3 站点级设施（不用动）

`robots.txt` 已显式放行 GPTBot / ClaudeBot / PerplexityBot / Google-Extended / Applebot-Extended / CCBot，新增文章无需修改。

---

## 7. 需要同步修改的配套文件

按修改的必要性排序：

**① `llms.txt` —— 必须**
见 §6.2。这是唯一一个每篇必改且没有自动化兜底的文件。

**② 老文章的回链 —— 有关联时必须**
新文章如果补上了某篇老文章留的口子（老文章里写过"这个话题另说"），回到老文章加一句 `post_url` 内链。这是构建主题簇（topic cluster）信号的关键动作，只有新文章单向链老文章是不够的。

**③ `SEO-GEO-SOP.md` §3 —— 仅当引入新标签**
新标签必须先进词表再使用，且只有覆盖 ≥2 篇文章的主题才配拥有标签。

**④ `_config.yml` —— 通常不动**
只有这几种情况才需要改：新增了顶层非文章文件且不想发布（加进 `exclude`）、启用了新插件、改站点级元信息。

**⑤ `sitemap.xml` / `feed.xml` / 分类页 / 标签页 / 归档页 —— 永远不用手工改**
全部在构建时自动产出：sitemap 由 `jekyll-sitemap` 生成，分类/标签/归档页由 `jekyll-archives` 按 `_config.yml` 里的 `jekyll-archives.permalinks` 规则生成，RSS feed 由 Chirpy 主题模板生成。仓库里没有这些文件，写对 `categories` / `tags` 就够了。

---

## 8. 已知坑与当前站点的不一致

改稿时扫一眼，避免重复踩：

1. **`date` 写成未来时间 → 文章不构建、不发布。** 最高频的坑。
2. **`title` 含冒号但没加双引号 → YAML 解析失败。** 标题一律加双引号。
3. **图片路径写成相对路径 → 线上 404。** 一律用 `/assets/...` 开头的站点绝对路径。
4. **内链硬编码 URL → 改 slug 后变死链且不会被自动发现。** 站内一律用 `{% post_url %}`。
5. **域名迁移遗留**：站点已通过 `CNAME` 绑定到 `morningman.vip`（`_config.yml` 的 `url` 也已改），但 `llms.txt` 里的全部文章 URL 和 `robots.txt` 里的 Sitemap 地址仍写着 `morningman.github.io`。新增 `llms.txt` 条目时，**保持与文件内现有条目一致的域名**，避免同一文件里两种域名混排；等哪天统一替换时一次性全部改成 `morningman.vip`。
6. **图片体积**：`SEO-GEO-SOP.md` 要求 OG 图 < 300 KB，但现有 OG 图普遍在 1.3–1.8 MB，正文配图也有超过 1.8 MB 的。新图请压到 300 KB 以内（PNG 用 `pngquant`/`oxipng`，照片类改存 JPEG），别再往上堆。
7. **`_config.yml` 的 `social_preview_image` 是空的**，所以每篇文章的 `image.path` 都必须自己填，没有站点级兜底图。
8. **本文件已加入 `_config.yml` 的 `exclude`**（与 `README.md`、`SEO-GEO-SOP.md`、`prompt` 同样处理），不会被发布到线上，无需重复添加。

---

## 9. Agent 可执行 checklist

全部勾完即表示文件改动完成。

**准备**

- [ ] 确定发布日期 `YYYY-MM-DD`（不晚于今天）和时区偏移（夏令时 `-0700` / 冬令时 `-0800`）
- [ ] 确定 slug（小写、连字符、含核心实体、短）
- [ ] 稿件若非英文，先完整改写为英文（重组而非直译）

**正文**

- [ ] 创建 `_posts/YYYY-MM-DD-<slug>.md`
- [ ] Front matter 七字段齐全且顺序正确：`title`（带双引号）/ `date`（带时区）/ `categories`（1–2 个，首个为 `Data Engineering`）/ `tags`（4–7 个，全部来自固定词表）/ `description`（120–160 字符）/ `image.path` / `image.alt`
- [ ] 正文无 H1，最高层级为 H2
- [ ] 开场 2–4 段具体场景，无 AI 味套话
- [ ] `## TL;DR` 存在，4–7 条 bullet，每条独立成立、带主语和数字
- [ ] H2 标题里含命名实体
- [ ] 至少 1–2 处 `{% post_url %}` 内链，且引用的文件名（含日期、不含 `.md`）确实存在
- [ ] 外链指向一手来源
- [ ] 结尾有 CTA 段
- [ ] 全篇英文

**资源**

- [ ] OG 图落在 `assets/img/posts/YYYY-MM-DD-<slug>-og.png`，1200×630，< 300 KB
- [ ] 正文配图落在 `assets/img/posts/YYYY-MM-DD-<slug>/fig-N-<desc>.png`
- [ ] 每张图都有完整英文 alt
- [ ] 所有图片引用都是 `/assets/...` 绝对路径，且文件确实存在
- [ ] 生成提示词存到 `prompt/YYYY-MM-DD-<slug>.md`（风格取自 `prompt/style.md`）

**配套文件**

- [ ] **`llms.txt` 的 `## Posts` 段首加了新条目**（250–400 字符，重写而非复制 `description`，域名与文件内现有条目一致）
- [ ] 相关老文章加了回链（如适用）
- [ ] 若引入新标签，已先写入 `SEO-GEO-SOP.md` §3

---

## 10. 空白模板

复制到 `_posts/YYYY-MM-DD-<slug>.md` 后替换尖括号内容：

```markdown
---
title: "<Main Concept: Specific Subtitle>"
date: <YYYY-MM-DD> <HH:MM:SS> -0700
categories: [Data Engineering, <Apache Doris | Apache Iceberg | ...>]
tags: [<4–7 tags from the fixed vocabulary>]
description: "<120–160 chars, keyword-bearing, reads as a standalone search snippet.>"
image:
  path: /assets/img/posts/<YYYY-MM-DD>-<slug>-og.png
  alt: "<What the OG image depicts, one full English sentence.>"
---

<Opening: 2–4 paragraphs grounding the problem in a concrete scenario. Introduce
unfamiliar products in one sentence with a link to their site.>

## TL;DR

- <Concrete finding or mechanism, with subject and numbers.>
- <...>
- <4–7 bullets total.>

## 1. <Section Title With a Named Entity>

### 1.1 <Subsection>

<Body.>

![<Full English description of what the figure shows and what it argues.>](/assets/img/posts/<YYYY-MM-DD>-<slug>/fig-1-<short-desc>.png)

<More body. Link internally where the topic genuinely connects:
see [<Post Title>]({% post_url <YYYY-MM-DD>-<other-slug> %}).>

## 2. <Section Title>

<Body. Use tables for comparisons.>

| <Dimension> | <Option A> | <Option B> |
|---|---|---|
| <...> | <...> | <...> |

## <Getting Started | Try It | Closing>

- **<Read the spec>**: [<link text>](<url>)
- **<Download>**: [<link text>](<url>)
- **<Questions or feedback>**: [<link text>](<url>)
```

对应的 `llms.txt` 条目模板（加到 `## Posts` 段首）：

```markdown
- [<Full Post Title>](https://morningman.github.io/posts/<slug>/): <250–400 chars. Lead with the concrete finding or technique. Name the mechanisms and cite the numbers. Written fresh, not copied from `description`.>
```
