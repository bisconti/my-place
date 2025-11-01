import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import MainLayout from './components/MainLayout'
import Login from './components/Login'

function App() {

  return (
    <BrowserRouter>
      <div className='min-h-screen bg-gray-50'>
        <Routes>
          <Route path='/' element={<MainLayout />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<h1 className='text-3xl p-8'>회원가입 페이지</h1>} />
          <Route path='/find-password' element={<h1 className='text-3xl p-8'>비밀번호 찾기 페이지</h1>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
