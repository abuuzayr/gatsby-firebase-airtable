import React, { Component } from 'react';
import { FiEyeOff, FiFilter, FiSearch } from 'react-icons/fi';
import { AiOutlineSortAscending } from 'react-icons/ai';

import { SignUpLink } from '../SignUp'

import DataGrid from 'react-data-grid'

class UserList extends Component {
  render() {
    const users = this.props.users.map((user, id) => {
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
      { key: "username", name: "Name", resizable: true },
      { key: "role", name: "Role", resizable: true }
    ];

    return (
      <div>
        <div className="rdg-head">
          <div className="level">
            <div className="level-left">
              <div className="level-item">
                <FiEyeOff />
                <span>Hide fields</span>
              </div>
              <div className="level-item">
                <FiFilter />
                <span>Filter</span>
              </div>
              <div className="level-item">
                <AiOutlineSortAscending />
                <span>Sort</span>
              </div>
              <SignUpLink />
            </div>
            <div className="level-right">
              <div className="level-item">
                <FiSearch />
              </div>
            </div>
          </div>
        </div>
        <DataGrid
          columns={columns}
          rowGetter={i => users[i]}
          rowsCount={users.length}
          minHeight={300}
          minColumnWidth={10}
          enableCellAutoFocus={false}
        />
      </div>
    );
  }
}

export default UserList;
