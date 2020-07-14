import React, { useState, useEffect } from 'react'
import { navigate } from 'gatsby';
import ROUTES from '../../constants/routes';
import { CompanyContext } from '../Company'
import DataGrid from 'react-data-grid'
import { headers } from '../../constants/labels'
import { UsersContext } from '../layout'
import transformLabels, { RowRenderer, updateData } from '../../helpers/labelFormatters'
import { HeaderWithSorting, onGridSort } from '../../helpers/sort'
import { useToasts } from 'react-toast-notifications'

const EmptyRowsView = () => (
  <div className="container" style={{ 'padding': 100 }}>
    <div className="title level-item">
      No leads
    </div>
    <div className="level-item">
      <button className="is-small button" onClick={() => navigate(ROUTES.APPOINTMENTS)}>Go to appointments</button>
    </div>
  </div>
)

const Leads = (props) => {
  const TYPE = "Leads"
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

      // Get Appointments
      const role = authUser.role
      try {
        const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getRawTableData?name=${TYPE}`)
        if (result.status === 200) {
          const body = await result.json()
          if (labels.length === 0) {
            setLabels(
              transformLabels(
                {
                  user: authUser,
                  type: TYPE,
                  setRows
                },
                props.headers ? headers[props.headers] : headers[TYPE], 
                () => setTrigger(p => !p),
                true,
                150
              )
            )
          }
          const rows = body.rows.map(row => {
            return {
              ...row.fields,
              id: row.id
            }
          }).filter(Boolean).sort((a, b) => {
            if (a['Assign to'] && !b['Assign to']) return 1
            if (!a['Assign to'] && b['Assign to']) return -1
            return 0
          })
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

export default Leads