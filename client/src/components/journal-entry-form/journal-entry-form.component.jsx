import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import moment from 'moment';
import { Button, TextField, Paper, Box, CircularProgress, InputAdornment, Autocomplete } from '@mui/material';
import { styled } from '@mui/material/styles';
import { selectCurrentUser, selectUserList, selectUserListIsFetching } from '../../redux/user/user.selectors';
import { addJournalEntryStartAsync } from '../../redux/journal/journal.actions';
import { selectIsJournalAdding, selectUserBudgetStatus } from '../../redux/journal/journal.selectors';
import { fetchUserListStartAsync } from '../../redux/user/user.actions';

const Item = styled(Paper)(()=> ({
    display: 'flex',
    padding:20,
    height: 'max-content',
    width: 'max-content'
})) 

class JournalEntryForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            uid: '',
            food: '',
            calories: '',
            price: '',
            when: '',
            calorieHelperText: '',
            priceHelperText: ''
        }
    }

    componentDidMount() {
        if (this.props?.currentUser?.roles?.admin) {
            this.props.fetchUserList();
        }
    }

    handleSubmit = (e)=> {
        e.preventDefault();
        const { currentUser, addJournalEntry } = this.props;
        const { food, calories, price, when, uid } = this.state;
        const data = {
            uid: uid?.value ? uid.value : currentUser.id,
            when: when,
            food,
            calories: Number(calories),
            price: Number(price)
        };
        addJournalEntry(data);
        this.resetState();
        
    }

    resetState = ()=> {
        this.setState({
            uid: '',
            food: '',
            calories: '',
            price: '',
            when: '',
            calorieHelperText: '',
            priceHelperText: ''
        })
    }

    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState({[name]:value}); 
    }

    handleCalorieChange = (e) => {
        const { name, value } = e.target;
        let helpTxt = '';
        if (this.props?.userBudgetStatus?.calories?.day?.remaining) {
            const {remaining} = this.props.userBudgetStatus.calories.day;
            if (value > remaining) helpTxt = 'Warning this is over your daily budget';
        }
        this.setState({
            [name]:value,
            calorieHelperText: helpTxt
        }); 
    }

    handlePriceChange = (e) => {
        const { name, value } = e.target;
        let helpTxt = '';
        if (this.props?.userBudgetStatus?.price?.month?.remaining) {
            const {remaining} = this.props.userBudgetStatus.price.month;
            if (value > remaining) helpTxt = 'Warning this is over your monthly budget';
        }
        this.setState({
            [name]:value,
            priceHelperText: helpTxt
        }); 
    }

    render() {
        const { food, calories, price, when, uid, calorieHelperText, priceHelperText } = this.state;
        const { isAdding, currentUser, isFetching, userList } = this.props;
        const isAdmin = currentUser?.roles?.admin;
        const options = userList && userList.length ? userList : [];
        return (
            <Item elevation={24} sx={{ padding: '8px' }}>
                <Box 
                    component="form"
                    sx={{
                        '& > :not(style)': { m: 1, display: 'flex' , margin: '10px'},
                    }}
                    onSubmit={this.handleSubmit}
                    onReset={this.resetState}
                >
                    {
                        isAdmin 
                        ?
                        <Autocomplete
                            key='userList'
                            value={uid}
                            onChange={(event, newValue) => {this.setState({ uid: newValue});}}
                            id="userList"
                            options={options}
                            isOptionEqualToValue={(option, value) => option.value === value.value}
                            loading={isFetching}
                            sx={{ width: 300 }}
                            renderInput={(params) => (
                                <TextField {...params} 
                                    variant={'filled'} 
                                    label="User" 
                                    required
                                    autoFocus={true}
                                    onFocus={ () => {
                                        this.setState({uid: { value:currentUser.id, label: currentUser.displayName}})
                                    }}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                          <React.Fragment>
                                            {isFetching ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                          </React.Fragment>
                                        ),
                                    }}/>
                            )}
                          />
                        :
                        null
                    }
                    <TextField 
                        name="food" 
                        label="Food" 
                        type="input"
                        value={food}
                        onChange={this.handleChange}
                        variant="filled" 
                        disabled={isAdding}
                        required 
                        autoFocus={!isAdmin}/>
                    <TextField
                        error={!!calorieHelperText}
                        name="calories"
                        label="Calories"
                        type="number"
                        required
                        value={calories}
                        onChange={this.handleCalorieChange}
                        disabled={isAdding}
                        inputProps={{min:1}}
                        helperText={calorieHelperText}
                        variant="filled"
                        />
                    <TextField
                        error={!!priceHelperText}
                        name="price"
                        className='price'
                        value={price}
                        onChange={this.handlePriceChange}
                        disabled={isAdding}
                        label="Price"
                        type="number"
                        required
                        helperText={priceHelperText}
                        inputProps={{min:.3, step: 'any'}}
                        InputProps={{startAdornment:<InputAdornment position="start">$</InputAdornment>}}
                        variant="filled"
                    />
                    <TextField 
                        name="when" 
                        label="When" 
                        variant="filled" 
                        value={when}
                        onFocus={()=>{if (!when) this.setState({when:moment().format('YYYY-MM-DDTHH:mm')})}}
                        onChange={this.handleChange}
                        disabled={isAdding}
                        required 
                        type='datetime-local' 
                        InputLabelProps={{
                            shrink: true,
                        }}/>
                    <Box>    
                        <Button type='submit' variant='contained' style={{width: '17ch',height: '6ch'}}>
                            { 
                                isAdding
                                ?
                                <CircularProgress
                                    size={40}
                                    sx={{color: '#ffffff',}}
                                />
                                :
                                'Log Food'
                            }
                        </Button>
                        <Button type='reset' sx={{margin: '0px 20px' }}>Reset</Button>
                    </Box>
                </Box>
            </Item>
        )
    }
}    

const mapStateToProps = createStructuredSelector({
    currentUser: selectCurrentUser,
    isAdding: selectIsJournalAdding,
    userList: selectUserList,
    isFetching: selectUserListIsFetching,
    userBudgetStatus: selectUserBudgetStatus
})

const mapDispatchToProps = dispatch => ({
    addJournalEntry: (data) => dispatch(addJournalEntryStartAsync(data)),
    fetchUserList: () => dispatch(fetchUserListStartAsync())
});
   

export default connect(mapStateToProps,mapDispatchToProps)(JournalEntryForm);