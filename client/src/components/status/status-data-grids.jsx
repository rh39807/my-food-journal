import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Box, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DataGridToolBar from '../journal-data-grid-toolbar/journal-data-grid-toolbar.component';
import { StatusContainer, GridTitle } from './status.styles';
import { 
  selectAppEntryVelocity, 
  selectUserBudgetStatus, 
  selectUserDailyTotals, 
  selectUsersSevenDayCalorieAverage,
  selectIsJournalLoaded,
  selectIsJournalFetching
} from '../../redux/journal/journal.selectors';
import memoize from 'lodash.memoize';
import { selectCurrentUser } from '../../redux/user/user.selectors';

import './status.style.scss';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import ModalInfo from '../modals/info-modal.component';

class StatusDataGrids extends React.Component {

  state = { 
    sortModel: localStorage?.myStatusPageSort ? JSON.parse(localStorage.myPageSort) : [
        {
            field: this.props?.currentUser?.roles.admin ? 'avgCalories' : 'when',
            sort: 'desc'
        }
    ],
    pageSize: localStorage?.myStatusPageSize ? Number(localStorage.myPageSize) : 10
  }

  userColumns = [
    { field: 'when', headerName: 'Day', type: 'date' },
    { 
      field: 'calories', headerName: 'Calories', type: 'number',
      cellClassName: (obj) => (obj?.row?.overBudget) ? 'over-budget' : 'under-budget'
    },
    { 
      field: 'price', headerName: 'Price', type: 'number', 
      valueFormatter: obj => obj && new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(obj.value)
    },
    {
      field: 'overBudget', headerName:'', filterable: false, 
      renderCell: (obj) => {
        if (obj.value) {
          return (
            <Tooltip title='Sorry you were over budget for this day'>
              <ArrowUpward color='error'/>
            </Tooltip>
          )
        } else {
          return (
            <Tooltip title='Congratulations you were under budget for this day' >
              <ArrowDownward color='success'/>
            </Tooltip>
          )
        }
      }
    }
  ];

  adminColumns = [
    { field: 'uid', headerName: 'UID', type: 'number', width: '50' },
    { field: 'userName', headerName: 'User' },
    { field: 'avgCalories', headerName: 'Avg 7 Day Calories', type: 'number', width: '180',
      cellClassName: (obj) => (obj?.row?.overBudget) ? 'over-budget' : 'under-budget'
    },
    {
      field: 'overBudget', headerName:'', filterable: false, 
      renderCell: (obj) => {
        if (obj.value) {
          return (
            <Tooltip title="User's average was over their daily budget">
              <ArrowUpward color='error'/>
            </Tooltip>
          )
        } else {
          return (
            <Tooltip title="User's average was under their daily budget">
              <ArrowDownward color='success'/>
            </Tooltip>
          )
        }
      }
    }
  ]

  getAdminColumns = memoize(() => (this.adminColumns));
  getUserColumns = memoize(()=> (this.userColumns));

  getColumns = ()=> {
    if (this.props?.currentUser?.roles?.admin) {
      return this.getAdminColumns();
    } else {
      return this.getUserColumns();
    }
  }

  getToolBar = () => (
    <DataGridToolBar 
      noFilter={true} 
      noDensity={true} 
      noColumns={true} 
    />
  )

  handlePageSizeChange = (newPageSize)=> {
    this.setState({pageSize: newPageSize});
    if (newPageSize) localStorage.myStatusPageSize = newPageSize.toString();
  }

  handleSortChange = (newModel)=> {
    this.setState({sortModel:newModel});
    if (newModel && newModel.length) localStorage.myStatusPageSort = JSON.stringify(newModel);
  }

  render() {
    const isAdmin = this.props?.currentUser?.roles.admin;
    const { isLoaded, isFetching, currentUser, userDailyTotals, usersSevenDayCalorieAverage } = this.props;
    const { sortModel, pageSize } = this.state;
    return (
        <StatusContainer elevation={24} sx={{ marginTop: '8px'}}>
          <Box sx={{height: '400px' }}>
            <GridTitle>{isAdmin ? "User's 7 Day Calorie Average" : 'Daily Totals'}</GridTitle>
            <DataGrid
                  key={`statusGrid${currentUser?.id?.toString()}`}
                  pageSize={pageSize}
                  onPageSizeChange={this.handlePageSizeChange}
                  rowsPerPageOptions={[5, 10, 20, 50]}
                  sortModel={sortModel}
                  density='compact'
                  onSortModelChange={this.handleSortChange}
                  onCellEditCommit={this.handleCellEditCommit}
                  disableSelectionOnClick
                  components={{ Toolbar: this.getToolBar }}
                  rows={isAdmin && usersSevenDayCalorieAverage ? usersSevenDayCalorieAverage : userDailyTotals ? userDailyTotals : []}
                  columns={this.getColumns()}
                  loading={!isLoaded || isFetching}
                />
            </Box>
            <ModalInfo
                {...this.state.statusModalInfo ? this.state.statusModalInfo : {}}
                handleClose={()=>{this.setState({statusModalInfo:false})}}
                open={this.state.statusModalInfo ? true : false}
            />
        </StatusContainer>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  appEntryVelocity: selectAppEntryVelocity,
  usersSevenDayCalorieAverage: selectUsersSevenDayCalorieAverage,
  userBudgetStatus: selectUserBudgetStatus,
  userDailyTotals: selectUserDailyTotals,
  currentUser: selectCurrentUser,
  isLoaded: selectIsJournalLoaded,
  isFetching: selectIsJournalFetching
})

export default connect(mapStateToProps)(StatusDataGrids);