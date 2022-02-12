import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Paper, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { 
  fetchJournalStartAsync, 
  deleteJournalEntryStartAsync, 
  updateJournalEntryStartAsync,
  clearUpdateFailure,
  clearDeleteFailure,
  clearFetchFailure
} from '../../redux/journal/journal.actions';
import { 
  selectFoodJournal, 
  selectIsJournalLoaded, 
  selectIsJournalDeleting, 
  selectIsJournalUpdating, 
  selectIsJournalFetching, 
  selectDeleteFailure,
  selectUpdateFailure,
  selectFetchFailure
} from '../../redux/journal/journal.selectors';
import AC from '../../common/constants';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import DataGridToolBar from '../journal-data-grid-toolbar/journal-data-grid-toolbar.component';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import memoize from 'lodash.memoize';

import { GridTitle } from './journal-data-grid.styles';

class JournalDataGrid extends React.Component {
  
    state = { 
      isAdmin: false, 
      isPowerUser: false,
      sortModel: localStorage.myPageSort ? JSON.parse(localStorage.myPageSort) : [{
        field: 'when',
        sort: 'desc'
      }],
      pageSize: localStorage.myPageSize ? Number(localStorage.myPageSize) : 10
    }

    selections = [];

    refreshInterval = null;

    componentDidMount() {
      this.props.fetchJournalStartAsync();
      if (this.props?.currentUser?.token) {
        const { currentUser } = this.props;
        this.setState({
          isAdmin: currentUser?.roles?.admin,
          isPowerUser: currentUser?.roles?.powerUser
        });
      }
      this.refreshInterval = setInterval(()=>{
        this.props.fetchJournalStartAsync();
      },AC.FIVE_MINUTES)
    }

    componentDidUpdate(prevProps) {
      this.checkForErrors();
    }

    componentWillUnmount() {
      clearInterval(this.refreshInterval);
    }

    handleDelete = ()=> {
      this.selections.forEach(element => {
        this.props.deleteJournalEntry({ id: element })
      });
    }

    handleSelection = (selections)=> {
      this.selections = selections;
    }

    getBaseColumns = (canEdit)=> {
      return [
        { 
          field: 'food', headerName: 'Food', width: 180, editable: canEdit, flex: true,
          preProcessEditCellProps: (params) => ({ ...params.props, error: /^\s*$/.test(params.props.value) || params.props.value.length < 3 })
        },
        { 
          field: 'calories', headerName: 'Calories', type: 'number', editable: canEdit, 
          preProcessEditCellProps: (params) => ( {...params.props, error: params.props.value < 1 })
        },
        { 
          field: 'price', headerName: 'Price', type: 'number', editable: canEdit, 
          valueFormatter: obj => obj && new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(obj.value),
          preProcessEditCellProps: (params) => ( {...params.props, error: params.props.value < 1 })
        },
        {
          field: 'when', headerName: 'Entry Date', type: 'dateTime', width: 180, editable: canEdit,
          preProcessEditCellProps: (params) => ( {...params.props, error: /^\s*$/.test(params.props.value) }),
          valueGetter: (value) => { if (value?.row?.when) return new Date(value.row.when) }
        },
      ];
    }

    adminColumn = [ { field: 'userName', headerName: 'User', width: '90' } ]

    getAdminColumns = memoize(() => ([...this.adminColumn, ...this.getBaseColumns({canEdit:true})]));
    getPowerUserColumns = memoize(() => (this.getBaseColumns({canEdit:true})));
    getUserColumns = memoize(()=> this.getBaseColumns());

    getColumns = ()=> {
      const { isAdmin, isPowerUser } = this.state;
      if (isAdmin) return this.getAdminColumns();
      if (isPowerUser) return this.getPowerUserColumns();
      return this.getUserColumns();
    }

    handlePageSizeChange = (newPageSize)=> {
      this.setState({pageSize: newPageSize});
      localStorage.myPageSize = newPageSize.toString();
    }

    handleSortChange = (newModel)=> {
      this.setState({sortModel:newModel});
      localStorage.myPageSort = JSON.stringify(newModel);
    }

    handleCellEditCommit = (params) => {
      const { updateJournalEntry } = this.props;
      updateJournalEntry({ id: params.id, [params.field]: params.value });
    }

