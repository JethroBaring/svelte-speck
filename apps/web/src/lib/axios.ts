import { PUBLIC_API_URL } from '$env/static/public';
import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: `${PUBLIC_API_URL}`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

export default axiosInstance