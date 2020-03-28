import React, { useState, useEffect } from 'react'
import { compose } from 'recompose'
import {
  withAuthorization,
} from '../components/Session'
import DataGrid from 'react-data-grid'
import { FiPlus, FiEdit, FiTrash2, FiEyeOff, FiFilter, FiSearch } from 'react-icons/fi'
import { AiOutlineSortAscending } from 'react-icons/ai'
import Modal from '../components/Modal'
import { headers } from '../constants/labels'
import transformLabels from '../helpers/labelFormatters'

const hiddenFields = ['Appointments']

const ProductPageBase = (props) => {
  const [trigger, setTrigger] = useState(false)
  const [data, setData] = useState({
    labels: [],
    rows: []
  })
  const { authUser } = props

  useEffect(() => {
    async function getProducts() {
      if (!authUser) return
      try {
        const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getRawTableData?name=Products`)
        if (result.status === 200) {
          const body = await result.json()
          setData({ 
            labels: transformLabels(
              authUser,
              headers['Products'],
              () => setTrigger(p => !p),
              true,
              180
            ), 
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
    getProducts()
  }, [authUser, trigger])

  return (
    <>
      {
        data.rows.length &&
        data.labels.length ?
          <>
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
                  <div style={{ 'margin': '10px 0', 'fontWeight': 700 }}>
                    <a style={{ 'verticalAlign': 'middle' }} href="#">
                      <Modal
                        button={
                          <><FiPlus style={{ 'verticalAlign': 'middle' }} /> Add new product</>
                        }
                        type="Products"
                        user={authUser}
                        mode="New"
                        onCloseModal={() => setTrigger(p => !p)}
                      ></Modal>
                    </a>
                  </div>
                </div>
                <div className="level-right">
                  <div className="level-item">
                    <FiSearch />
                  </div>
                </div>
              </div>
            </div>
            <DataGrid
              columns={data.labels}
              rowGetter={i => { return { count: i + 1, ...data.rows[i] } }}
              rowsCount={data.rows.length}
              minHeight={500}
              minColumnWidth={35}
            />
          </> :
          <div>Loading...</div>
      }
    </>
  )
};

const condition = authUser => !!authUser;

const ProductPage = compose(
  withAuthorization(condition),
)(ProductPageBase);

export default (props) => (
  <ProductPage {...props} />
);
