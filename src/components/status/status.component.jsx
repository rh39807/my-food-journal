import React from 'react';
import StatusCharts from './status-charts';
import StatusDataGrids from './status-data-grids';

const StatusBox = () => (
  <React.Fragment>
    <StatusCharts/>
    <StatusDataGrids/>
  </React.Fragment>
)

export default StatusBox;