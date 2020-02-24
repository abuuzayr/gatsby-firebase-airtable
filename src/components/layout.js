import React, { Component, Fragment } from 'react';
import { Link } from 'gatsby';
import * as ROUTES from '../constants/routes';

import Navigation from './Navigation';
import getFirebase, { FirebaseContext } from './Firebase';
import withAuthentication from './Session/withAuthentication';
import '../styles/layout.scss'

class Layout extends Component {
  state = {
    firebase: null,
  };

  componentDidMount() {
    const app = import('firebase/app');
    const auth = import('firebase/auth');
    const database = import('firebase/database');

    Promise.all([app, auth, database]).then(values => {
      const firebase = getFirebase(values[0]);

      this.setState({ firebase });
    });
  }

  render() {
    return (
      <FirebaseContext.Provider value={this.state.firebase}>
        <AppWithAuthentication {...this.props} />
      </FirebaseContext.Provider>
    );
  }
}

const AppWithAuthentication = withAuthentication(({ children, fullpage, page }) => (
  <Fragment>
    {!fullpage && <Navigation />}
    {
      !fullpage &&
      <div className="container">
        <div className="columns">
          <div className="column">
            <nav className="breadcrumb" aria-label="breadcrumbs">
              <ul>
                <li>
                  <Link to={ROUTES.HOME}>
                    CRM
                  </Link>
                </li>
                <li className="is-active">
                  <a href="#" aria-current="page">{page}                                        </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        {children}
      </div>
    }
    { fullpage && children }
  </Fragment>
));

export default Layout;
