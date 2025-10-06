
import MainComponent from './components/MainComponent'
import NoteList from './components/NoteList'

export default function Home() {
  return (
    <div className='w-full min-h-screen bg-background text-foreground'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6'>
        <div className='flex w-full justify-center mt-8'>
          <MainComponent />
        </div>
        {/* <NoteList /> */}
      </div>
    </div>
  )
}
