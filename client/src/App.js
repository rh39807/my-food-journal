import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { selectCurrentUser } from './redux/user/user.selectors';
import { setCurrentUser } from './redux/user/user.actions';
import CurrentUserContext from './contexts/current-user/current-user.context';
import { auth, createUserProfileDocument } from './firebase/firebase.utils';

import './App.css';
import HomePage from './pages/home-page/home-page.component';
import Login from './pages/login/login.component';
import Header from './components/header/header.component';

class App extends React.Component {

  state = { currentUser: 'loading' };

  componentDidMount() {
    this.props.setCurrentUser();
    this.unsubscribeFromAuth = auth.onAuthStateChanged( async userAuth => {
      if (userAuth) {
        const userRef = await createUserProfileDocument(userAuth);

        userRef.onSnapshot( snapShot => {
          this.setState({
            currentUser: {
              id: snapShot.id,
              ...snapShot.data()
            }
          })
        })
      }

      this.setState({ currentUser: userAuth });
    })
  }

  componentWillUnmount() {
    this.unsubscribeFromAuth();
  }

  render() {
    const { currentUser } = this.props;
    return (
      <div>
        <CurrentUserContext.Provider value={this.state.currentUser}>
          <Header currentUser={currentUser}/>
          <Login>
            <Switch>
              <Route path='/' component={HomePage}/>
            </Switch>
          </Login>
        </CurrentUserContext.Provider>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  setCurrentUser: (uid = "3") => dispatch(setCurrentUser(uid))
});

const mapStateToProps = createStructuredSelector({
  currentUser: selectCurrentUser
})

export default connect(mapStateToProps,mapDispatchToProps)(App);




