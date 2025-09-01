# Excel-like Grid Component

This project is a React component that provides an Excel-like grid functionality.

## Features

- Editable cells
- Keyboard navigation (Arrow keys, Tab, Shift+Tab)
- Row and column header highlighting on cell focus
- Column sorting (Click on column headers)
- Add/remove rows and columns (Right-click on headers for context menu)
- Resizable columns (Drag the right edge of column headers)

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

This will open the app in your browser at [http://localhost:3000](http://localhost:3000).

## Component Usage

The `ExcelGrid` component can be used with the following props:

- `data`: A 2D array of cell values.
- `rows`: The number of rows to create if `data` is not provided.
- `columns`: The number of columns to create if `data` is not provided.

Example:

```jsx
import ExcelGrid from './ExcelGrid';

function App() {
  return (
    <div className="App">
      <ExcelGrid rows={20} columns={15} />
    </div>
  );
}
```