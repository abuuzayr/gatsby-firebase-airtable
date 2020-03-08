import React, { useState, useEffect } from 'react';
import { compose } from 'recompose';
import {
  withAuthorization,
  withEmailVerification,
} from '../components/Session';
import DataGrid from 'react-data-grid';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import Modal from '../components/Modal';

const hiddenFields = ['Opportunities']

const ProductPageBase = (props) => {
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
      return label
    })
    labels.unshift({
      key: 'index',
      name: '#',
      width: 40,
      frozen: true
    })
    const colorIndex = labels.map(l => l.key).indexOf('Color')
    labels.splice(colorIndex - 1, 0, {
      key: 'actions',
      name: 'Actions',
      width: 80,
      formatter: () => {
        return <div className="level">
          <div className="level-item">
            <Modal button={<a href="#"><FiEdit /></a>}></Modal>
          </div>
          <div className="level-item">
            <a href="#"><FiTrash2 /></a>
          </div>
        </div>
      }
    })
    return labels
  }

  useEffect(() => {
    async function getProducts() {
      if (!authUser) return
      try {
        const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getRawTableData?name=Products`)
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
                index: index + 1
              }
            }) 
          })
        }
      } catch (e) {
        console.error(e)
      }
    }
    getProducts()
  }, [authUser])

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
              <a style={{ 'verticalAlign': 'middle' }}>
                <Modal button={
                    <><FiPlus style={{ 'verticalAlign': 'middle' }} /> Add new product</>
                  }>
                  <div>I am a modal</div>
                  <form>
                    <input />
                    <button>tab navigation</button>
                    <button>stays</button>
                    <button>inside</button>
                    <button>the modal</button>
                  </form>
                </Modal>
              </a>
            </div>
          </> :
          <div>Loading...</div>
      }
    </>
  )
};

const condition = authUser => !!authUser;

const ProductPage = compose(
  withEmailVerification,
  withAuthorization(condition),
)(ProductPageBase);

export default (props) => (
  <ProductPage {...props} />
);
