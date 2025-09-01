
import React, { useState, useRef, useEffect } from 'react';
import './ExcelGrid.css';

const getColumnLabel = (colIndex) => {
  let label = '';
  let num = colIndex;
  while (num >= 0) {
    label = String.fromCharCode((num % 26) + 65) + label;
    num = Math.floor(num / 26) - 1;
  }
  return label;
};

const ExcelGrid = ({ data, rows = 10, columns = 10 }) => {
  const [columnWidths, setColumnWidths] = useState(Array(columns).fill(100));
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, rowIndex: null, colIndex: null });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filterQuery, setFilterQuery] = useState('');
  const [gridData, setGridData] = useState(() => {
    if (data) {
      return data;
    }
    return Array(rows).fill().map(() => Array(columns).fill(''));
  });

  const sortedData = React.useMemo(() => {
    let filteredData = gridData.filter(row => 
      row.some(cell => 
        cell.toString().toLowerCase().includes(filterQuery.toLowerCase())
      )
    );

    if (sortConfig.key !== null) {
      filteredData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filteredData;
  }, [gridData, sortConfig, filterQuery]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const [focusedCell, setFocusedCell] = useState({ row: null, col: null });
  const cellRefs = useRef(Array(rows).fill().map(() => Array(columns).fill(null)));

  const updateGridData = (row, col, value) => {
    const newData = [...gridData.map(r => [...r])];
    // When sorted, the view's rowIndex doesn't match the model's rowIndex.
    // We need to find the original row to update.
    const originalRowIndex = gridData.findIndex(originalRow => originalRow === sortedData[row]);
    if (originalRowIndex !== -1) {
        newData[originalRowIndex][col] = value;
        setGridData(newData);
    }
  };

  const handleKeyDown = (e, rowIndex, colIndex) => {
    let newRow = rowIndex;
    let newCol = colIndex;

    switch (e.key) {
      case 'ArrowUp':
        newRow = Math.max(0, rowIndex - 1);
        break;
      case 'ArrowDown':
        newRow = Math.min(rows - 1, rowIndex + 1);
        break;
      case 'ArrowLeft':
        newCol = Math.max(0, colIndex - 1);
        break;
      case 'ArrowRight':
        newCol = Math.min(columns - 1, colIndex + 1);
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          if (colIndex > 0) {
            newCol = colIndex - 1;
          } else if (rowIndex > 0) {
            newRow = rowIndex - 1;
            newCol = columns - 1;
          }
        } else {
          if (colIndex < columns - 1) {
            newCol = colIndex + 1;
          } else if (rowIndex < rows - 1) {
            newRow = rowIndex + 1;
            newCol = 0;
          }
        }
        break;
      default:
        return;
    }

    if (cellRefs.current[newRow] && cellRefs.current[newRow][newCol]) {
      cellRefs.current[newRow][newCol].focus();
    }
  };

  const handleContextMenu = (e, rowIndex, colIndex) => {
    e.preventDefault();
    setContextMenu({ show: true, x: e.clientX, y: e.clientY, rowIndex, colIndex });
  };

  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, rowIndex: null, colIndex: null });
  };

  useEffect(() => {
    const handleClick = () => closeContextMenu();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const insertRow = (index) => {
    const newData = [...gridData];
    newData.splice(index, 0, Array(columns).fill(''));
    setGridData(newData);
    closeContextMenu();
  };

  const insertColumn = (index) => {
    const newData = gridData.map(row => {
      const newRow = [...row];
      newRow.splice(index, 0, '');
      return newRow;
    });
    setGridData(newData);
    closeContextMenu();
  };

  const [resizingIndex, setResizingIndex] = useState(null);

  const handleMouseDown = (e, colIndex) => {
    setResizingIndex(colIndex);
  };

  const handleMouseUp = () => {
    setResizingIndex(null);
  };

  const handleMouseMove = (e) => {
    if (resizingIndex !== null) {
      const newWidths = [...columnWidths];
      newWidths[resizingIndex] = Math.max(50, newWidths[resizingIndex] + e.movementX);
      setColumnWidths(newWidths);
    }
  };

  const handleFilterChange = (e) => {
    setFilterQuery(e.target.value);
  };

  useEffect(() => {
    const handleMouseUpGlobal = () => setResizingIndex(null);
    const handleMouseMoveGlobal = (e) => handleMouseMove(e);

    if (resizingIndex !== null) {
      window.addEventListener('mousemove', handleMouseMoveGlobal);
      window.addEventListener('mouseup', handleMouseUpGlobal);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [resizingIndex, columnWidths]);

  return (
    <div>
      <div className="filter-container">
        <input
          type="text"
          placeholder="Search..."
          value={filterQuery}
          onChange={handleFilterChange}
        />
      </div>
      <div 
        className="excel-grid-container" 
        style={{ gridTemplateColumns: `50px ${columnWidths.map(w => `${w}px`).join(' ')}` }}
        onMouseUp={handleMouseUp}
      >
        {contextMenu.show && (
          <div
            className="context-menu"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            {contextMenu.rowIndex !== null && (
              <>
                <div onClick={() => insertRow(contextMenu.rowIndex)}>Insert Row Above</div>
                <div onClick={() => insertRow(contextMenu.rowIndex + 1)}>Insert Row Below</div>
              </>
            )}
            {contextMenu.colIndex !== null && (
              <>
                <div onClick={() => insertColumn(contextMenu.colIndex)}>Insert Column Left</div>
                <div onClick={() => insertColumn(contextMenu.colIndex + 1)}>Insert Column Right</div>
              </>
            )}
          </div>
        )}
        <div className="grid-cell header corner"></div>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div 
            key={colIndex} 
            className={`grid-cell header col-header ${focusedCell.col === colIndex ? 'highlight' : ''}`}
            onContextMenu={(e) => handleContextMenu(e, null, colIndex)}
          >
            <button onClick={() => requestSort(colIndex)}>
              {getColumnLabel(colIndex)}
            </button>
            <div 
              className="resizer"
              onMouseDown={(e) => handleMouseDown(e, colIndex)}
            />
          </div>
        ))}
        {sortedData.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            <div 
              className={`grid-cell header row-header ${focusedCell.row === rowIndex ? 'highlight' : ''}`}
              onContextMenu={(e) => handleContextMenu(e, rowIndex, null)}
            >
              {rowIndex + 1}
            </div>
            {row.map((cell, colIndex) => (
              <input
                ref={el => {
                  if (!cellRefs.current[rowIndex]) cellRefs.current[rowIndex] = [];
                  cellRefs.current[rowIndex][colIndex] = el;
                }}
                key={`${rowIndex}-${colIndex}`}
                type="text"
                className="grid-cell"
                aria-label={`Cell ${getColumnLabel(colIndex)}${rowIndex + 1}`}
                value={cell || ''}
                onChange={(e) => updateGridData(rowIndex, colIndex, e.target.value)}
                onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
                onBlur={() => setFocusedCell({ row: null, col: null })}
                onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ExcelGrid;
