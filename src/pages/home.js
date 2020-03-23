import React, { useState, useEffect } from 'react'
import { compose } from 'recompose'
import { ROLES } from '../constants/roles'
import {
  withAuthorization,
  withEmailVerification,
} from '../components/Session'
import { CompanyContext } from '../components/Company'
import DataGrid from 'react-data-grid'
import { FiEyeOff, FiFilter, FiSearch, FiArrowUp, FiArrowDown, FiPlus, FiMoreHorizontal } from 'react-icons/fi'
import { AiOutlineSortAscending } from 'react-icons/ai'
import Modal from '../components/Modal'
import { STAGES } from '../constants/selections'
import { datetimeFields, currencyFields } from '../constants/fields'
import { Tooltip, Whisper } from 'rsuite'
import { UsersContext } from '../components/layout'
import { ExpandRow, ColoredCell, CreatorCell, MultiRecordCell, CountCell, EditCell, DeleteCell } from '../helpers/labelFormatters'

const largeFields = [
  'Agreement date & time',
  'Products',
  'Payments',
  'Install / Maintenance',
  'Email',
  'Customer company',
  'Address',
  'Name',
  'Name 2',
  'Appointment date & time',
]

const HomePageBase = (props) => {
  const [stats, setStats] = useState({})
  const [company, setCompany] = useState(false)
  const [labels, setLabels] = useState([])
  const [rows, setRows] = useState([])
  const [initialRows, setInitialRows] = useState([])
  const [trigger, setTrigger] = useState(false)
  // const [remarks, setRemarks] = useState([])
  const [sort, setSort] = useState({
    column: '',
    direction: ''
  })
  const { authUser } = props

  useEffect(() => {
    async function getStats() {
      try {
        const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getHomeStats`)
        if (result.status === 200) {
          const body = await result.json()
          setStats(body.stats)
        }
      } catch (e) {
        console.error(e)
      }
    }
    getStats()
  }, [])

  useEffect(() => {
    async function getAppointments() {
      if (!(company && company.companies && authUser)) return

      // Get remarks first
      let remarks = []
      try {
        const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getOptions`)
        if (result.status === 200) {
          const body = await result.json()
          remarks = body.rows['Remarks']
        }
      } catch (e) {
        console.error(e)
      }

      // Get Appointments
      const role = Object.keys(authUser.roles)[0]
      const cpy = company.company && company.company.value
      const headers = [
        'Appointment name',
        'Company',
        'Assigned to',
        'Stage',
        'Appointment date & time',
        'Name',
        'Contact',
        'Customer company',
        'Email',
        'DOB',
        'Address',
        'House Unit',
        'Postal Code',
        'Zone',
        'Name 2',
        'Contact 2',
        'Relationship',
        'AG no.',
        'Agreement date & time',
        'Products',
        'Total Price',
        'Discount',
        'Subtotal',
        'GST',
        'Grand Total',
        'Payments',
        'Total paid',
        'Outstanding',
        'Install / Maintenance',
        'Creator'
      ]
      try {
        const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getRawTableData?name=Appointments`)
        if (result.status === 200) {
          const body = await result.json()
          if (labels.length === 0) {
            setLabels(transformLabels(headers, true, remarks))
          }
          const rows = body.rows.map(row => {
            if (cpy && cpy !== 'All') {
              if (!row.fields['Company']) return false
              if (row.fields['CX'] && row.fields['CX'][0] !== cpy) return false
            }
            return {
              ...row.fields,
              id: row.id
            }
          }).filter(Boolean)
          setRows(rows)
          setInitialRows(rows)
        }
      } catch (e) {
        console.error(e)
      }
    }
    getAppointments()
  }, [company, authUser, trigger])

  const transformLabels = (labels, includeCount, remarks) => {
    labels = labels.map(key => {
      const obj = {
        key,
        name: key,
        sortable: true,
        width: 100,
        resizable: true
      }
      switch (key) {
        case 'Appointment name':
          obj.frozen = true
          obj.width = 250
          obj.formatter = props => <ExpandRow {...props} />
          break
        case 'Stage':
          obj.formatter = props => <ColoredCell {...props} colors={STAGES} />
          break
        case 'Creator':
          obj.formatter = props => <CreatorCell {...props} />
          break
        case 'Payments':
        case 'Install / Maintenance':
          obj.formatter = props => <MultiRecordCell {...props} type={key} user={authUser} />
          break
        default:
          break
      }
      if (datetimeFields.includes(key)) {
        obj.formatter = ({ value }) => value ? new Date(value).toLocaleString() : ''
      }
      if (currencyFields.includes(key)) {
        obj.formatter = ({ value }) => value ? `$${parseFloat(value).toFixed(2)}` : ''
      }
      if (largeFields.includes(key)) {
        obj.width = 180
      }
      return obj
    })
    if (includeCount) {
      if (!labels.map(l => l.key).includes('count')) {
        labels.unshift({
          key: 'count',
          name: '',
          width: 40,
          frozen: true,
          formatter: props => <CountCell { ...props } colors={STAGES} colorKey="Stage" />
        })
      }      
    }
    if (!labels.map(l => l.key).includes('edit')) {
      const oppIndex = labels.map(l => l.key).indexOf('Appointment name')
      labels.splice(oppIndex, 0, {
        key: 'edit',
        name: '',
        frozen: true,
        width: 30,
        formatter: props => <EditCell
          {...props}
          user={authUser}
          type="Appointments"
          onCloseModal={() => setTrigger(p => !p)}
        />
      })
      labels.push({
        key: 'delete',
        name: '',
        width: 30,
        formatter: props => <DeleteCell
          {...props}
          user={authUser}
          type="Appointments"
          titleKey="Appointment name"
          onCloseModal={() => setTrigger(p => !p)} 
        />
      })
      // Add sales remarks row
      const productIndex = labels.map(l => l.key).indexOf('Products')
      labels.splice(productIndex, 0, {
        key: 'Sales Remarks',
        name: 'Sales Remarks',
        width: 180,
        formatter: (props) => {
          const rm = remarks.filter(r => r.fields['Appointments'].includes(props.row.id))
          if (rm.length > 0) {
            rm.sort((a, b) => {
              const aDate = new Date(a).getTime()
              const bDate = new Date(b).getTime()
              return bDate - aDate
            })
          }
          return <MultiRecordCell
            {...props}
            value={rm}
            text={rm.length ? rm[0]['fields']['Text'] : 'No remarks'}
            type="Remarks"
            user={authUser} 
          />
        }
      })
    }
    return labels
  }

  const sortRows = (initialRows, sortColumn, sortDirection) => rows => {
    const comparer = (a, b) => {
      let A = a[sortColumn]
      let B = b[sortColumn]
      if (sortDirection === "ASC") {
        if (datetimeFields.includes(sortColumn)) {
          A = A ? new Date(A).getTime() : new Date(new Date().getTime() + Math.pow(10, 12))
          B = B ? new Date(B).getTime() : new Date(new Date().getTime() + Math.pow(10, 12))
        }
        return A > B ? 1 : -1;
      } else if (sortDirection === "DESC") {
        if (datetimeFields.includes(sortColumn)) {
          A = A ? new Date(A).getTime() : new Date(null)
          B = B ? new Date(B).getTime() : new Date(null)
        }
        return A < B ? 1 : -1;
      }
    };
    return sortDirection === "NONE" ? initialRows : [...rows].sort(comparer);
  };

  return (
    <CompanyContext.Consumer>
      {
        companyContext => {
          setCompany(companyContext)
          const columns = labels.map(label => {
            return {
              ...label,
              headerRenderer: ({ column }) => (
                <div className="level">
                  <div className="level-left">
                    <div className="level-item">
                      {column.name}
                    </div>
                  </div>
                  <div className="level-right">
                    <div className="level-item">
                      {
                        sort.column &&
                        sort.column === column.name ?
                          (
                            sort.direction === 'NONE' ? 
                              <FiArrowUp style={{ 'color': '#ccc' }} /> :
                              sort.direction === 'ASC' ? 
                                <FiArrowUp /> :
                                <FiArrowDown />
                          ) :
                          !['count', 'edit', 'delete'].includes(column.key) && <FiArrowUp style={{ 'color': '#ccc' }} />
                      }
                    </div>
                  </div>
                </div>
              )
            }
          })
          return (
            <UsersContext.Consumer>
              {users => (
                <>
                  <section className="info-tiles">
                    <div className="tile is-ancestor has-text-centered">
                      <div className="tile is-parent">
                        <article className="tile is-child box">
                          <p className="title">{stats.fresh}</p>
                          <p className="subtitle">New appointments</p>
                        </article>
                      </div>
                      <div className="tile is-parent">
                        <article className="tile is-child box">
                          <p className="title">{stats.appointments}</p>
                          <p className="subtitle">Total appointments</p>
                        </article>
                      </div>
                      <div className="tile is-parent">
                        <article className="tile is-child box">
                          <p className="title">{stats.closed}</p>
                          <p className="subtitle">Closed appointments</p>
                        </article>
                      </div>
                      <div className="tile is-parent">
                        <article className="tile is-child box">
                          <p className="title">${stats.sales && stats.sales.toFixed(2)}</p>
                          <p className="subtitle">Total sales</p>
                        </article>
                      </div>
                    </div>
                  </section>
                  {
                    rows.length &&
                    columns.length ?
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
                                      <><FiPlus style={{ 'verticalAlign': 'middle' }} /> Add new customer</>
                                    }
                                    type="Appointments"
                                    user={authUser}
                                    users={users}
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
                          minColumnWidth={20}
                          onGridSort={(sortColumn, sortDirection) => {
                            let direction = sortDirection
                            switch (sort.direction) {
                              case 'ASC':
                                direction = 'DESC'
                                break
                              case 'DESC':
                                direction = 'NONE'
                                break
                              case 'NONE':
                                direction = 'ASC'
                                break
                              default:
                                break
                            }
                            setRows(sortRows(initialRows, sortColumn, direction))
                            setSort(prev => {
                              return {
                                column: sortColumn,
                                direction
                              }
                            })
                          }}
                        />
                      </> :
                      <div>Loading...</div>
                  }
                </>
              )}
            </UsersContext.Consumer>
          )
        }
      }
    </CompanyContext.Consumer>
  )
};

const condition = authUser => !!authUser;

const HomePage = compose(
  withEmailVerification,
  withAuthorization(condition),
)(HomePageBase);

export default (props) => (
  <HomePage {...props} />
);
