import React from 'react'

export const CompanyContext = React.createContext({
    company: '',
    companies: [],
    setCompany: () => { },
});