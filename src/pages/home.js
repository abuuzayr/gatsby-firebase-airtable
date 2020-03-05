import React, { useState, useEffect } from 'react';
import { compose } from 'recompose';
import { ROLES } from '../constants/roles';
import {
  withAuthorization,
  withEmailVerification,
} from '../components/Session';
import { CompanyContext } from '../components/Company'
import DataGrid from 'react-data-grid';
import { FiEyeOff, FiFilter, FiSearch, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { AiOutlineSortAscending } from 'react-icons/ai'

const HomePageBase = (props) => {
  const [stats, setStats] = useState({})
  const [company, setCompany] = useState(false)
  const [labels, setLabels] = useState([])
  const [rows, setRows] = useState([])
  const [initialRows, setInitialRows] = useState([])
  const [dashURL, setDashURL] = useState('')
  const [sort, setSort] = useState({
    column: '',
    direction: ''
  })
  const { authUser } = props

  useEffect(() => {
    async function getStats () {
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
    async function getDashURL() {
      const role = Object.keys(authUser.roles)[0]
      if (role === ROLES.ADMIN) {
        setDashURL(process.env.GATSBY_ADMIN_DASH)
      } else if (company) {
        try {
          const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getUserDash?role=${role}&email=${authUser.email}&company=${company}`)
          if (result.status === 200) {
            const body = await result.json()
            setDashURL(body.url)
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
    getDashURL()
  }, [company])

  useEffect(() => {
    async function getOpportunities() {
      if (!(company && company.companies && authUser)) return 
      // const role = Object.keys(authUser.roles)[0]
      // const cpy = company.company.value
      const fields = [
        'Opportunity name',
        'Company',
        'Salesperson',
        'Stage',
        'Contact details',
        'AG no.',
        'Agreement date & time',
        'Sales remarks',
        'Product',
        'Price',
        'Unit',
        'Subtotal',
        'Discount',
        'GST',
        'Grand Total',
        'Payments',
        'Total paid',
        'Outstanding',
        'Install / Maintenance',
      ]
      try {
        const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getRawTableData?name=Opportunities`)
        if (result.status === 200) {
          const body = await result.json()
          const labels = fields.map(key => {
            const obj = {
              key,
              name: key,
              sortable: true,
              width: 180,
            }
            if (key === 'Opportunity name') {
              obj.frozen = true
              obj.width = 250
            }
            return obj
          })
          setLabels(labels)
          setRows(body.rows.map(row => row.fields))
          setInitialRows(body.rows.map(row => row.fields))
        }
      } catch (e) {
        console.error(e)
      }
    }
    getOpportunities()
  }, [company, authUser])

  const sortRows = (initialRows, sortColumn, sortDirection) => rows => {
    const comparer = (a, b) => {
      if (sortDirection === "ASC") {
        return a[sortColumn] > b[sortColumn] ? 1 : -1;
      } else if (sortDirection === "DESC") {
        return a[sortColumn] < b[sortColumn] ? 1 : -1;
      }
    };
    return sortDirection === "NONE" ? initialRows : [...rows].sort(comparer);
  };

  return (
    <CompanyContext.Consumer>
      {
        companyContext => {
          setCompany(companyContext)
          if (!labels.map(l => l.key).includes('index')) {
            labels.unshift({
              key: 'index',
              name: '',
              width: 40,
              frozen: true
            }) 
          }
          const columns = labels.map(label => {
            return {
              ...label,
              headerRenderer: (props) => (
                <div className="level">
                  <div className="level-left">
                    <div className="level-item">
                      {props.column.name}
                    </div>
                  </div>
                  <div className="level-right">
                    <div className="level-item">
                      {
                        sort.column &&
                        sort.column === props.column.name &&
                        sort.direction !== 'NONE' &&
                        (sort.direction === 'ASC' ? <FiArrowUp /> : <FiArrowDown />)
                      }
                    </div>
                  </div>
                </div>
              )
            }
          })
          return (
            <>
              <section className="hero is-info welcome is-small">
                <div className="hero-body">
                  <div className="container">
                    <h1 className="title">
                      Hello, {authUser.username}.
                      </h1>
                    <h2 className="subtitle">
                      I hope you are having a great day!
                      </h2>
                  </div>
                </div>
              </section>
              <section className="info-tiles">
                <div className="tile is-ancestor has-text-centered">
                  <div className="tile is-parent">
                    <article className="tile is-child box">
                      <p className="title">{stats.fresh}</p>
                      <p className="subtitle">New opportunities</p>
                    </article>
                  </div>
                  <div className="tile is-parent">
                    <article className="tile is-child box">
                      <p className="title">{stats.opportunities}</p>
                      <p className="subtitle">Total opportunities</p>
                    </article>
                  </div>
                  <div className="tile is-parent">
                    <article className="tile is-child box">
                      <p className="title">{stats.closed}</p>
                      <p className="subtitle">Closed opportunities</p>
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
              <iframe 
                className="airtable-embed" 
                src={dashURL} 
                frameBorder="0" 
                width="100%" 
                height="533" 
                style={{"background": "transparent", "border": "1px solid #ccc"}}>  
              </iframe>
              {
                rows.length &&
                columns.length &&
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
                    rowGetter={i => {return {index: i + 1, ...rows[i]}}}
                    rowsCount={rows.length}
                    minHeight={500}
                    minColumnWidth={20}
                    onGridSort={(sortColumn, sortDirection) => {
                      console.log(sortDirection)
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
                </>
              }
            </>
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
