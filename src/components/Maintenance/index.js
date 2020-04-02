import React, { useState, useEffect } from 'react';
import DataGrid from 'react-data-grid';
import { FiPlus, FiEyeOff, FiFilter, FiSearch } from 'react-icons/fi';
import { AiOutlineSortAscending } from 'react-icons/ai';
import Modal from '../Modal';
import transformLabels from '../../helpers/labelFormatters'
import { headers } from '../../constants/labels'

const Maintenance = (props) => {
  const [trigger, setTrigger] = useState(false)
  const [data, setData] = useState({
    labels: [],
    rows: []
  })
  const { authUser } = props

  useEffect(() => {
    async function getMaintenance() {
      if (!authUser) return
      try {
        const result = await fetch(`${process.env.GATSBY_STDLIB_URL}/getRawTableData?name=Maintenance`)
        if (result.status === 200) {
          const body = await result.json()
          setData({ 
            labels:
              transformLabels(
                {
                  user: authUser,
                  type: 'Maintenance'
                },
                headers['Maintenance'],
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
    getMaintenance()
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
                          <><FiPlus style={{ 'verticalAlign': 'middle' }} /> Add new install / maintenance</>
                        }
                        type="Maintenance"
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
          <div className="title level-item">Loading...</div>
      }
    </>
  )
};

export default Maintenance