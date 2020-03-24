import React, { Component } from 'react';
import { Link, navigate } from 'gatsby';

import { withFirebase } from '../Firebase';
import { config } from '../Firebase/firebase'
import ROUTES from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import { FiPlus } from 'react-icons/fi';

const INITIAL_STATE = {
  username: '',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  role: 'SALES',
  error: null,
  firebase: null,
  secondaryApp: null
};

const ERROR_CODE_ACCOUNT_EXISTS = 'auth/email-already-in-use';

const ERROR_MSG_ACCOUNT_EXISTS = `
  An account with this E-Mail address already exists.
  Try to login with this account instead. If you think the
  account is already used from one of the social logins, try
  to sign in with one of them. Afterward, associate your accounts
  on your personal account page.
`;

class SignUpFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    let { username, email, passwordOne, role } = this.state;

    if (!role) role = 'SALES'

    this.state.secondaryApp.auth().createUserWithEmailAndPassword(email, passwordOne)
      .then(userData => {
        userData.user.sendEmailVerification();
        // Create a user in your Firebase realtime database
        return this.state.database.ref('users/' + userData.user.uid).set({
          username,
          email,
          role
        });
      })
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        navigate(ROUTES.ADMIN);
      })
      .catch(error => {
        if (error.code === ERROR_CODE_ACCOUNT_EXISTS) {
          error.message = ERROR_MSG_ACCOUNT_EXISTS;
        }

        this.setState({ error });
      });

    this.state.secondaryApp.auth().signOut();

    event.preventDefault();
  };

  componentDidMount() {
    const firebase = import('firebase')
    const secondaryApp = firebase.initializeApp(config, "Secondary");
    this.setState({
      firebase,
      secondaryApp
    })
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onChangeCheckbox = event => {
    this.setState({ [event.target.name]: event.target.checked });
  };

  render() {
    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      role,
      error,
    } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === '' ||
      email === '' ||
      username === '';

    return (
      <form onSubmit={this.onSubmit}>
        <input
          name="username"
          value={username}
          onChange={this.onChange}
          type="text"
          placeholder="Full Name"
        />
        <input
          name="email"
          value={email}
          onChange={this.onChange}
          type="text"
          placeholder="Email Address"
        />
        <input
          name="passwordOne"
          value={passwordOne}
          onChange={this.onChange}
          type="password"
          placeholder="Password"
        />
        <input
          name="passwordTwo"
          value={passwordTwo}
          onChange={this.onChange}
          type="password"
          placeholder="Confirm Password"
        />
        <label>
          Role:
          <select
            name="role"
            value={role}
            onChange={this.onChangeCheckbox}
          >
            {
              Object.keys(ROLES).map(role => (
                <option value={role} key={role}>{role}</option>
              ))
            }
          </select>
        </label>
        <button disabled={isInvalid} type="submit">
          Add user
        </button>

        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

const SignUpLink = () => (
  <p style={{ 'margin': '10px 0' }}>
    <Link to={ROUTES.SIGN_UP} style={{ 'verticalAlign': 'middle' }}>
      <FiPlus style={{ 'verticalAlign': 'middle' }}/> Add new user
    </Link>
  </p>
);

export default withFirebase(SignUpFormBase);

export { SignUpLink };
