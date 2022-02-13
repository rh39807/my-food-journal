import React from 'react';
import { LogoContainer } from './header.style';
import { auth } from '../../firebase/firebase.utils';
import CurrentUserContext from '../../contexts/current-user/current-user.context';
import FoodBankTwoToneIcon from '@mui/icons-material/FoodBankTwoTone';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import { Chip } from '@mui/material';

const getDateTime = ()=> {
  return moment().format('MMMM DD, YYYY hh:mm A');
}

export default function Header(props) {
  const startDateTime = getDateTime();
  const [dateTime, setDateTime] = React.useState(startDateTime);

  React.useEffect(() => {
    const clockInterval = setInterval(()=>{
      setDateTime(getDateTime())
    },30000)
    return () => clearInterval(clockInterval);
  }, [ setDateTime ])

  const currentUser = React.useContext(CurrentUserContext);

  return (
    <Box sx={{ flexGrow: 1}}>
        <AppBar position="static">
          <Toolbar>
            <LogoContainer><FoodBankTwoToneIcon fontSize='inherit'/></LogoContainer>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
              My Food Journal {currentUser?.roles?.admin ? `- ${currentUser.displayName}'s Admin Page` : ''}
              {currentUser?.displayName && <Chip color='info' sx={{marginLeft: '10px'}} onClick={() => auth.signOut()} label='SIGN OUT'/>}
            </Typography>
            <Chip key='dateTime' label={dateTime} color='primary' variant='filled' sx={{fontWeight:700}}/>
          </Toolbar>
        </AppBar>
      </Box>
  );
}