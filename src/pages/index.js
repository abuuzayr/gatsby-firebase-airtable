import "../styles/main.scss"
import { useEffect } from 'react'
import ROUTES from '../constants/routes'
import { navigate } from 'gatsby'

export default () => {
  useEffect(() => {
    navigate(ROUTES.HOME)
  }, [])
  return null
}
