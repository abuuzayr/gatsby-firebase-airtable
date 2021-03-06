import React, { useState, useEffect } from 'react'
import { CompanyContext } from '../Company'
import DataGrid from 'react-data-grid'
import {
  FiEyeOff,
  FiFilter,
  FiSearch,
  FiPlus,
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight 
} from 'react-icons/fi'
import { AiOutlineSortAscending } from 'react-icons/ai'
import Modal from '../Modal'
import { headers } from '../../constants/labels'
import { UsersContext } from '../layout'
import transformLabels, { RowRenderer, updateData } from '../../helpers/labelFormatters'
import { HeaderWithSorting, onGridSort } from '../../helpers/sort'
import { Tooltip, Whisper } from 'rsuite'
import scroll from '../../helpers/scroll'
import { useToasts } from 'react-toast-notifications'
import base from '../../helpers/airtable'

const EmptyRowsView = () => (
  <div className="container" style={{ 'padding': 100 }}>
    <div className="title level-item">
      No appointments
    </div>
    <div className="level-item">
      <button className="is-small button" onClick={() => window.location.reload()}>Refresh</button>
    </div>
  </div>
)

const Appointments = (props) => {
  const TYPE = "Appointments"
  const [loaded, setLoaded] = useState(false)
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
  const { addToast, removeToast } = useToasts()

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
        const records = await base('Remarks').select({
          view: "Grid view"
        }).all()
        remarks = records.map(rec => rec._rawJson)
      } catch (e) {
        console.error(e)
      }

      // Get Appointments
      const role = authUser.role
      let cpy = company.company && company.company.value
      if (!cpy && company.companies.length && role.includes('_')) {
        cpy = company.companies.find(c => c.fields['Company'].toUpperCase() === role.split('_')[1]).id
      }
      try {
        const records = await base('Appointments').select({
          view: "Main data"
        }).all()
        if (records) {
          if (labels.length === 0) {
            setLabels(
              transformLabels(
                {
                  user: authUser,
                  type: TYPE,
                  setRows
                },
                props.headers ? headers[props.headers] : headers['Appointments--Sales'], 
                () => setTrigger(p => !p),
                true,
                100,
                remarks
              )
            )
          }
          const rows = records.map(rec => rec._rawJson).filter(row => {
            if (authUser.role.includes('ADMIN')) return true
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
          if (!loaded) setLoaded(true)
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
        const records = await base('Remarks').select({
          view: "Grid view"
        }).all()
        remarks = records.map(rec => rec._rawJson)
      } catch (e) {
        console.error(e)
      }
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
          100,
          remarks
        )
      )
    }
    updateRemarks()
  }, [trigger])

  return (
    <CompanyContext.Consumer>
      {
        companyContext => {
          setCompany(companyContext)
          const columns = labels.map(label => {
            return {
              ...label,
              headerRenderer: props => <HeaderWithSorting {...props} sort={sort} />
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
                              <div className="level">
                                <div className="level-left">
                                  <p className="title">{stats.fresh}</p>
                                </div>
                                <div className="level-right">
                                  <p className="subtitle">New appointments</p>
                                </div>
                              </div>
                            </article>
                        </div>
                        <div className="tile is-parent">
                          <article className="tile is-child box">
                            <div className="level">
                              <div className="level-left">
                                <p className="title">{stats.appointments}</p>
                              </div>
                              <div className="level-right">
                                <p className="subtitle">Total appointments</p>
                              </div>
                            </div>
                          </article>
                        </div>
                        <div className="tile is-parent">
                            <article className="tile is-child box">
                              <div className="level">
                                <div className="level-left">
                                  <p className="title">{stats.closed}</p>
                                </div>
                                <div className="level-right">
                                  <p className="subtitle">Closed appointments</p>
                                </div>
                              </div>
                            </article>
                        </div>
                        <div className="tile is-parent">
                            <article className="tile is-child box">
                              <div className="level">
                                <div className="level-left">
                                  <p className="title">${stats.sales && stats.sales.toFixed(2)}</p>
                                </div>
                                <div className="level-right">
                                  <p className="subtitle">Total sales</p>
                                </div>
                              </div>
                            </article>
                        </div>
                        </div>
                    </section>
                  }
                  {
                    loaded ?
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
                              <div className="level-item">
                                <FiSearch />
                                <span>Search</span>
                              </div>
                              <div style={{ 'margin': '10px 0', 'fontWeight': 700 }}>
                                <a style={{ 'verticalAlign': 'middle' }} href="#">
                                  <Modal
                                    button={
                                      <><FiPlus style={{ 'verticalAlign': 'middle' }} /> Add new customer</>
                                    }
                                    type={TYPE}
                                    user={authUser}
                                    users={users}
                                    mode="New"
                                    onCloseModal={() => setTrigger(p => !p)}
                                    showRemarks
                                  ></Modal>
                                </a>
                              </div>
                            </div>
                            <div className="level-right scroll-icons">
                              <Whisper placement="autoVerticalEnd" speaker={<Tooltip>{`Scroll to first`}</Tooltip>}>
                                <FiChevronsLeft onClick={scroll.scrollToFirst}/>
                              </Whisper>
                              <Whisper placement="autoVerticalEnd" speaker={<Tooltip>{`Scroll left`}</Tooltip>}>
                                <FiChevronLeft onClick={scroll.scrollLeft}/>
                              </Whisper>
                              <Whisper placement="autoVerticalEnd" speaker={<Tooltip>{`Scroll right`}</Tooltip>}>
                                <FiChevronRight onClick={scroll.scrollRight}/>
                              </Whisper>
                              <Whisper placement="autoVerticalEnd" speaker={<Tooltip>{`Scroll to last`}</Tooltip>}>
                                <FiChevronsRight onClick={scroll.scrollToLast}/>
                              </Whisper>
                            </div>
                          </div>
                        </div>
                        <DataGrid
                          columns={columns}
                          rowGetter={i => { return { count: i + 1, ...rows[i] } }}
                          rowsCount={rows.length}
                          minHeight={500}
                          minColumnWidth={20}
                          onGridSort={(col, dir) => onGridSort(col, dir, initialRows, setRows, sort, setSort)}
                          rowRenderer={RowRenderer}
                          emptyRowsView={EmptyRowsView}
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
              )}
            </UsersContext.Consumer>
          )
        }
      }
    </CompanyContext.Consumer>
  )
};

export default Appointments