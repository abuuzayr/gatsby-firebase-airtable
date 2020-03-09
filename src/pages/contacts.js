import React, { useState, useEffect } from 'react';
import { compose } from 'recompose';
import {
  withAuthorization,
  withEmailVerification,
} from '../components/Session';
import DataGrid from 'react-data-grid';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import Modal from '../components/Modal';
import { currencyFields } from '../constants/fields'

const hiddenFields = ['Opportunities']

const ContactPageBase = (props) => {
  const [trigger, setTrigger] = useState(false)
  const [data, setData] = useState({
    labels: [],
    rows: []
  })
  const { authUser } = props

  const transformLabels = labels => {
    labels = labels.filter(label => !hiddenFields.includes(label.key))
    labels = labels.map(label => {
      if (label.key === 'Model') {
        label.frozen = true
        label.width = 250
      }
      if (currencyFields.includes(label.key)) {
        label.formatter = ({ value }) => value ? `$${parseFloat(value).toFixed(2)}` : ''
      }
      return label
    })
    labels.unshift({
      key: 'index',
      name: '',
      width: 30,
      frozen: true,
      formatter: ({ value }) => {
        return <div
          style={{
            'textAlign': 'center',
          }}
        >
          {value}
        </div>
      }
    })
    const modelIndex = labels.map(l => l.key).indexOf('Model')
    labels.splice(modelIndex, 0, {
      key: 'edit',
      name: '',
      frozen: true,
      width: 30,
      formatter: ({ row }) => {
        return <div className="level actions">
          <div className="level-item">
            <Modal
              button={<FiEdit />}
              id={row.id}
              type="Contacts"
              user={authUser}
              mode="Edit"
              onCloseModal={() => setTrigger(p => !p)}
            >
            </Modal>
          </div>
        </div>
      }
    })
    labels.push({
      key: 'delete',
      name: '',
      width: 30,
      formatter: ({ row }) => {
        return <div className="level actions">
          <div className="level-item">
            <Modal
              button={<FiTrash2 />}
              id={row.id}
              title={row['Model']}
              type="Contacts"
              user={authUser}
              mode="Delete"
              onCloseModal={() => setTrigger(p => !p)}
            >
            </Modal>
          </div>
        </div>
      }
    })
    return labels
  }

  useEffect(() => {
    async function getContacts() {
      if (!authUser) return
      try {
        const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getRawTableData?name=Contacts`)
        if (result.status === 200) {
          const body = await result.json()
          const labels = Object.keys(body.rows[0].fields).map(key => {
            return {
              key,
              name: key,
              width: 180,
              resizable: true
            }
          })
          setData({ 
            labels: transformLabels(labels), 
            rows: body.rows.map((row, index) => {
              return {
                ...row.fields,
                index: index + 1,
                id: row.id
              }
            }) 
          })
        }
      } catch (e) {
        console.error(e)
      }
    }
    getContacts()
  }, [authUser, trigger])

  return (
    <>
      {
        data.rows.length &&
        data.labels.length ?
          <>
            <DataGrid
              columns={data.labels}
              rowGetter={i => data.rows[i]}
              rowsCount={data.rows.length}
              minHeight={500}
              minColumnWidth={35}
            />
            <div style={{ 'margin': '10px 0', 'fontWeight': 700 }} className="is-pulled-right">
              <a style={{ 'verticalAlign': 'middle' }} href="#">
                <Modal
                  button={
                    <><FiPlus style={{ 'verticalAlign': 'middle' }} /> Add new contact</>
                  }
                  type="Contacts"
                  user={authUser}
                  mode="New"
                  onCloseModal={() => setTrigger(p => !p)}
                ></Modal>
              </a>
            </div>
          </> :
          <div>Loading...</div>
      }
    </>
  )
};

const condition = authUser => !!authUser;

const ContactPage = compose(
  withEmailVerification,
  withAuthorization(condition),
)(ContactPageBase);

export default (props) => (
  <ContactPage {...props} />
);
