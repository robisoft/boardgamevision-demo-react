export default function Footer(): React.JSX.Element {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-gray-800 border-t border-gray-700 px-6 py-3 flex items-center justify-between">
      <a href="https://boardgamevision.com" target="_blank" rel="noopener noreferrer" className="opacity-90 hover:opacity-100 transition-opacity">
        <img src={`${import.meta.env.BASE_URL}images/logo.svg`} alt="BoardGameVision" style={{ height: '34px' }} />
      </a>
      <div className="text-center text-sm ">
        <div className="center text-gray-400">Info & support:</div>
        <a href="mailto:robi@robisoft.it" className="text-gray-200 hover:text-white transition-colors">
          robi@robisoft.it
        </a>
      </div>
      <a href="https://github.com/robisoft/boardgamevision-demo-react" target="_blank" rel="noopener noreferrer" className="opacity-90 hover:opacity-100 transition-opacity">
        <img src={`${import.meta.env.BASE_URL}images/GitHub_Lockup_White.svg`} alt="GitHub" style={{ height: '26px' }} />
      </a>
    </footer>
  )
}
