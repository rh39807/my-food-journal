import React from 'react';
import { useContext } from 'react';
import ProgressModal from '../../components/modals/progress-modal.component';
import CurrentUserContext from '../../contexts/current-user/current-user.context';

import SignIn from '../../components/sign-in/sign-in.component';
import SignUp from '../../components/sign-up/sign-up.component';

import './login.styles.scss';

const Login = (props)=> {
    const currentUser = useContext(CurrentUserContext);
    
    if (currentUser === 'loading' || currentUser?.multiFactor) {
        return <ProgressModal open={true} message={'One Moment Intializing App'}/>
    } else if (currentUser?.displayName) {
        return props.children;
    } else {
        return (
            <div className='sign-in-and-sign-up'>
                <SignIn/>
                <SignUp/>
            </div>
        )
    }
}

export default Login;