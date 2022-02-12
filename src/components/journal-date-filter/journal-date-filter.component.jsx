import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Card, Box, Fab, TextField, Tooltip, Container } from '@mui/material';
import { FilterAltOff, FilterAlt, ArrowRightAlt } from '@mui/icons-material';
import { selectJournalFilter } from '../../redux/journal/journal.selectors';
import { setJournalFilterAsync, clearJournalFilterAsync } from '../../redux/journal/journal.actions';


class JournalDateFilter extends React.Component {

    state = { fromDate: '', toDate: ''}

    componentDidMount() {
        const { filter } = this.props;
        if (filter?.when) {
            const { fromDate, toDate } = filter.when;
            this.setState({ fromDate, toDate })
        } 
    }

    getFilterButtons = ()=> {
        const { filter } = this.props;
        return (
            <React.Fragment>
                <Fab 
                    key={ 'filter-on' } 
                    type={ 'submit' } 
                    size='small' 
                    color={ 'primary'}
                    sx={{marginLeft:0.2}}>
                    <Tooltip title='Apply date range filter' arrow><FilterAlt/></Tooltip>
                </Fab>
                <Fab 
                    key={ 'clear-filter' } 
                    type={ 'reset' } 
                    size='small' 
                    disabled={!filter?.when}
                    color={ 'secondary' }
                    sx={{marginLeft:0.2}}>
                    <Tooltip title='Clear date filter' arrow><FilterAltOff/></Tooltip>
                </Fab>
            </React.Fragment>
        )
    }

    handleSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const { setFilter } = this.props;
        const { fromDate, toDate } = this.state;
        setFilter({when:{type: 'date-range', fromDate, toDate }});
    }

    handleReset = (e) => {
        e.stopPropagation();
        this.props.clearFilter();
        this.setState({ fromDate: '', toDate: '' })
    }

    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    }
      
    render() {
        const { filter } = this.props;
        return (
            <Container sx={{position:'relative', height: '72px', width: '600px'}}>
                <Card variant="outlined" sx={{ 
                    margin: '4px 4px 0px 4px', 
                    borderBottom: filter ? '#9c27b0 solid 4px' : 'default', 
                    position: 'absolute', top:0, left:0, right:0 
                }}>
                    <Box 
                        key='date-filter-box'
                        component="form"
                        onSubmit={this.handleSubmit}
                        onReset={this.handleReset}
                        sx={{
                        padding: '6px 0px 6px 8px', 
                        width: '100%', 
                        display: 'flex', 
                        justifyContent: 'space-around'
                        }}
                    >
                        <div><h4 style={{margin:0, color: filter ? '#9c27b0' : '#3867d6'}}><i>Filter{filter ? 'ing' : ''} Entries<br/>By Date Range</i><ArrowRightAlt/></h4></div>
                        <div>
                            <TextField 
                                type='date' 
                                key='from-date'
                                name='fromDate'
                                value={this.state.fromDate}
                                onChange={this.handleChange}
                                label='Filter From' 
                                variant='filled' 
                                required
                                InputLabelProps={{ shrink: true}} 
                                sx={{ width: '22ch', marginRight: '15px'}}/>
                            <TextField 
                                type='date' 
                                name='toDate'
                                key='to-date'
                                value={this.state.toDate}
                                onChange={this.handleChange}
                                label='Filter To' 
                                variant='filled' 
                                required
                                InputLabelProps={{ shrink: true}} 
                                sx={{ width: '22ch' }}/>
                            {this.getFilterButtons()}
                        </div>
                    </Box>
                </Card>
            </Container>
        )
    }
}

const mapStateToProps = createStructuredSelector({
    filter: selectJournalFilter
})

const mapDispatchToProps = dispatch => ({
    setFilter: (filter) => dispatch(setJournalFilterAsync(filter)),
    clearFilter: () => dispatch(clearJournalFilterAsync())
})

export  default connect(mapStateToProps,mapDispatchToProps)(JournalDateFilter);