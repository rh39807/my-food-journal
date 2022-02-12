import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Alert, Box, Snackbar } from '@mui/material';
import GoogleChart from '../charts/google-chart.component';
import { StatusContainer, ChartContainer, ChartTitle, ChartNoteLeft, ChartNoteRight } from './status.styles';
import moment from 'moment';
import { selectAppEntryVelocity, selectUserBudgetStatus } from '../../redux/journal/journal.selectors';
import { selectCurrentUser } from '../../redux/user/user.selectors';

import './status.style.scss';
import { ArrowDownward, ArrowUpward, DescriptionOutlined } from '@mui/icons-material';
import ModalInfo from '../modals/info-modal.component';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
})

class StatusCharts extends React.Component {

  componentDidMount() {
    this.checkForOverBudget();
  }

  componentDidUpdate() {
    this.checkForOverBudget();
  }

  state = {}

  setSnackBar = (message)=> {
    this.setState({ snackbar: {children: message, severity: 'error'}})
  }
  
  checkForOverBudget = () => {
    const { snackbar } = this.state;
    let overCalories = this.props?.userBudgetStatus?.calories?.day?.overBudget;
    let overPrice = this.props?.userBudgetStatus?.price?.month?.overBudget;
    let prevAlertCalRec = localStorage?.alertedOverCalorieBudget;
    let prevAlertPriceRec = localStorage?.alertedOverPriceBudget;
    let prevAlertCal = prevAlertCalRec && moment().isSame(prevAlertCalRec, 'day');
    let prevAlertPrice = prevAlertPriceRec && moment().isSame(prevAlertPriceRec, 'month');
    if (overCalories && !prevAlertCal && !snackbar) {
      this.setSnackBar(`Warning you are over your calorie budget for today`);
      localStorage.alertedOverCalorieBudget = moment().format('YYYY-MM-DD');
    } 
    if (overCalories === false && prevAlertCal) delete localStorage.alertedOverCalorieBudget;
    if (overPrice && !prevAlertPrice && !snackbar) {
      setTimeout(()=>{
        this.setSnackBar(`Warning you are over your food spending budget for this month`);
      }, overCalories && !prevAlertCal ? 6500 : 0)
      localStorage.alertedOverPriceBudget = moment().format('YYYY-MM-DD');
    }
    if (overPrice === false && prevAlertPrice) delete localStorage.alertedOverPriceBudget;
  }

  getAppEntriesOptions = (last,prev) => {
    return {
        chartId:'entries',
        title: 'Total Application Journal Entries',
        subTitle: 'test',
        chartArea: { width: "51%" },
        tooltip: {
            ignoreBounds: true,
            isHtml: true
        },
        colors: ["#4b6584", last > prev ? "#16a085" : '#eb3b5a'],
        series: {
            1: { type: 'line'}
        },
        seriesType: "bars",
        animation: {
            startup: true,
            easing: "linear",
            duration: 1000,
        },
    }
  }

  getChartOptions = ({ defaultLimit, multiplier, green, interval, budget }) => {
    const { currentUser } = this.props;
    let limit = currentUser?.budget?.[budget][interval] ? currentUser.budget[budget][interval].limit : defaultLimit;
    let range = Math.round(limit * multiplier);
    let max = limit + range;
    let warn = limit - range;
    return {
      chartId:budget,
      width: 220,
      height: 160,
      redFrom: limit,
      redTo: max,
      greenFrom: !green ? undefined : green < warn ? green : 0,
      greenTo: green ? warn : undefined,
      yellowFrom: warn,
      yellowTo: limit,
      minorTicks: 5,
      max: max,
    }
  }

    getCaloriesChartOptions = ()=> {
        return this.getChartOptions({ defaultLimit: 2100, multiplier: .19, green: 900, budget: 'calories', interval: 'day' });
    }

    getPriceChartOptions = () => {
        return this.getChartOptions({ defaultLimit: 1000, multiplier: .22, budget: 'price', interval: 'month' });
    }

    handleCalorieNoteClick = (calStat) => {
        this.setState({statusModalInfo:{
            body: this.getCalorieNote(calStat),
            title:<span>Hi {this.props.currentUser.displayName}, here is your daily calorie report:</span>
            }
        })
    }

    handlePriceNoteClick = (priceStat) => {
        this.setState({statusModalInfo:{
          body: this.getPriceNote(priceStat),
          title:<span>Hi {this.props.currentUser.displayName}, here is your monthly spending report:</span>
        }})
    }

