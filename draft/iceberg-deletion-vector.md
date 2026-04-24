Dv 的提案： https://docs.google.com/document/d/18Bqhr-vnzFfQk1S4AgRISkA\_5\_m5m32Nnc2Cw0zn2XM/edit?tab=t.0#heading=h.1u17zj790sbs 里面介绍了v2的问题 以及 iceberg 内部的情况

Issue: https://github.com/apache/iceberg/issues/11122





基本概念：

**每个data file 在每个snapshot中最多只能有一个 DV**。

**Position Delete Files 在 v3 中被废弃**（deprecated），但旧文件仍然有效（向后兼容）。

如果一个数据文件有了 DV，则**必须替换**之前的所有 Position Delete Files。

reader看到 DV 时，可以**安全忽略**该数据文件对应的Position Delete Files。



* Deletion vectors are maintained synchronously: Writers must merge DVs (and older position delete files) to ensure there is at most one DV per data file

  * Readers can safely ignore position delete files if there is a DV for a data file

* Writers are not allowed to add new position delete files to v3 tables



* Existing position delete files are valid in tables that have been upgraded from v2

  * These position delete files must be merged into the DV for a data file when one is created

  * Position delete files that contain deletes for more than one data file need to be kept in table metadata until all deletes are replaced by DVs





DV 如何表示删除：

DV支持 **64 位正整数位置**，但为了优化大多数位置能够落在 **32 位范围内** 的常见场景，其内部实现采用了一组 **32 位 Roaring 位图**。
&#x20;64 位位置会被拆分为两个部分：

* 使用 **最高的 4 个字节** 作为一个 32 位的 **key**

* 使用 **最低的 4 个字节** 作为一个 32 位的 **子位置（sub-position）**

对于位置集合中出现的每一个 key，都会维护一个 **32 位的 Roaring 位图**，用于存储该 key 下对应的一组 32 位子位置。

判断某个位置是否被标记为删除时：

1. 使用该位置的 **最高 4 个字节（key）** 查找对应的 32 位位图

2. 再使用 **最低 4 个字节（子位置）** 判断其是否包含在该位图中
   &#x20;如果找不到对应 key 的位图，则说明该位置 **未被标记为删除**







每一个 blob 都会在 Iceberg 元数据中表现为**一个独立的 DeleteFile**，并且与其所引用的数据文件**使用相同的 spec 和 partition**。
&#x20;这样一来，Iceberg 就可以利用 \*\*分区谓词（partition predicates）\*\*来裁剪（prune）删除元数据，从而减少规划和读取开销。



Delete manifests track deletion vectors individually by the containing file location (file\_path), starting offset of the DV blob (content\_offset), and total length of the blob (content\_size\_in\_bytes). Multiple deletion vectors can be stored in the same file. There are no restrictions on the data files that can be referenced by deletion vectors in the same Puffin file.

删除清单（delete manifests）会分别跟踪每一个DV，其定位方式包括：

* 删除向量所作用的数据文件路径（`file_path`）

* 删除向量 blob 在 Puffin 文件中的起始偏移量（`content_offset`）

* 该 blob 的总字节长度（`content_size_in_bytes`）



同一个 Puffin 文件中可以存储 **多个删除向量**

对同一个 Puffin 文件中引用的不同删除向量，其对应的数据文件 **没有任何限制**







DV 存储 puffin 文件：

```c++
文件布局：
Magic Blob₁ Blob₂ ... Blobₙ Footer 


Footer: Magic FooterPayload FooterPayloadSize Flags Magic

Magic is four bytes 0x50, 0x46, 0x41, 0x31


Blob：一组 delete vector.
Blobᵢ is i-th blob contained in the file,
 to be interpreted by application according to the footer,


元数据信息：
FooterPayload : UTF-8 的 json 串   <may be LZ4-compressed>  
FooterPayloadSize : size (after compression, if compressed)  ， <size in file>


FooterPayload json 解析 => 
public class FileMetadata {
  private final List<BlobMetadata> blobs;
  private final Map<String, String> properties;
}


public class BlobMetadata {
  // request 
  private final String type;
  private final List<Integer> inputFields;
  private final long snapshotId;
  private final long sequenceNumber;
  private final long offset;
  private final long length;
  
  // optional 
  private final String compressionCodec; 
  private final Map<String, String> properties
}

```



Blob ： 可以表示64  bit 位 ，由于 32 bit位是大多数场景

0 - 2^64 -1

将64位 分成两个 32位

前32 位作为 key   每个 key 对应一个 sub-position&#x20;



简单来说 判断某一行在不在 先取前32位 找一下key  得到对应的bitmap    然后找后32位根据bitmap



