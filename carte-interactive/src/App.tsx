import './App.css'
import Carte from './components/Carte'

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <span className="badge">Exercice tehcnique carte interactive - SINI GROUPE</span>
        <h1>Carte interactive Leaflet (React)</h1>
        <p className="sous-titre">Ajoutez des marqueurs et dessinez un polygone</p>
      </header>
      <main>
        <Carte />
      </main>
      <footer className="footer">
        <small>Interface réalisée avec • React + Leaflet • Vite</small>
      </footer>
    </div>
  )
}
