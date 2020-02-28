import React, { useState, useEffect } from 'react';
import { compose } from 'recompose';
import { ROLES } from '../constants/roles';
import Layout from '../components/layout';
import {
  withAuthorization,
  withEmailVerification,
} from '../components/Session';
import DataGrid from 'react-data-grid';

const HomePageBase = (props) => {
  const [stats, setStats] = useState({})
  const [dashURL, setDashURL] = useState('')
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
      const { company, authUser } = props
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
  }, [props.company])
  return (
    <>
      <section className="hero is-info welcome is-small">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">
              Hello, {props.authUser.username}.
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
    </>
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