    checkForErrors = () => {
      const { updateErrorMessage, deleteErrorMessage, fetchErrorMessage, clearDeleteFailure, clearUpdateFailure, clearFetchFailure } = this.props;
      const { snackbar } = this.state;
      if (updateErrorMessage && !snackbar) {
        this.setState({snackbar: {children: `Error updating record ${updateErrorMessage}`, severity: 'error' }});
        clearUpdateFailure();
      } else if (deleteErrorMessage && !snackbar) {
        this.setState({snackbar: {children: `Error deleting record ${deleteErrorMessage}`, severity: 'error' }});
        clearDeleteFailure();
      } else if (fetchErrorMessage && !snackbar) {
        this.setState({snackbar: {children: `Error fetching records ${fetchErrorMessage}`, severity: 'error' }});
        clearFetchFailure();
      }
    }

    handleDateFilter = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.setState({test:true})
    }

    handleClearDateFilter = (event) => {
      this.setState({test:true})
    }

    getToolBar = () => (
      <DataGridToolBar 
        state={this.state} 
        selections={this.selections} 
        handleDelete={this.handleDelete}/>
    )

    render() {
        const { foodJournal, isLoaded, isDeleting, isUpdating, isFetching, currentUser } = this.props;
        const { isAdmin, isPowerUser, sortModel, pageSize, snackbar } = this.state;
        return (
            <Paper key='datagrid' style={{ height: 590, width: isAdmin || isPowerUser ? 700 : 600, display: 'flex' }} elevation={24}>
              <Box
                sx={{
                  height: 560,
                  width: 1,
                  '& .MuiDataGrid-cell--editing': {
                    bgcolor: 'rgb(255,215,115, 0.19)',
                    color: '#1a3e72',
                    '& .MuiInputBase-root': {
                      height: '100%',
                    },
                  },
                  '& .Mui-error': {
                    bgcolor: (theme) =>
                      `rgb(126,10,15, ${theme.palette.mode === 'dark' ? 0 : 0.1})`,
                    color: (theme) => (theme.palette.mode === 'dark' ? '#ff4343' : '#750f0f'),
                  },
                }}
              >
                <GridTitle>{isAdmin ? "User's Food Journals" : `${currentUser?.displayName}'s Food Journal`}</GridTitle>
                <DataGrid
                  key={`entries${currentUser.id.toString()}`}
                  checkboxSelection={isAdmin || isPowerUser}
                  onSelectionModelChange={this.handleSelection}
                  pageSize={pageSize}
                  onPageSizeChange={this.handlePageSizeChange}
                  rowsPerPageOptions={[5, 10, 20, 50]}
                  sortModel={sortModel}
                  density='compact'
                  onSortModelChange={this.handleSortChange}
                  onCellEditCommit={this.handleCellEditCommit}
                  disableSelectionOnClick
                  components={{ Toolbar: this.getToolBar }}
                  rows={isLoaded ? foodJournal : []}
                  columns={this.getColumns()}
                  loading={!isLoaded || isDeleting || isUpdating || isFetching}
                />
                  {
                    !!snackbar && (
                      <Snackbar 
                        open 
                        onClose={()=>this.setState({snackbar:null})} 
                        autoHideDuration={6000} 
                        anchorOrigin={{ vertical:'top', horizontal:'center' }}>
                        <Alert {...snackbar} onClose={()=>this.setState({snackbar:null})} />
                      </Snackbar>
                    )
                  }
                </Box>
            </Paper>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    fetchJournalStartAsync: () => dispatch(fetchJournalStartAsync()),
    deleteJournalEntry: (data) => dispatch(deleteJournalEntryStartAsync(data)),
    updateJournalEntry: (data) => dispatch(updateJournalEntryStartAsync(data)),
    clearDeleteFailure: () => dispatch(clearDeleteFailure()),
    clearUpdateFailure: () => dispatch(clearUpdateFailure()),
    clearFetchFailure: () => dispatch(clearFetchFailure())
  });

const mapStateToProps = createStructuredSelector({
  foodJournal: selectFoodJournal,
  currentUser: selectCurrentUser,
  isLoaded: selectIsJournalLoaded,
  isDeleting: selectIsJournalDeleting,
  isUpdating: selectIsJournalUpdating,
  isFetching: selectIsJournalFetching,
  updateErrorMessage: selectUpdateFailure,
  deleteErrorMessage: selectDeleteFailure,
  fetchErrorMessage: selectFetchFailure
})
  
export default connect(mapStateToProps,mapDispatchToProps)(JournalDataGrid);