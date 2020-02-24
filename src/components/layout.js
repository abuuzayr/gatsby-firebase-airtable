import React, { Component, Fragment, cloneElement } from 'react';
import { Link } from 'gatsby';
import * as ROUTES from '../constants/routes';

import Navigation from './Navigation';
import getFirebase, { FirebaseContext } from './Firebase';
import withAuthentication from './Session/withAuthentication';
import '../styles/layout.scss'

class Layout extends Component {
  state = {
    firebase: null,
    companies: [],
    company: ''
  };

  setCompany = (e) => {
    this.setState({
      company: e.currentTarget.value
    })
  }

  async componentDidMount() {
    const app = import('firebase/app');
    const auth = import('firebase/auth');
    const database = import('firebase/database');

    Promise.all([app, auth, database]).then(values => {
      const firebase = getFirebase(values[0]);

      this.setState({ firebase });
    });

    try {
      const companies = await fetch(`${process.env.GATSBY_STDLIB_URL}/getRawTableData?name=Companies`)
      if (companies.status === 200) {
        const body = await companies.json()
        if (body.result === 'success') {
          const companies = body.rows.map(row => row.fields['Name']).filter(Boolean)
          this.setState({
            companies,
            company: this.state.company ? this.state.company : companies[0]
          })
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  render() {
    return (
      <FirebaseContext.Provider value={this.state.firebase}>
        <AppWithAuthentication 
          {...this.props} 
          companies={this.state.companies}
          company={this.state.company}
          setCompany={this.setCompany}
        />
      </FirebaseContext.Provider>
    );
  }
}

const AppWithAuthentication = withAuthentication(props => {
  const { children, fullpage, page, companies, company, setCompany } = props
  return (
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
                    <a href="#" aria-current="page">{page}</a>
                  </li>
                </ul>
              </nav>
            </div>
            <div className="column">
              <div className="is-pulled-right">
                <small>Company: </small>
                <select value={company} onChange={setCompany}>
                  {
                    companies && companies.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))
                  }
                </select>
              </div>
            </div>
          </div>
          {cloneElement(children, { company: company ? company : companies[0] })}
        </div>
      }
      { fullpage && children }
    </Fragment>
  )
});

export default Layout;
