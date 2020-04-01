import React, { useState, useEffect } from 'react'
import { CompanyContext } from '../Company'
import DataGrid from 'react-data-grid'
import { FiEyeOff, FiFilter, FiSearch, FiArrowUp, FiArrowDown, FiPlus } from 'react-icons/fi'
import { AiOutlineSortAscending } from 'react-icons/ai'
import Modal from '../Modal'
import { datetimeFields } from '../../constants/fields'
import { headers } from '../../constants/labels'
import { UsersContext } from '../layout'
import transformLabels from '../../helpers/labelFormatters'

const Appointments = (props) => {
  const [stats, setStats] = useState({})
  const [company, setCompany] = useState(false)
  const [labels, setLabels] = useState([])
  const [rows, setRows] = useState([])
  const [initialRows, setInitialRows] = useState([])
  const [trigger, setTrigger] = useState(false)
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
      const role = authUser.role
      const cpy = company.company && company.company.value
      try {
        const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getRawTableData?name=Appointments`)
        if (result.status === 200) {
          const body = await result.json()
          if (labels.length === 0) {
            setLabels(
              transformLabels(
                {
                  user: authUser,
                  type: 'Appointments'
                },
                headers['Appointments'], 
                () => setTrigger(p => !p),
                true,
                100,
                remarks
              )
            )
          }
          const rows = body.rows.filter(row => {
            if (authUser.role === 'ADMIN') return true
            if (row.fields['Creator'] === authUser.uid) return true
            if (row.fields['Assign to'] === authUser.uid) return true
          }).map(row => {
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

  useEffect(() => {
    async function updateRemarks() {
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
      setLabels(
        transformLabels(
          {
            user: authUser,
            type: 'Appointments'
          },
          headers['Appointments'],
          () => setTrigger(p => !p),
          true,
          100,
          remarks
        )
      )
    }
    updateRemarks()
  }, [trigger])

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
                  {
                    props.showStats &&
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
                  }
                  {
                    columns.length ?
                      <>
                      {
                        rows.length ?
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
                                      showRemarks
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
                        <div className="title level-item">No appointments</div>
                      }
                      </> :
                      <div className="title level-item">Loading...</div>
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

export default Appointments