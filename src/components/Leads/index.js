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
import base from '../../helpers/airtable'

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
    async function getAppointments() {
      if (!(company && company.companies && authUser)) return
      const role = authUser.role
      try {
        const records = await base(TYPE).select({
          view: "Grid view"
        }).all()
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
        const rows = records.map(row => {
          row = row._rawJson
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