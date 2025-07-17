import { ToastContainer } from 'react-toastify'
import './App.css'
import { TaskManage } from './TaskManage'
function App() {
  return (
    <>
      <TaskManage />
      <ToastContainer position="top-center" />
    </>
  )
}

export default App
