import React, { Fragment } from 'react';

import SignUpForm from '../components/SignUp';

const SignUpPage = () => (
  <Fragment>
    <h1>Add a new user</h1>
    <SignUpForm />
  </Fragment>
);

export default () => (
  <SignUpPage />
);
