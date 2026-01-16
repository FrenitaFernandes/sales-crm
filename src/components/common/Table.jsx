// src/components/common/Table.jsx
import { useMemo, useState } from "react";
import { MdArrowUpward, MdArrowDownward } from "react-icons/md";

const Table = ({
  columns,
  data,
  title,
  searchable = false,
  sortable = true,
  paginated = false,
  itemsPerPage = 10,
  onRowClick,
  rowClassName = () => "",
  cellClassName = () => "",
  actionColumn,
}) => {
  const [sortConfig, setSortConfig] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Handle sorting
  const handleSort = (column) => {
    if (!sortable) return;

    setSortConfig((prev) => {
      if (prev?.key === column) {
        return { key: column, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key: column, direction: "asc" };
    });
  };

  // Filter data
  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm) return data;
    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, searchable]);

  // Sort data
  const sortedData = useMemo(() => {
    let sorted = [...filteredData];
    if (sortConfig) {
      sorted.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData;
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, paginated, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  return (
    <div className="table-wrapper">
      {title && <h5 className="table-title mb-3">{title}</h5>}

      {searchable && (
        <div className="table-search mb-3">
          <input
            type="text"
            placeholder="Search..."
            className="table-search-input"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      <div className="table-container">
        <table className="table-styled">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className={sortable ? "sortable-header" : ""}
                  style={{ cursor: sortable ? "pointer" : "default" }}
                >
                  <div className="header-content">
                    <span>{col}</span>
                    {sortable && sortConfig?.key === col && (
                      <span className="sort-icon">
                        {sortConfig.direction === "asc" ? (
                          <MdArrowUpward size={14} />
                        ) : (
                          <MdArrowDownward size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actionColumn && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={`table-row ${rowClassName(row)}`}
                  onClick={() => onRowClick?.(row)}
                  style={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {columns.map((col, cellIdx) => (
                    <td
                      key={cellIdx}
                      className={`table-cell ${cellClassName(row, col)}`}
                    >
                      {row[col]}
                    </td>
                  ))}
                  {actionColumn && <td className="table-cell">{actionColumn(row)}</td>}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (actionColumn ? 1 : 0)}
                  className="table-empty"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {paginated && totalPages > 1 && (
        <div className="table-pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;
