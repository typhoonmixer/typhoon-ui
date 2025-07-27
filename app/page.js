
import Header from './components/Header'
import MainComponent from './components/MainComponent'
import NoteList from './components/NoteList'

export default function Home() {
  return (
    <div className='w-full h-screen flex flex-col items-center justify-center bg-[#2D242F]'>
        <Header />
        <MainComponent />
    {/* <NoteList /> */}
    </div>
  )
}