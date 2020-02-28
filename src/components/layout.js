import React, { Component, Fragment } from 'react';
import { Link } from 'gatsby';
import ROUTES from '../constants/routes';
import Navigation from './Navigation';
import getFirebase, { FirebaseContext } from './Firebase';
import withAuthentication from './Session/withAuthentication';
import '../styles/layout.scss'
import Select from 'react-select'
import { CompanyContext } from './Company'

class Layout extends Component {
  state = {
    firebase: null,
    companies: [],
    company: ''
  };

  setCompany = (company) => {
    this.setState({ company })
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
    const { company, companies } = this.state
    return (
      <FirebaseContext.Provider value={this.state.firebase}>
        <CompanyContext.Provider value={{ company, companies, setCompany: this.setCompany }}>
          <AppWithAuthentication 
            {...this.props}
          />
        </CompanyContext.Provider>
      </FirebaseContext.Provider>
    );
  }
}

const AppWithAuthentication = withAuthentication(props => {
  const { children, pageContext, location, authUser } = props
  const fullpage = pageContext && pageContext.layout && pageContext.layout === 'fullpage'
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
                    <span>{Object.keys(ROUTES)[Object.values(ROUTES).indexOf(location.pathname)]}</span>
                  </li>
                </ul>
              </nav>
            </div>
            {
              <div className="column">
                <div className="is-pulled-right">
                  <small>Company: </small>
                  <div className="is-inline-block" style={{ 'minWidth': 200 }}>
                    <CompanyContext.Consumer>
                      {
                        ({ company, companies, setCompany }) => {
                          if (authUser && Object.keys(authUser.roles).includes('ADMIN')) {
                            if (!companies.includes('All')) companies.unshift('All')
                          }
                          companies = companies.map(c => {
                            return {
                              value: c,
                              label: c
                            }
                          })
                          return <Select 
                            options={companies} 
                            width='200px' 
                            onChange={setCompany}
                            defaultValue={company || companies[0]}>
                          </Select>
                        }
                      }
                    </CompanyContext.Consumer>
                  </div>
                </div>
              </div>
            }
          </div>
          {children}
        </div>
      }
      { fullpage && children }
    </Fragment>
  )
});

export default Layout;