    getCalorieNote = (calStat) => (
        <table>
            <tbody>
            <tr><td>Journal Entries:</td><td>{calStat.entries}</td></tr>
            <tr><td>Calorie Budget:</td><td>{calStat.budget.toLocaleString("en-US")}</td></tr>
            <tr><td>Calories Used Today:</td><td>{calStat.total.toLocaleString("en-US")}</td></tr>
            <tr><td>Calories Remaining:</td><td>{calStat.remaining > 0 ? calStat.remaining.toLocaleString("en-US") : 0}</td></tr>
            <tr><td>You are {calStat.overBudget ? 'over' : 'under'} budget for today:</td><td>{calStat.overBudget ? <ArrowUpward color='warning'/> : <ArrowDownward color='success'/>}</td></tr>
            </tbody>
        </table>
    )

    getPriceNote = (priceStat) => (
        <table>
            <tbody>
                <tr><td>Journal Entries:</td><td>{priceStat.entries}</td></tr>
                <tr><td>Food Budget:</td><td>{currencyFormatter.format(priceStat.budget)}</td></tr>
                <tr><td>Spending This Month:</td><td>{currencyFormatter.format(priceStat.total)}</td></tr>
                <tr><td>Left To Spend:</td><td>{priceStat.remaining > 0 ? currencyFormatter.format(priceStat.remaining) : 0}</td></tr>
                <tr><td>You are {priceStat.overBudget ? 'over' : 'under'} budget for this month:</td><td>{priceStat.overBudget ? <ArrowUpward color='warning'/> : <ArrowDownward color='success'/>}</td></tr>
            </tbody>
        </table>
    )

  render() {
    const isAdmin = this.props?.currentUser?.roles.admin;
    let calStat = this.props?.userBudgetStatus?.calories?.day;
    let priceStat = this.props?.userBudgetStatus?.price?.month;
    const { appEntryVelocity, currentUser} = this.props;
    const { snackbar } = this.state;
    const last = appEntryVelocity && appEntryVelocity.lastSevenDays ? appEntryVelocity.lastSevenDays : 0;
    const prev = appEntryVelocity && appEntryVelocity.previousSevenDays ? appEntryVelocity.previousSevenDays : 0;
    return (
        <StatusContainer elevation={24} sx={{ padding: '8px', minHeight: '150px' }}>
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
          <Box>
            {
              isAdmin && calStat && appEntryVelocity?.difference && currentUser?.token
              ?
              <ChartContainer style={{height: '250px'}}>
                <GoogleChart
                  key='total-app-entries'
                  chartType='ComboChart'
                  data={[
                    ['Range', 'Journal Entries', 'Trend', { role: 'annotation' } ],
                    ['Prev 7 Days', prev,  prev, prev],
                    ['Last 7 Days', last, last, last]
                  ]}
                  options={this.getAppEntriesOptions(last,prev)}
                  width='100%'
                  height='200px'
                />
              </ChartContainer>
              :
              currentUser?.token && !(currentUser.roles.admin) 
              ?
              <ChartContainer>
                <div>
                  <ChartTitle>{currentUser.displayName}'s Calories Today</ChartTitle>
                  <GoogleChart 
                    chartType='Gauge'
                    width="100%"
                    height="200px"
                    data={[
                      ["Label", "Value"],
                      ["Calories", calStat && calStat.total ? calStat.total : 0]
                    ]}
                    options={this.getCaloriesChartOptions()}
                  />
                  {
                    calStat && calStat.budget &&
                    (
                      <ChartNoteLeft onClick={ () => this.handleCalorieNoteClick(calStat) }>
                        <DescriptionOutlined color='info' fontSize='large'/>
                      </ChartNoteLeft>
                    )
                  }
                </div>
                <div>
                  <ChartTitle>Monthly Food Cost</ChartTitle>
                  <GoogleChart 
                    chartType='Gauge'
                    width="100%"
                    height="200px"
                    data={[
                      ["Label", "Value"],
                      ["$$$", priceStat && priceStat.total ? priceStat.total : 0]
                    ]}
                    options={this.getPriceChartOptions()}
                  />
                  {
                    priceStat && priceStat.entries && (
                      <ChartNoteRight onClick={()=>this.handlePriceNoteClick(priceStat)}>
                        <DescriptionOutlined color='info' fontSize='large' />
                      </ChartNoteRight>
                    )
                  }
                </div>
              </ChartContainer>
              :
              <div/>
            }
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
  userBudgetStatus: selectUserBudgetStatus,
  currentUser: selectCurrentUser
})

export default connect(mapStateToProps)(StatusCharts);