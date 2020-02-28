import "../styles/main.scss"
import ROUTES from '../constants/routes';
import { navigate } from 'gatsby'

export default () => {
  navigate(ROUTES.HOME)
  return null
}
