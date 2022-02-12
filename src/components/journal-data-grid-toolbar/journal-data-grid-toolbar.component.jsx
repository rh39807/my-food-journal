import React from 'react';
import { Box, Button } from '@mui/material';
import { DeleteForever } from '@mui/icons-material';
import { pink } from '@mui/material/colors';
import { 
    GridToolbarContainer, 
    GridToolbarExport, 
    GridToolbarColumnsButton, 
    GridToolbarFilterButton,
    GridToolbarDensitySelector
  } from '@mui/x-data-grid';
import JournalDateFilter from '../journal-date-filter/journal-date-filter.component';

const getDeleteButton = ({ state, selections, handleDelete }) => {
  const disabled = selections.length === 0;
  const { isAdmin, isPowerUser } = state;
  return (
    isAdmin || isPowerUser
    ?
    <Button 
      onClick={handleDelete}
      disabled={disabled} 
      style={disabled ? {} : { color: pink[disabled?100:400]}}>
      <DeleteForever sx={disabled ? {} : { color: pink[disabled?100:400] }} fontSize='small'/> Delete
    </Button>
    :
    null
  )
}

const DataGridToolBar = (props)=> (
  <Box key='data-grid-tool-bar' sx={{ paddingBottom: '0px', marginBottom: '-10px' }}>
    { !props.noFilter ? <JournalDateFilter /> : null }
    <GridToolbarContainer sx={{ marginTop: '0px', paddingTop: '0px' }}>
      { !props.noColumns ?<GridToolbarColumnsButton/> : null }
      { !props.noFilters ?<GridToolbarFilterButton/> : null }
      { !props.noDensity ? <GridToolbarDensitySelector/> : null }
      { !props.noExport ? <GridToolbarExport/> : null }
      { props.handleDelete ? getDeleteButton(props) : null }
    </GridToolbarContainer>
  </Box>
)

export default DataGridToolBar;