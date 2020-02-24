import React from 'react';

import { FiLogOut } from 'react-icons/fi'

import { withFirebase } from '../Firebase';

const SignOutButton = ({ firebase }) => (
  <button
    type="button"
    onClick={firebase ? firebase.doSignOut : () => {}}
    className="button is-small is-danger is-outlined"
  >
    <FiLogOut />
    Sign Out
  </button>
);

export default withFirebase(SignOutButton);
