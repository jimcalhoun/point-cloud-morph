import SimpleShapeMorph from './components/SimpleShapeMorph'
import './App.css'

function App() {

  return (
    <>
      <div className="relative h-screen w-screen flex flex-col items-center justify-center bg-[#181818]">
        <div className="absolute inset-0">
          <SimpleShapeMorph />
        </div>
      </div>
    </>
  )
}

export default App