```c++
blob :

Total Length 
magic 
Serialized Vector（N key , list<key , 32-bit Roaring bitmap> ） 
CRC-32 


Total Length:  ... (计算总长度)
Magic:        D1 D3 39 64
N = 2         (2 个 key)
key 0 (0x00000000):  Roaring32 包含 {0,1}
key 1 (0x00000001):  Roaring32 包含 {100}
CRC-32


Note that the length and CRC fields are stored using big-endian, 
but the Roaring bitmap format uses little-endian values. 
Big endian values were chosen for compatibility with existing deletion 
vectors in Delta tables.
```











意思是iceberg 内部维护 position delete 也用的是 bitmap

Iceberg supports vectorized reads by loading position deletes into a[ <u><span style="color: rgb(36,91,219); background-color: inherit">Roaring bitmap</span></u>](https://roaringbitmap.org/), a form of compressed bitmap, which acts like a deletion vector. This approach allows Iceberg libraries and connectors to read the data as if there were no deletes, adding minimal overhead to scans. Readers are required to open all matching delete files and merge them into a single deletion vector. See[ <u><span style="color: rgb(36,91,219); background-color: inherit">here</span></u>](https://github.com/apache/iceberg/blob/79620e198009fa243c278c66fd442d107b46206a/core/src/main/java/org/apache/iceberg/deletes/Deletes.java#L167) and[ <u><span style="color: rgb(36,91,219); background-color: inherit">here</span></u>](https://github.com/apache/iceberg/blob/79620e198009fa243c278c66fd442d107b46206a/spark/v3.5/spark/src/main/java/org/apache/iceberg/spark/data/vectorized/ColumnVectorWithFilter.java#L26) for more information.

针对**每一个已出现的数据文件**，在内存中维护一个 **Roaring bitmap**，用于记录被删除的位置







~~读取不需要依赖footer~~

~~**Puffin footer** 中会包含每个 blob 的一些辅助信息，用于**调试**以及（**可能用于**）表维护场景，但在**读取过程中不会依赖这些信息**。   ~~来自提案  ，并不准确 因为blob会压缩。不过目前v1 blob 并不会压缩。





## Trino&#x20;

https://github.com/trinodb/trino/pull/24882

https://github.com/trinodb/trino/pull/25550



Trino 区分 dv / position delete file&#x20;

```java
DeleteManager:
Optional<DeleteFilter> createPositionDeleteFilter(...) {
    // ...
    LongBitmapDataProvider deletedRows = new Roaring64Bitmap();
    for (DeleteFile deleteFile : positionDeleteFiles) {
        if (shouldLoadPositionDeleteFile(deleteFile, startRowPosition, endRowPosition)) {
            if (deleteFile.format() == PUFFIN) {
                try (TrinoInput input = fileSystem.newInputFile(Location.of(deleteFile.path())).newInput()) {
                    readDeletionVector(input, deleteFile.recordCount(), deleteFile.contentOffset(), 
                        deleteFile.contentSizeInBytes(), deletedRows);
                }
                catch (IOException e) {
                    throw new UncheckedIOException(e);
                }
            }
            else {
                try (ConnectorPageSource pageSource = deletePageSourceProvider.openDeletes(deleteFile, deleteColumns, deleteDomain)) {
                    readPositionDeletes(pageSource, targetPath, deletedRows);
                }
                catch (IOException e) {
                    throw new UncheckedIOException(e);
                }
            }
        }
    }
    // ...
}

DeleteManager:
Optional<RowPredicate> getDeletePredicate(...) {
    // ...
    Optional<RowPredicate> positionDeletes = createPositionDeleteFilter(fileSystem, dataFilePath, positionDeleteFiles, readerPageSourceWithRowPositions, deletePageSourceProvider)
            .map(filter -> filter.createPredicate(readColumns, dataSequenceNumber));
    Optional<RowPredicate> equalityDeletes = createEqualityDeleteFilter(equalityDeleteFiles, tableSchema, deletePageSourceProvider).stream()
            .map(filter -> filter.createPredicate(readColumns, dataSequenceNumber))
            .reduce(RowPredicate::and);
    // ...
}


ConnectorPageSource IcebergPageSourceProvider.createPageSourc(...) {
    // filter out deleted rows
    if (!deletes.isEmpty()) {
        Supplier<Optional<RowPredicate>> deletePredicate = 
                () -> getDeleteManager(partitionSpec, partitionData)
            .getDeletePredicate(...)
        
        predicate.applyFilter(page)        
    }
            
}
```



```java
@ThreadSafe
public interface RowPredicate
{
    boolean test(SourcePage page, int position);

    default RowPredicate and(RowPredicate other)
    {
        requireNonNull(other, "other is null");
        return (page, position) -> test(page, position) && other.test(page, position);
    }

    default void applyFilter(SourcePage page)
    {
        int positionCount = page.getPositionCount();
        int[] retained = new int[positionCount];
        int retainedCount = 0;
        for (int position = 0; position < positionCount; position++) {
            if (test(page, position)) {
                retained[retainedCount] = position;
                retainedCount++;
            }
        }
        if (retainedCount != positionCount) {
            page.selectPositions(retained, 0, retainedCount);
        }
    }
}


public final class PositionDeleteFilter
        implements DeleteFilter {
    private final ImmutableLongBitmapDataProvider deletedRows;

    @Override
    public RowPredicate createPredicate(List<IcebergColumnHandle> columns, long dataSequenceNumber)
    {
        int filePosChannel = rowPositionChannel(columns);
        return (page, position) -> {
            Block block = page.getBlock(filePosChannel);
            long filePos = BIGINT.getLong(block, position);
            return !deletedRows.contains(filePos);
        };
    }


```





## Starrocks&#x20;

读取 Iceberg Position delete ， paimon  Dv  ,  delta lake dv ( 类似于 icberg dv https://github.com/delta-io/delta/blob/master/PROTOCOL.md#deletion-vector-format) &#x20;

在parquet reader初始化的时候

```c++
Status HdfsParquetScanner::do_init(RuntimeState* runtime_state, const HdfsScannerParams& scanner_params) {
    if (!scanner_params.deletes.empty()) {
        SCOPED_RAW_TIMER(&_app_stats.iceberg_delete_file_build_ns);
        auto iceberg_delete_builder =
                std::make_unique<IcebergDeleteBuilder>(_skip_rows_ctx, runtime_state, scanner_params);
        for (const auto& delete_file : scanner_params.deletes) {
            if (delete_file->file_content == TIcebergFileContent::POSITION_DELETES) {
                RETURN_IF_ERROR(iceberg_delete_builder->build_parquet(*delete_file));
                // 读取 position delete file 
            } else {
                const auto s = strings::Substitute("Unsupported iceberg file content: $0 in the scanner thread",
                                                   delete_file->file_content);
                LOG(WARNING) << s;
                return Status::InternalError(s);
            }
        }
        _app_stats.iceberg_delete_files_per_scan += scanner_params.deletes.size();
    } else if (scanner_params.paimon_deletion_file != nullptr) {
        std::unique_ptr<PaimonDeleteFileBuilder> paimon_delete_file_builder(
                new PaimonDeleteFileBuilder(scanner_params.fs, _skip_rows_ctx));
        RETURN_IF_ERROR(paimon_delete_file_builder->build(scanner_params.paimon_deletion_file.get()));
        // read dv
    } else if (scanner_params.deletion_vector_descriptor != nullptr) {
        if (scanner_params.split_context != nullptr) {
            auto split_ctx = down_cast<const parquet::SplitContext*>(scanner_params.split_context);
            _skip_rows_ctx = split_ctx->skip_rows_ctx;
            return Status::OK();
        }
        SCOPED_RAW_TIMER(&_app_stats.deletion_vector_build_ns);
        std::unique_ptr<DeletionVector> dv = std::make_unique<DeletionVector>(scanner_params);
        RETURN_IF_ERROR(dv->fill_row_indexes(_skip_rows_ctx));
        // read dv 
        _app_stats.deletion_vector_build_count += 1;
    }
    return Status::OK();
}
```



```c++
// 读取的时候将数据更新至：_deletion_bitmap

class DeletionBitmap {
public:
    DeletionBitmap(roaring64_bitmap_t* bitmap) : _bitmap(bitmap) {}
    ~DeletionBitmap() {
        if (_bitmap != nullptr) {
            roaring::api::roaring64_bitmap_free(_bitmap);
        }
    }

    bool empty() const { return roaring64_bitmap_is_empty(_bitmap); };
    StatusOr<bool> fill_filter(uint64_t start, uint64_t end, Filter& filter);
    uint64_t get_range_cardinality(uint64_t start, uint64_t end) const;
    void add_value(uint64_t val);
    uint64_t get_cardinality() const;
    void to_array(std::vector<uint64_t>& array) const;

private:
    static const uint64_t kBatchSize = 256;

    roaring64_bitmap_t* _bitmap = nullptr;
};

using DeletionBitmapPtr = std::shared_ptr<DeletionBitmap>;


```



读取：

```c++
Status GroupReader::get_next(ChunkPtr* chunk, size_t* row_count) {
    SCOPED_RAW_TIMER(&_param.stats->group_chunk_read_ns);
    if (_is_group_filtered) {
        *row_count = 0;
        return Status::EndOfFile("");
    }
    _read_chunk->reset();

    ChunkPtr active_chunk = _create_read_chunk(_active_column_indices, false);
    // to complicity with _do_get_next will break and return even active_row is all filtered.
    // but a better choice is don't return until really have some results.
    while (true) {
        if (!_range_iter.has_more()) {
            *row_count = 0;
            return Status::EndOfFile("");
        }

        auto r = _range_iter.next(*row_count);
        auto count = r.span_size();
        _param.stats->raw_rows_read += count;

        active_chunk->reset();

        bool has_filter = false;
        Filter chunk_filter(count, 1);

        // row id filter
        if (nullptr != _skip_rows_ctx && _skip_rows_ctx->has_skip_rows()) {
            {
                SCOPED_RAW_TIMER(&_param.stats->build_rowid_filter_ns);
                ASSIGN_OR_RETURN(has_filter,
                 _skip_rows_ctx->deletion_bitmap->fill_filter(r.begin(), r.end(),
                  chunk_filter));
                  // 根据 deletion_bitmap 来生成 chunk_filter

                if (SIMD::count_nonzero(chunk_filter.data(), count) == 0) {
                    continue;
                }
            }
        }
    }
    
    
    // we really have predicate to run round by round
    if (!_dict_column_indices.empty() || !_left_no_dict_filter_conjuncts_by_slot.empty()) {
        has_filter = true;
        ASSIGN_OR_RETURN(size_t hit_count, _read_range_round_by_round(r, &chunk_filter, &active_chunk));
        if (hit_count == 0) {
            _param.stats->late_materialize_skip_rows += count;
            continue;
        }
        active_chunk->filter_range(chunk_filter, 0, count);
    } else if (has_filter) {
        RETURN_IF_ERROR(_read_range(_active_column_indices, r, &chunk_filter, &active_chunk));
        active_chunk->filter_range(chunk_filter, 0, count);
        // chunk_filter 用于后续判断 某些page 读不读
    } else {
        RETURN_IF_ERROR(_read_range(_active_column_indices, r, nullptr, &active_chunk));
    }
    
}

Status FixedValueColumnReader::read_range(const Range<uint64_t>& range, const Filter* filter, ColumnPtr& dst) {
    Column* dst_col = dst->as_mutable_raw_ptr();
    for (uint64_t i = range.begin(); i < range.end(); ++i) {
        dst_col->append_datum(_fixed_value);
    }
    return Status::OK();
}
```



优化  https://github.com/StarRocks/starrocks/pull/51867  position delete file 使用data cache.





## Impala

Position delete : 采用类似于join的形式    https://issues.apache.org/jira/browse/IMPALA-11484 &#x20;

For the data file rows we need to get the virtual columns INPUT\_FILE\_NAME and FILE\_POSITION,

对于data file 构造两个虚拟列

Position delete 中两列 ： 文件名 + 删除的行   这两者做join.



Dv: https://issues.apache.org/jira/browse/IMPALA-14587 暂未实现



## Duckdb



```c++
//! The MultiFileReader class provides a set of helper methods
// to handle scanning from multiple files
// struct MultiFileReader 

void IcebergMultiFileReader::FinalizeBind(MultiFileReaderData &reader_data, const MultiFileOptions &file_options,
                                          const MultiFileReaderBindData &options,
                                          const vector<MultiFileColumnDefinition> &global_columns,
                                          const vector<ColumnIndex> &global_column_ids, ClientContext &context,
                                          optional_ptr<MultiFileReaderGlobalState> global_state) {
        MultiFileReader::FinalizeBind(reader_data, file_options, options, global_columns, global_column_ids, context,
                                      global_state);
        D_ASSERT(global_state);
        // Get the metadata for this file
        const auto &multi_file_list = dynamic_cast<const IcebergMultiFileList &>(*global_state->file_list);
        auto &reader = *reader_data.reader;
        auto file_id = reader.file_list_idx.GetIndex();

        {
               lock_guard<mutex> guard(multi_file_list.lock);
               const auto &data_file = multi_file_list.data_files[file_id];
               // The path of the data file where this chunk was read from
               const auto &file_path = data_file.file_path;
               lock_guard<mutex> delete_guard(multi_file_list.delete_lock);
               if (multi_file_list.current_delete_manifest != multi_file_list.delete_manifests.end() ||
                   multi_file_list.current_transaction_delete_manifest != multi_file_list.transaction_delete_manifests.end()) {
                      multi_file_list.ProcessDeletes(global_columns, global_column_ids);
                      //读取 position delete 文件
               }
               reader.deletion_filter = std::move(multi_file_list.GetPositionalDeletesForFile(file_path));
        }
}
```



Scan position delete file / deletion vector 的时候会生成 DeleteFilter, 执行DeleteFilter中的Filter 时可以更新select vector&#x20;

```c++
struct IcebergDeletionVector : public DeleteFilter {
public:
        IcebergDeletionVector() {
        }

public:
        static unique_ptr<IcebergDeletionVector> FromBlob(data_ptr_t blob_start, idx_t blob_length);

public:
        idx_t Filter(row_t start_row_index, idx_t count, SelectionVector &result_sel) override;

public:
        unordered_map<int32_t, roaring::Roaring> bitmaps;

        //! State shared between Filter calls
        roaring::BulkContext bulk_context;
        optional_ptr<roaring::Roaring> current_bitmap;
        bool has_current_high = false;
        //! High bits of the current bitmap (the key in the map)
        int32_t current_high;
};


struct IcebergPositionalDeleteData : public DeleteFilter {
public:
        IcebergPositionalDeleteData() {
        }

public:
        void AddRow(int64_t row_id);

        idx_t Filter(row_t start_row_index, idx_t count, SelectionVector &result_sel);

public:
        //! Store invalid rows here before finalizing into a SelectionVector
        unordered_set<int64_t> temp_invalid_rows;
};
```



在实际读取文件时：

```c++
bool ParquetReader::ScanInternal(ClientContext &context, 
        ParquetReaderScanState &state, DataChunk &result) {
    
    if (filters || deletion_filter) {
        if (deletion_filter) {
            deletion_filter->Filter(row_start, scan_count, state.sel);//更新select Vector
        }
        if (filters) {
            // first load the columns that are used in filters
            for (idx_t i = 0; i < state.scan_filters.size(); i++) {
                child_reader.Filter(scan_count, define_ptr, repeat_ptr, result_vector, scan_filter.filter,
                    *scan_filter.filter_state, state.sel, filter_count, is_first_filter);
            //      先读取需要过滤的列，然后filter 更新select vector
            }
  
        }
        // we still may have to read some cols
        for (idx_t i = 0; i < column_ids.size(); i++) {
            // 根据 select vector  来读取剩下的列
            auto &child_reader = root_reader.GetChildReader(file_col_idx);
            child_reader.Select(result.size(), define_ptr, repeat_ptr, result_vector, 
                state.sel, filter_count);
        }    
    
    }
}

```



## Doirs&#x20;

Iceberg position delete :

```c++
Status IcebergParquetReader::init_reader(
        const std::vector<std::string>& file_col_names,
        std::unordered_map<std::string, uint32_t>* col_name_to_block_idx,
        const VExprContextSPtrs& conjuncts, const TupleDescriptor* tuple_descriptor,
        const RowDescriptor* row_descriptor,
        const std::unordered_map<std::string, int>* colname_to_slot_id,
        const VExprContextSPtrs* not_single_slot_filter_conjuncts,
        const std::unordered_map<int, VExprContextSPtrs>* slot_id_to_filter_conjuncts) {
    _file_format = Fileformat::PARQUET;
    // ...
    // 在初始化iceberg data file reader 之前，读取delete file
    RETURN_IF_ERROR(init_row_filters());
    // ...
    return parquet_reader->init_reader(
            _all_required_col_names, _col_name_to_block_idx, conjuncts, tuple_descriptor,
            row_descriptor, colname_to_slot_id, not_single_slot_filter_conjuncts,
            slot_id_to_filter_conjuncts, table_info_node_ptr, true, column_ids, filter_column_ids);
}
```



```c++
Status IcebergTableReader::init_row_filters() {
    std::vector<TIcebergDeleteFileDesc> position_delete_files;
    std::vector<TIcebergDeleteFileDesc> equality_delete_files;
    for (const TIcebergDeleteFileDesc& desc : table_desc.delete_files) {
        if (desc.content == POSITION_DELETE) {
            position_delete_files.emplace_back(desc);
        } else if (desc.content == EQUALITY_DELETE) {
            equality_delete_files.emplace_back(desc);
        }
    }

    if (!position_delete_files.empty()) {
        RETURN_IF_ERROR(
                _position_delete_base(table_desc.original_file_path, position_delete_files));
        _file_format_reader->set_push_down_agg_type(TPushAggOp::NONE);
    }
    if (!equality_delete_files.empty()) {
        RETURN_IF_ERROR(_equality_delete_base(equality_delete_files));
        _file_format_reader->set_push_down_agg_type(TPushAggOp::NONE);
    }
}
```



```c++
Status IcebergTableReader::_position_delete_base(
        const std::string data_file_path, const std::vector<TIcebergDeleteFileDesc>& delete_files) {
    std::vector<DeleteRows*> delete_rows_array;
    int64_t num_delete_rows = 0;
    for (const auto& delete_file : delete_files) {
        SCOPED_TIMER(_iceberg_profile.delete_files_read_time);
        Status create_status = Status::OK();
        // file reader 维护一个 kv cache 
        // key : delete file 的路径
        // value : 一个 map : 由于pos-delete-file 会存储多个date file 的delete 信息
        //         所以 sub-key 是data file path , sub-value 是vector 表示删除那些行号
        auto* delete_file_cache = _kv_cache->get<DeleteFile>(
                _delet_file_cache_key(delete_file.path), [&]() -> DeleteFile* {
                    auto* position_delete = new DeleteFile;
                    TFileRangeDesc delete_file_range;
                    // must use __set() method to make sure __isset is true
                    delete_file_range.__set_fs_name(_range.fs_name);
                    delete_file_range.path = delete_file.path;
                    delete_file_range.start_offset = 0;
                    delete_file_range.size = -1;
                    delete_file_range.file_size = -1;
                    //read position delete file base on delete_file_range , generate DeleteFile , add DeleteFile to kv_cache
                    create_status = _read_position_delete_file(&delete_file_range, position_delete);

                    if (!create_status) {
                        return nullptr;
                    }

                    return position_delete;
                });
        if (create_status.is<ErrorCode::END_OF_FILE>()) {
            continue;
        } else if (!create_status.ok()) {
            return create_status;
        }

        DeleteFile& delete_file_map = *((DeleteFile*)delete_file_cache);
        auto get_value = [&](const auto& v) {
            DeleteRows* row_ids = v.second.get();
            if (!row_ids->empty()) {
                delete_rows_array.emplace_back(row_ids);
                num_delete_rows += row_ids->size();
            }
        };
        delete_file_map.if_contains(data_file_path, get_value);
    }
    if (num_delete_rows > 0) {
        SCOPED_TIMER(_iceberg_profile.delete_rows_sort_time);
        // 给 parquet/orc 传递一个 vector 表示删除哪些行  ,一个vector
        _sort_delete_rows(delete_rows_array, num_delete_rows);
        this->set_delete_rows();
        COUNTER_UPDATE(_iceberg_profile.num_delete_rows, num_delete_rows);
    }
    return Status::OK();
}
```



Paimon dv:

```c++
Status PaimonReader::init_row_filters() {
    // ... 与iceberg 类似 在 data file reader初始化之前读取 dv
    auto deletion_vector = DORIS_TRY(DeletionVector::deserialize(result.data, result.size));
    if (!deletion_vector.is_empty()) {
        for (auto i = deletion_vector.minimum(); i <= deletion_vector.maximum(); i++){
            if (deletion_vector.is_delete(i)) {
                _delete_rows.push_back(i);
            }
        }
        COUNTER_UPDATE(_paimon_profile.num_delete_rows, _delete_rows.size());
        set_delete_rows();
        // 给 data file reader 设置删除哪些行 ,一个vector
    }
    return Status::OK();
}
```







## 性能对比测试

阿里云开发机器 doris  1fe 1be 无cache.  VS duckdb&#x20;

数据：docker iceberg&#x20;

表结构

```python
spark.sql("""
CREATE TABLE daidai.position_v2_1kw_5 (
  id        BIGINT,
  grp       INT,
  value     INT,
  ts        TIMESTAMP
)
USING iceberg
TBLPROPERTIES (
  'format-version'='2',
  'write.delete.mode'='merge-on-read',
  'write.update.mode'='merge-on-read',
  'write.merge.mode'='merge-on-read'
)
""")
```

```c++
q1: select count(id) from xx;  
q2: select count(value) from xx;
```

### 测试1

导入 1kw 行数据。id 列 从 0-1kw 有序，生成 16个 parquet data file.

```python
import org.apache.spark.sql.functions._

val df4 = spark.range(0, 10000000).select(
    col("id"),
    (col("id") % 100).cast("int").as("grp"),
    (rand() * 1000).cast("int").as("value"),
    current_timestamp().as("ts")
  )

df4.repartition(16).writeTo("daidai.position_v2_1kw_5").append()

```

数据删除方法（每次删除 1 %）：

```c++
spark.sql("delete from daidai.position_v2_1kw_5 where id % 100 = x")
```

Position delete 每次删除都会对每个data file 生成一个delete file.&#x20;

即当删除了20%的数据 对应需要读取 16个数据文件 + 16\*20个delete file.

Deletion vector ：每次查询一个data file 只需要查询一个 puffin file ( 经过确认16个data file 对应的都是同一个puffin file)

即每次查询需要读取16个data file + 1 个 puffin file.

| 数据量   | v2 :  Position delete  |      |        |      | v3 : deletion vector |      |        |      |
| ----- | ---------------------- | ---- | ------ | ---- | -------------------- | ---- | ------ | ---- |
|       | doris                  |      | duckdb |      | doris                |      | duckdb |      |
|       | q1                     | q2   | q1     | q2   | q1                   | q2   | q1     | q2   |
| 删除5%  | 0.31                   | 0.32 | 0.20   | 0.22 | 0.15                 | 0.11 | 0.12   | 0.08 |
| 删除10% | 0.35                   | 0.35 | 0.37   | 0.36 | 0.16                 | 0.12 | 0.13   | 0.09 |
| 删除20% | 0.43                   | 0.41 | 0.87   | 0.75 | 0.17                 | 0.10 | 0.11   | 0.08 |
| 删除30% | 0.38                   | 0.46 | 1.15   | 1.02 | 0.14                 | 0.11 | 0.11   | 0.09 |
| 删除40% | 0.39                   | 0.36 | 1.22   | 1.20 | 0.17                 | 0.14 | 0.07   | 0.08 |





### 测试2

导入 5kw 行数据。id 列无序，生成 10个 parquet data file.

```python
val rows = 50000000L
val idRange = 50000000L

val df = spark.range(rows).select(
    (rand() * idRange).cast("long").as("id"),   // 👈 随机 id
    (rand() * 100).cast("int").as("grp"),
    (rand() * 1000).cast("int").as("value"),
    current_timestamp().as("ts")
  )
df.repartition(10).writeTo("daidai.position_v3_5e_new").append()

```

数据删除方法（每次删除 10 %）：

```c++
spark.sql("delete from daidai.position_v2_1kw_5 where id % 10 = xxxx")
```

Position delete 每次删除都会对每个data file 生成一个delete file.&#x20;

即当删除了20%的数据时 对应需要读取 10 个数据文件 + 10\*2 个delete file.

Deletion vector ：每次查询一个data file 对应只需要查询一个 puffin file (此时  1-2 个data file 对应到了 1 个 puffin file)

&#x20;即每次查询会查询 10个 data file + 9 个 puffin file



| 数据量      | v2 :  Position delete  |      |        |      | v3 : deletion vector |      |        |      |
| -------- | ---------------------- | ---- | ------ | ---- | -------------------- | ---- | ------ | ---- |
|          | doris                  |      | duckdb |      | doris                |      | duckdb |      |
|          | q1                     | q2   | q1     | q2   | q1                   | q2   | q1     | q2   |
| 删除10%    | 0.23                   | 0.11 | 2.1    | 2.09 | 0.28                 | 0.13 | 0.27   | 0.14 |
| 删除20%    | 0.30                   | 0.16 | 4.1    | 3.6  | 0.28                 | 0.18 | 0.26   | 0.13 |
| 删除30%    | 0.30                   | 0.20 | 5.5    | 5.85 | 0.30                 | 0.18 | 0.27   | 0.13 |
| 删除40%    | 0.34                   | 0.22 | 6.4    | 6.2  | 0.29                 | 0.17 | 0.26   | 0.15 |
|    删除90% | 0.49                   | 0.43 | 7.0    | 6.9  | 0.32                 | 0.20 | 0.30   | 0.19 |

特别说明 这里的 “删除90%” 是直接执行了  `id%10 != 9`



### 测试3

这里是在构建单文件大数据量的测试场景



需要注意的是 目前的spark对于一个单文件太大的话，会生成错误的deletion vector&#x20;

例如：

先创建了 5kw 数据，然后执行 delete 直接删除 99%的数据，这里一次性对一个data file 生成了三个 puffin文件, 理论上只应该生成 一个puffin 文件

![](<images/Iceberg deletion vector -image>)

然后用spark查询也会报错

![](<images/Iceberg deletion vector -image.png>)

后面测试出来发现：在删除前执行一下这个就好了

```c++
scala> spark.conf.set("spark.sql.shuffle.partitions", "1")
scala> spark.conf.set("spark.sql.adaptive.enabled", "false")
```







测试比较 position delete / deletion vector 的文件大小

生成 2kw 行数据   删除量 99%&#x20;

Deletion vector:

```c++
bash-5.1# mc  ls minio/warehouse/wh/daidai/position_v3_one4/data
[2025-12-30 16:55:15 UTC] 125MiB STANDARD 00000-41-c310a82e-e1b5-4b29-9b63-1541e974fa97-0-00001.parquet
[2025-12-30 16:55:29 UTC] 780KiB STANDARD 00000-43-793a3b4f-35c9-41eb-b01d-3954102eebe1-00001-deletes.puffin
```

相同情况下的position delete:

```c++
bash-5.1# mc  ls minio/warehouse/wh/daidai/position_v2_one4/data
[2025-12-30 17:12:39 UTC] 125MiB STANDARD 00000-64-e12e72db-ae6d-4d9c-b1c5-1e9308f56451-0-00001.parquet
[2025-12-30 17:13:06 UTC]  20MiB STANDARD 00000-66-90fa6a48-e2fd-4501-9fd0-d0907a552aca-00001-deletes.parquet
```



测试生成 1亿数据，删除量99%

Deletion vector:

```c++
bash-5.1# mc  ls minio/warehouse/wh/daidai/position_v3_multi_group9/data
[2025-12-31 05:06:44 UTC] 512MiB STANDARD 00000-247-13d910d6-dea0-496c-9b68-fbb9514f7c89-0-00001.parquet
[2025-12-31 05:06:50 UTC] 114MiB STANDARD 00000-247-13d910d6-dea0-496c-9b68-fbb9514f7c89-0-00002.parquet
[2025-12-31 05:07:31 UTC] 3.8MiB STANDARD 00000-265-00dc0397-ddd6-4d2c-b63b-9d3dfec3d80c-00001-deletes.puffin
```

相同情况下的position delete

```c++
bash-5.1# mc  ls minio/warehouse/wh/daidai/position_v2_multi_group9/data
[2025-12-31 06:35:42 UTC] 512MiB STANDARD 00000-16-c15362e6-4cf5-4b75-a1dc-f4ef528eacbc-0-00001.parquet
[2025-12-31 06:35:49 UTC] 114MiB STANDARD 00000-16-c15362e6-4cf5-4b75-a1dc-f4ef528eacbc-0-00002.parquet
[2025-12-31 06:37:27 UTC]  64MiB STANDARD 00000-34-4ed42a82-8b29-41c1-9fc6-f6d54992cbb6-00001-deletes.parquet
[2025-12-31 06:37:40 UTC]  16MiB STANDARD 00000-34-4ed42a82-8b29-41c1-9fc6-f6d54992cbb6-00002-deletes.parquet
[2025-12-31 06:37:53 UTC]  18MiB STANDARD 00000-34-4ed42a82-8b29-41c1-9fc6-f6d54992cbb6-00003-deletes.parquet
```









测试 Doirs 内存会不会爆炸：

测试生成 1亿数据，删除量99%，这里生成的文件是多row group的，以便该文件可以切分到多个split上读取。

```python
spark.sql("""
CREATE TABLE daidai.position_v3_multi_group (
  id        BIGINT,
  grp       INT,
  value     INT,
  ts        TIMESTAMP
)
USING iceberg
TBLPROPERTIES (
  'format-version'='3',
  'write.delete.mode'='merge-on-read',
  'write.update.mode'='merge-on-read',
  'write.merge.mode'='merge-on-read',
  'write.parquet.row-group-size-bytes'='4000000'
)
""")

import org.apache.spark.sql.functions._

val rows = 20000000L
val idRange = 500000000L

val df = spark.range(rows).select(
    (rand() * idRange).cast("long").as("id"), 
    (rand() * 100).cast("int").as("grp"),
    (rand() * 1000).cast("int").as("value"),
    current_timestamp().as("ts")
  )

df.repartition(1).writeTo("daidai.position_v3_multi_group").append()

spark.sql("delete from daidai.position_v3_multi_group where id % 100 != 0")
```

Position delete:

Doris:          q1: 3.42              q2: 3.28

Duckdb :     q1: 11.95             q2: 11. 83



Deletion vector

Doris:          q1:  1.03             q2: 0.86

Duckdb :     q1:  1.00             q2: 0.93



观察Deletion vector 情况下  Doris内存使用量其实变化不大，在可接受的范围内，由于在 deletion vector 的实现中，kv\_cache 会使得 blob 的读取与解析只会执行一次，解析生成 std::vector\<int64> 用于表示 需要删除那些行 , 解析后parquet/orc reader 使用的都是 对该vector的指针，使得删除向量在内存中只会存在一份。 假设deletion vector 删除了1亿行的数据，那么内存中会有 1亿 \* sizeof(int64) ≈ 763 MB \* scan\_operator 的数量 其实也不会有太多问题。

观察 Position Delete 情况下 内存使用量时明显高于Deletion Vector, 一方面是因为 Position Delete 需要把 delete rows 的数据在内存中存放两遍（第一次是 delete file path 作为key , 第二次是data file path 作为key ）

观察查询结束后 内存使用情况恢复到查询之前。



