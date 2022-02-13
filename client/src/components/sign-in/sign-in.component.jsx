import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import FormInput from '../form-input/form-input.component';
import CustomButton from '../custom-button/custom-button.component';

import { auth, signInWithGoogle } from '../../firebase/firebase.utils';

import './sign-in.styles.scss';

class SignIn extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      snackbar: null
    };
  }

  setSnackBar = (message)=> {
    this.setState({ snackbar: {children: message, severity: 'error'}})
  }

  handleSubmit = async event => {
    event.preventDefault();

    const { email, password } = this.state;

    try {
      await auth.signInWithEmailAndPassword(email,password);
      this.setState({ email: '', password: '' });
    } catch(error) {
      this.setSnackBar('Authentication error, please try again');
    }
  };

  handleChange = event => {
    const { value, name } = event.target;

    this.setState({ [name]: value });
  };

  render() {
    const { snackbar } = this.state;
    return (
      <div className='sign-in'>
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
        <h2>I already have an account</h2>
        <span>Sign in with your email and password</span>

        <form onSubmit={this.handleSubmit}>
          <FormInput
            name='email'
            type='email'
            handleChange={this.handleChange}
            value={this.state.email}
            label='email'
            required
          />
          <FormInput
            name='password'
            type='password'
            value={this.state.password}
            handleChange={this.handleChange}
            label='password'
            required
          />
          <div className='buttons'>
            <CustomButton type='submit'> SIGN IN </CustomButton>
            <CustomButton type='button' onClick={signInWithGoogle} isGoogleSignIn={true}> SIGN IN WITH GOOGLE</CustomButton>
          </div>
        </form>
      </div>
    );
  }
}

export default SignIn;