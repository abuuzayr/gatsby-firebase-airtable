import React, { useState } from 'react'
import { FaUser, FaRegIdCard, FaPhone, FaHandshake, FaArrowAltCircleRight, FaTimes } from 'react-icons/fa'
import { UsersContext } from '../components/layout'
import Airtable from 'airtable'
import "../styles/login.scss"

const base = new Airtable({
  apiKey: process.env.GATSBY_AIRTABLE_APIKEY
}).base(process.env.GATSBY_AIRTABLE_BASE);

const Form = () => {
  const baseState = {
    'Name': '',
    'No. of pax': 1,
    'Contact': '',
    'Assign to': '',
    'Source': 'Walk in'
  }
  const [state, setState] = useState(baseState)
  const [completed, setCompleted] = useState(false)

  const onSubmit = () => {
    base('Leads').create([{ fields: { ...state, 'Date & Time': new Date() } }], function (err, records) {
      if (err) {
        console.error(err);
        return
      }
      if (records.length > 0) {
        setCompleted(true)
      }
    })
  }

  const onChange = (value, label) => {
    if (label === 'No. of pax') value = parseInt(value)
    setState(p => ({
      ...p,
      [label]: value
    }))
  }

  const resetState = () => {
    setCompleted(false)
    setState(baseState)
  }

  return  (
    <section className="hero is-fullheight">
      <div className="hero-body">
        <div className="container has-text-centered">
          <div className="column is-10 is-offset-1">
            <div className="level">
              <div className="level-item">
                <div className="title">Liveinpure</div>
              </div>
            </div>
            <h3 className="title has-text-black">
              Walk in Form
            </h3>
            <p className="subtitle has-text-black">
              {
                completed ? "Your details have been captured. Thank you!" : "Please enter your details"
              }
            </p>
            {
              completed ?
              <div>
                <div className="level">
                  <div className="level-item">
                    <button className="button is-link" onClick={resetState}>Enter again</button>
                  </div>
                </div>
              </div> :
              <div>
                <div className="field is-horizontal">
                  <div className="field-label is-normal">
                    <label className="label">Source</label>
                  </div>
                  <div className="field-body">
                    <div className="field">
                      <div className="control is-expanded has-icons-left">
                        <div className="select">
                          <select value={state['Source']} onChange={e => onChange(e.currentTarget.value, 'Source')}>
                            {
                              ['Walk in', 'Facebook', 'Google', 'Referred by'].map(source => (
                                <option key={source} value={source}>{source}</option>
                              ))
                            }
                          </select>
                        </div>
                        <span className="icon is-small is-left">
                            <FaArrowAltCircleRight />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="field is-horizontal">
                  <div className="field-label is-normal">
                    <label className="label">Name *</label>
                  </div>
                  <div className="field-body">
                    <div className="field">
                      <div className="control is-expanded has-icons-left">
                        <input required className={"input" + (state.name ? "" : " is-warning")} type="text" placeholder="e.g. James Lim" value={state['Name']} onChange={(e) => onChange(e.currentTarget.value, 'Name')} />
                        <span className="icon is-small is-left">
                          <FaRegIdCard />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="field is-horizontal">
                  <div className="field-label is-normal">
                    <label className="label">Contact number *</label>
                  </div>
                  <div className="field-body">
                    <div className="field">
                      <div className="control is-expanded has-icons-left">
                        <input required className={"input" + (state.contact ? "" : " is-warning")} type="tel" placeholder="9876 5432" value={state['Contact']} onChange={(e) => onChange(e.currentTarget.value, 'Contact')} />
                        <span className="icon is-small is-left">
                          <FaPhone />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="field is-horizontal">
                  <div className="field-label is-normal">
                    <label className="label">No. of pax</label>
                  </div>
                  <div className="field-body">
                    <div className="field">
                      <div className="control is-expanded has-icons-left">
                        <div className="select">
                          <select value={state['No. of pax']} onChange={e => onChange(e.currentTarget.value, 'No. of pax')}>
                            {
                              [1, 2, 3, 4, 5].map(num => (
                                <option key={num} value={num}>{num}</option>
                              ))
                            }
                          </select>
                        </div>
                        <span className="icon is-small is-left">
                          <FaUser />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="field is-horizontal">
                  <div className="field-label is-normal">
                    <label className="label">Attended by</label>
                  </div>
                  <div className="field-body">
                    <div className="field">
                      <div className="control is-expanded has-icons-left">
                        <div className="select">
                          <UsersContext.Consumer>
                            {
                              users => (
                                <select value={state['Assign to']} onChange={e => onChange(e.currentTarget.value, 'Assign to')}>
                                  <option selected disabled value="">Select a salesperson (optional)</option>
                                  {
                                    users.map(user => (
                                      <option key={user.uid} value={user.uid}>{user.username}</option>
                                    ))
                                  }
                                </select>
                              )
                            }
                          </UsersContext.Consumer>
                        </div>
                        <span className="icon is-small is-left">
                          <FaHandshake />
                        </span>
                        <div 
                          className="icon is-small"
                          style={{ color: state['Assign to'] ? 'red' : '', cursor: state['Assign to'] ? 'pointer' : 'normal', pointerEvents: 'initial' }}
                          onClick={(e) => onChange('', 'Assign to')}
                        >
                          <FaTimes />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="field is-grouped is-grouped-centered">
                  <div className="control">
                    <button className="button is-link" onClick={onSubmit} disabled={!(state['Name'] && state['Contact'])}>Submit</button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  )
}

export default Form