import React from 'react'
import Layout from '../components/layout'
import SignInForm from '../components/SignIn'
import { PasswordForgetLink } from '../components/PasswordForget'
import { FaDoorOpen } from 'react-icons/fa'
import "../styles/login.scss"

const SignInPage = () => (

  <section className="hero is-success is-fullheight">
    <div className="hero-body">
      <div className="container has-text-centered">
       <div className="column is-6 is-offset-3">
          <h3 className="title has-text-black">
            Liveinpure
          </h3>
          <p className="subtitle has-text-black">
            Please login to proceed.
          </p>
          <div className="box">
            <figure className="avatar">
              <FaDoorOpen />
            </figure>
            <SignInForm />
          </div>
          <p className="has-text-grey">
            <PasswordForgetLink />
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default () => (
  <Layout noheader>
    <SignInPage />
  </Layout>
);
