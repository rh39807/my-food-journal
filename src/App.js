import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { selectCurrentUser } from './redux/user/user.selectors';
import { setCurrentUser } from './redux/user/user.actions';

import './App.css';
import HomePage from './pages/home-page/home-page.component';
import Header from './components/header/header.component';

class App extends React.Component {

  componentDidMount() {
    this.props.setCurrentUser();
  }

  render() {
    const { currentUser } = this.props;
    return (
      <div key={currentUser.id}>
        <Header currentUser={currentUser}/>
        <Switch>
          <Route path='/' component={HomePage}/>
        </Switch>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  setCurrentUser: (uid = "2") => dispatch(setCurrentUser(uid))
});

const mapStateToProps = createStructuredSelector({
  currentUser: selectCurrentUser
})

export default connect(mapStateToProps,mapDispatchToProps)(App);




