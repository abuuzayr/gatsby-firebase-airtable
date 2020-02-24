import React, { Fragment } from 'react';
import "../styles/main.scss"
import Layout from '../components/layout';
import { SignInPage } from './signin'

const LandingPage = () => (
  <Fragment>
    <h1>Landing</h1>
    <p>
      The Landing Page is open to everyone, even though the user isn't
      signed in.
    </p>
  </Fragment>
);

export default () => (
  <Layout fullpage>
    <SignInPage />
  </Layout>
)
