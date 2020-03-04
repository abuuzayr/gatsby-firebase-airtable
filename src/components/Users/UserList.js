import React, { Component } from 'react';

import { SignUpLink } from '../SignUp'

import { withFirebase } from '../Firebase';

import DataGrid from 'react-data-grid'

class UserList extends Component {
  _initFirebase = false;

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      users: [],
    };
  }

  firebaseInit = () => {
    if (this.props.firebase && !this._initFirebase) {
      this._initFirebase = true;

      this.setState({ loading: true });

      this.props.firebase.users().on('value', snapshot => {
        const usersObject = snapshot.val();

        const usersList = Object.keys(usersObject).map(key => ({
          ...usersObject[key],
          uid: key,
        }));

        this.setState({
          users: usersList,
          loading: false,
        });
      });
    }
  };

  componentDidMount() {
    this.firebaseInit();
  }

  componentDidUpdate() {
    this.firebaseInit();
  }

  componentWillUnmount() {
    this.props.firebase.users().off();
  }

  render() {
    let { users, loading } = this.state;

    users = users.map((user, id) => {
      return {
        ...user,
        id: id + 1,
        role: user.roles ? Object.keys(user.roles)[0] : ''
      }
    })

    if (users.length < 7) {
      const limit = 7 - users.length
      for (let i = 0; i < limit; i++) {
        users.push({
          id: "",
          name: "",
          username: "",
          role: "",
        })
      }
    }

    const columns = [
      { key: "id", name: "ID", width: 35 },
      { key: "email", name: "Email", resizable: true },
      { key: "username", name: "Username", resizable: true },
      { key: "role", name: "Role", resizable: true }
    ];

    return (
      <div>
        {
          loading ?
            <div>Loading ...</div> :
            <>
              <DataGrid
                columns={columns}
                rowGetter={i => users[i]}
                rowsCount={users.length}
                minHeight={300}
                minColumnWidth={10}
                enableCellAutoFocus={false}
              />
              <SignUpLink />
            </>
        }
      </div>
    );
  }
}

export default withFirebase(UserList);
