import React, { Component, Fragment } from 'react';
import { Link } from 'gatsby';
import ROUTES from '../constants/routes';
import Navigation from './Navigation';
import getFirebase, { FirebaseContext } from './Firebase';
import withAuthentication from './Session/withAuthentication';
import '../styles/layout.scss'
import Select from 'react-select'
import { CompanyContext } from './Company'
import { ToastProvider } from 'react-toast-notifications'
import { withFirebase } from './Firebase';
import Airtable from 'airtable'

const base = new Airtable({
  apiKey: process.env.GATSBY_AIRTABLE_APIKEY
}).base(process.env.GATSBY_AIRTABLE_BASE);

export const UsersContext = React.createContext([]);

class Layout extends Component {

  state = {
    firebase: null,
    companies: [],
    company: '',
    users: [],
    loading: false
  };

  setCompany = (company) => {
    this.setState({ company })
  }

  async componentDidMount() {
    const app = await import('firebase/app');
    const auth = await import('firebase/auth');
    const database = await import('firebase/database');

    const firebase = getFirebase(app, auth, database);
    this.setState({ firebase });

    try {
      const records = await base('Companies').select({
        view: "Grid view"
      }).all()
      const companies = records.filter(record => !!record.get('Company')).map(rec => rec._rawJson)
      this.setState({
        companies
      })
    } catch (e) {
      console.error(e)
    }
  }

  componentDidUpdate() {
    if (this.state.firebase) {
      this.state.firebase.users().on('value', snapshot => {
        const usersObject = snapshot.val();
  
        const usersList = Object.keys(usersObject).map(key => ({
          ...usersObject[key],
          uid: key,
        }));
  
        if (JSON.stringify(this.state.users) !== JSON.stringify(usersList)) {
          this.setState({
            users: usersList,
            loading: false,
          });
        }
  
      });
    }
  }

  componentWillUnmount() {
    this.state.firebase.users().off();
  }

  render() {
    const { company, companies, users } = this.state
    return (
      <FirebaseContext.Provider value={this.state.firebase}>
        <CompanyContext.Provider value={{ company, companies, setCompany: this.setCompany }}>
          <UsersContext.Provider value={users}>
            <ToastProvider>
              <AppWithAuthentication 
                {...this.props}
              />
            </ToastProvider>
          </UsersContext.Provider>
        </CompanyContext.Provider>
      </FirebaseContext.Provider>
    );
  }
}

const AppWithAuthentication = withAuthentication(props => {
  const { children, pageContext, location, authUser } = props
  const fullpage = pageContext && pageContext.layout && pageContext.layout === 'fullpage'
  const adminPage = pageContext && pageContext.layout && pageContext.layout === 'admin'
  const title = Object.keys(ROUTES)[Object.values(ROUTES).indexOf(location.pathname.replace(/\/+$/, ''))]
  return (
    <Fragment>
      {!fullpage && <Navigation />}
      {
        !fullpage &&
        <div className="container">
          <div className="container">
            <div className="columns" style={{ "margin": "0 0 0.75rem 0" }}>
              <div className="column">
                <nav className="breadcrumb" aria-label="breadcrumbs">
                  <ul>
                    <li>
                      <Link to={ROUTES.HOME}>
                        Home
                      </Link>
                    </li>
                    {
                      title !== 'HOME' &&
                      <li className="is-active">
                        <span>{`${title&&title.slice(0,1)}${title&&title.slice(1).toLowerCase()}`}</span>
                      </li>
                    }
                  </ul>
                </nav>
              </div>
              {
                !adminPage &&
                <div className="column">
                  <div className="is-pulled-right">
                    <small>Company: </small>
                    <div className="is-inline-block" style={{ 'minWidth': 200 }}>
                      <CompanyContext.Consumer>
                        {
                          ({ company, companies, setCompany }) => {
                            if (authUser && authUser.role === 'ADMIN') {
                              if (!companies.map(c => c.fields['Company']).includes('All')) {
                                companies.unshift({fields: {'Company': 'All'}})
                              }
                            } else if (companies.map(c => c.fields['Company']).includes('All')) {
                              companies = companies.filter(c => c.fields['Company'] !== 'All')
                            }
                            if (authUser && authUser.role.includes('ADMIN_')) {
                              const allowedCompany = authUser.role.split('_')[1]
                              companies = companies.filter(c => c.fields['Company'].toUpperCase() === allowedCompany)
                            }
                            companies = companies.map(c => {
                              return {
                                value: c.id || c.fields['Company'],
                                label: c.fields['Company']
                              }
                            })
                            return <Select 
                              options={companies} 
                              width='200px' 
                              onChange={setCompany}
                              value={(!company || !company.value) ? companies[0] : company}>
                            </Select>
                          }
                        }
                      </CompanyContext.Consumer>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
          {children}
        </div>
      }
      { fullpage && children }
    </Fragment>
  )
});

export default withFirebase(Layout);
