import './App.css'
import Header from './components/Header'

function App() {

  return (
    <>
      <Header />

      <main className='max-w-7xl mx-auto mt-8 p-4'>
        <h2 className='text-3xl font-semibold text-gray-800'>메인 콘텐츠 영역</h2>
        <p className='mt-4 text-gray-600'>
          추천 콘텐츠
        </p>
        <div className='h-96 bg-gray-50 mt-6 rounded-lg p-4 flex items-center justify-center text-gray-500'>
          메인 콘텐츠
        </div>
      </main>
    </>
  )
}

export default App
