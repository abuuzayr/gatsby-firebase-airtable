import React, { useState, useEffect } from 'react';
import { compose } from 'recompose';
import {
  withAuthorization,
} from '../components/Session';
import DataGrid from 'react-data-grid';
import { FiPlus, FiEyeOff, FiFilter, FiSearch } from 'react-icons/fi';
import { AiOutlineSortAscending } from 'react-icons/ai';
import Modal from '../components/Modal';
import { headers } from '../constants/labels'
import transformLabels, { updateData } from '../helpers/labelFormatters'
import { HeaderWithSorting, onGridSort } from '../helpers/sort'
import { useToasts } from 'react-toast-notifications'

const PaymentsPageBase = (props) => {
  const TYPE = 'Payments'
  const [trigger, setTrigger] = useState(false)
  const [labels, setLabels] = useState([])
  const [rows, setRows] = useState([])
  const [initialRows, setInitialRows] = useState([])
  const [sort, setSort] = useState({
    column: '',
    direction: ''
  })
  const { authUser } = props
  const { addToast, removeToast } = useToasts()

  useEffect(() => {
    async function getPayments() {
      if (!authUser) return
      try {
        const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getRawTableData?name=Payments`)
        if (result.status === 200) {
          const body = await result.json()
          setLabels(
            transformLabels(
              {
                user: authUser,
                type: TYPE,
                setRows
              },
              headers[TYPE],
              () => setTrigger(p => !p),
              true,
              150
            )
          )
          const rows = body.rows.map((row, index) => ({
            ...row.fields,
            index: index + 1,
            id: row.id
          }))
          setRows(rows)
          setInitialRows(rows)
        }
      } catch (e) {
        console.error(e)
      }
    }
    getPayments()
  }, [authUser, trigger])

  const columns = labels.map(label => {
    return {
      ...label,
      headerRenderer: props => <HeaderWithSorting {...props} sort={sort} />
    }
  })

  return (
    <>
      {
        rows.length &&
        labels.length ?
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
                          <><FiPlus style={{ 'verticalAlign': 'middle' }} /> Add new payment</>
                        }
                        type="Payments"
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
              columns={columns}
              rowGetter={i => { return { count: i + 1, ...rows[i] } }}
              rowsCount={rows.length}
              minHeight={500}
              minColumnWidth={35}
              onGridSort={(col, dir) => onGridSort(col, dir, initialRows, setRows, sort, setSort)}
              enableCellSelect
              enableCellCopyPaste
              onGridRowsUpdated={(e) => {
                if (window.confirm('Save ?')) {
                  updateData(TYPE, e.toRowId, e.updated, setRows, addToast, removeToast)
                }
              }}
            />
          </> :
          <div className="title level-item">Loading...</div>
      }
    </>
  )
};

const condition = authUser => !!authUser;

const PaymentsPage = compose(
  withAuthorization(condition),
)(PaymentsPageBase);

export default (props) => (
  <PaymentsPage {...props} />
);
