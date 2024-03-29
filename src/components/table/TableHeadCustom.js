import PropTypes from 'prop-types';
// @mui
import { Box, Checkbox, TableRow, TableCell, TableHead, TableSortLabel } from '@mui/material';
import { Row } from '../elements/styled-components';

// ----------------------------------------------------------------------

const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
};

// ----------------------------------------------------------------------

TableHeadCustom.propTypes = {
  sx: PropTypes.object,
  onSort: PropTypes.func,
  orderBy: PropTypes.string,
  headLabel: PropTypes.array,
  rowCount: PropTypes.number,
  numSelected: PropTypes.number,
  onSelectAllRows: PropTypes.func,
  order: PropTypes.oneOf(['asc', 'desc']),
};

export default function TableHeadCustom({
  order,
  orderBy,
  rowCount = 0,
  headLabel,
  numSelected = 0,
  onSort,
  onSelectAllRows,
  sx,
  themeNotShowColumns = {},
  column_table = "",
}) {
  return (
    <TableHead sx={sx}>
      <TableRow>
        {onSelectAllRows && (
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={(event) => onSelectAllRows(event.target.checked)}
            />
          </TableCell>
        )}

        {headLabel && headLabel.map((headCell, idx) => (
          <>
            {(themeNotShowColumns[column_table] ?? {})[headCell?.id] != 1 &&
              <>
                <TableCell
                  key={headCell.id}
                  align={headCell.align || 'left'}
                  sortDirection={orderBy === headCell.id ? order : false}
                  sx={{
                    width: headCell.width,
                    minWidth: headCell.minWidth,
                    fontSize: '0.8rem',
                    padding: '16px 0',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Row style={{ alignItems: 'center' }}>
                    <div style={{ borderLeft: `${idx != 0 ? '1px solid #ccc' : ''}`, paddingLeft: '8px', height: '1.5rem' }} />
                    {onSort ? (
                      <TableSortLabel
                        hideSortIcon
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => onSort(headCell.id)}
                        sx={{ textTransform: 'capitalize' }}
                      >
                        {headCell.label}

                        {orderBy === headCell.id ? (
                          <Box sx={{ ...visuallyHidden }}>
                            {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                          </Box>
                        ) : null}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                    <div style={{ paddingLeft: '16px' }} />
                  </Row>

                </TableCell>
              </>}
          </>
        ))}
      </TableRow>
    </TableHead>
  );
}
