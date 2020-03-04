import React, { useState, useEffect } from 'react';
import { compose } from 'recompose';
import { ROLES } from '../constants/roles';
import {
  withAuthorization,
  withEmailVerification,
} from '../components/Session';
import { CompanyContext } from '../components/Company'
import DataGrid from 'react-data-grid';

const HomePageBase = (props) => {
  const [stats, setStats] = useState({})
  const [company, setCompany] = useState(false)
  const [data, setData] = useState({
    labels: [],
    rows: []
  })
  const [dashURL, setDashURL] = useState('')
  const { authUser } = props

  useEffect(() => {
    async function getStats () {
      try {
        const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getHomeStats`)
        if (result.status === 200) {
          const body = await result.json()
          setStats(body.stats)
        }
      } catch (e) {
        console.error(e)
      }
    }
    getStats()
  }, [])

  useEffect(() => {
    async function getDashURL() {
      const role = Object.keys(authUser.roles)[0]
      if (role === ROLES.ADMIN) {
        setDashURL(process.env.GATSBY_ADMIN_DASH)
      } else if (company) {
        try {
          const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getUserDash?role=${role}&email=${authUser.email}&company=${company}`)
          if (result.status === 200) {
            const body = await result.json()
            setDashURL(body.url)
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
    getDashURL()
  }, [company])
  useEffect(() => {
    async function getOpportunities() {
      if (!(company && company.company && authUser)) return 
      const role = Object.keys(authUser.roles)[0]
      const cpy = company.company.value
      try {
        const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getRawTableData?name=Opportunities`)
        if (result.status === 200) {
          const body = await result.json()
          const labels = Object.keys(body.rows[0].fields).map(key => {
            return {
              key, 
              name: key
            }
          })
          setData({ labels, rows: body.rows.map(row => row.fields) })
        }
      } catch (e) {
        console.error(e)
      }
    }
    getOpportunities()
  }, [company, authUser])
  return (
    <CompanyContext.Consumer>
      {
        companyContext => {
          setCompany(companyContext)
          return (
            <>
              <section className="hero is-info welcome is-small">
                <div className="hero-body">
                  <div className="container">
                    <h1 className="title">
                      Hello, {authUser.username}.
                      </h1>
                    <h2 className="subtitle">
                      I hope you are having a great day!
                      </h2>
                  </div>
                </div>
              </section>
              <section className="info-tiles">
                <div className="tile is-ancestor has-text-centered">
                  <div className="tile is-parent">
                    <article className="tile is-child box">
                      <p className="title">{stats.fresh}</p>
                      <p className="subtitle">New opportunities</p>
                    </article>
                  </div>
                  <div className="tile is-parent">
                    <article className="tile is-child box">
                      <p className="title">{stats.opportunities}</p>
                      <p className="subtitle">Total opportunities</p>
                    </article>
                  </div>
                  <div className="tile is-parent">
                    <article className="tile is-child box">
                      <p className="title">{stats.closed}</p>
                      <p className="subtitle">Closed opportunities</p>
                    </article>
                  </div>
                  <div className="tile is-parent">
                    <article className="tile is-child box">
                      <p className="title">${stats.sales && stats.sales.toFixed(2)}</p>
                      <p className="subtitle">Total sales</p>
                    </article>
                  </div>
                </div>
              </section>
              <iframe 
                className="airtable-embed" 
                src={dashURL} 
                frameBorder="0" 
                width="100%" 
                height="533" 
                style={{"background": "transparent", "border": "1px solid #ccc"}}>  
              </iframe>
              {
                data.rows.length &&
                data.labels.length &&
                <DataGrid
                  columns={data.labels}
                  rowGetter={i => data.rows[i]}
                  rowsCount={data.rows.length}
                  minHeight={500}
                  minColumnWidth={180}
                />
              }
            </>
          )
        }
      }
    </CompanyContext.Consumer>
  )
};

const condition = authUser => !!authUser;

const HomePage = compose(
  withEmailVerification,
  withAuthorization(condition),
)(HomePageBase);

export default (props) => (
  <HomePage {...props} />
);
