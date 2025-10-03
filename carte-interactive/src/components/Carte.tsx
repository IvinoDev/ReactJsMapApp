import { useCallback, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { LatLngExpression, LeafletMouseEvent } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerPng from 'leaflet/dist/images/marker-icon.png'
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png'
import * as XLSX from 'xlsx'

// Icône PNG visible et fiable (icône par défaut Leaflet). Remplaçable par un PNG custom.
const maisonIcon = new L.Icon({
  iconUrl: markerPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'icone-maison'
})

// Icône spéciale pour le premier point du polygone (plus grande et colorée)
const premierPointIcon = new L.Icon({
  iconUrl: markerPng,
  shadowUrl: markerShadowPng,
  iconSize: [35, 55],
  iconAnchor: [17, 55],
  popupAnchor: [1, -34],
  shadowSize: [55, 55],
  className: 'icone-premier-point'
})

type Point = {
  lat: number
  lng: number
}

function EventsBinder(props: {
  onMapClick: (e: LeafletMouseEvent) => void
}) {
  useMapEvents({
    click: (e: LeafletMouseEvent) => props.onMapClick(e)
  })
  return null
}

export default function Carte() {
  const centreInitial: LatLngExpression = useMemo(() => [12.6392, -8.0029], []) // Bamako
  const [marqueurs, setMarqueurs] = useState<Point[]>([])
  const [pointsPolygone, setPointsPolygone] = useState<Point[]>([])
  const [polygoneFerme, setPolygoneFerme] = useState<boolean>(false)
  const [mode, setMode] = useState<'draw' | 'marker'>('draw')
  const [premierPointPolygone, setPremierPointPolygone] = useState<Point | null>(null)

  // Détection de la fermeture du polygone: si on clique près du premier point et >= 3 points
  const estProcheDuPremierPoint = useCallback((pt: Point, premier: Point | undefined) => {
    if (!premier) return false
    const distance = Math.hypot(pt.lat - premier.lat, pt.lng - premier.lng)
    return distance < 0.0008 // seuil approximatif en degrés (~80 m à Paris)
  }, [])

  const gererClicCarte = useCallback((e: LeafletMouseEvent) => {
    const nouveauPoint: Point = { lat: e.latlng.lat, lng: e.latlng.lng }

    if (mode === 'marker') {
      setMarqueurs((prev) => [...prev, nouveauPoint])
      return
    }

    // Mode dessin actif: on ajoute des points au polygone jusqu'à fermeture
    if (!polygoneFerme) {
      if (pointsPolygone.length >= 2 && estProcheDuPremierPoint(nouveauPoint, pointsPolygone[0])) {
        setPolygoneFerme(true)
        setPremierPointPolygone(null) // Clear the first point indicator
      } else {
        setPointsPolygone((prev) => {
          const newPoints = [...prev, nouveauPoint]
          // Set the first point indicator when starting to draw
          if (prev.length === 0) {
            setPremierPointPolygone(nouveauPoint)
          }
          return newPoints
        })
      }
    } else {
      // Polygone fermé: en mode dessin, on n'ajoute pas de marqueurs
      return
    }
  }, [mode, polygoneFerme, pointsPolygone, estProcheDuPremierPoint])

  const reinitialiserDessin = useCallback(() => {
    setPointsPolygone([])
    setPolygoneFerme(false)
    setPremierPointPolygone(null)
    setMode('draw')
  }, [])

  const reinitialiserMarqueurs = useCallback(() => {
    setMarqueurs([])
  }, [])

  const exporterJSON = useCallback(() => {
    if (pointsPolygone.length === 0 && marqueurs.length === 0) {
      alert('Aucune donnée à exporter')
      return
    }

    const data = {
      metadata: {
        dateExport: new Date().toISOString(),
        nombrePointsPolygone: pointsPolygone.length,
        nombreMarqueurs: marqueurs.length,
        polygoneFerme: polygoneFerme
      },
      polygone: pointsPolygone.length > 0 ? {
        type: 'polygone',
        coordinates: pointsPolygone.map(p => [p.lat, p.lng])
      } : null,
      marqueurs: marqueurs.length > 0 ? marqueurs.map((m, index) => ({
        id: index + 1,
        latitude: m.lat,
        longitude: m.lng,
        coordinates: [m.lat, m.lng]
      })) : []
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `carte_donnees_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [pointsPolygone, marqueurs, polygoneFerme])

  const exporterExcel = useCallback(() => {
    if (pointsPolygone.length === 0 && marqueurs.length === 0) {
      alert('Aucune donnée à exporter')
      return
    }

    const workbook = XLSX.utils.book_new()
    
    // Créer un onglet avec toutes les données
    const allData = []
    
    // En-têtes
    allData.push(['Type', 'ID/Point', 'Latitude', 'Longitude', 'Description'])
    
    // Données du polygone
    if (pointsPolygone.length > 0) {
      allData.push(['=== POLYGONE ===', '', '', '', ''])
      pointsPolygone.forEach((p, index) => {
        allData.push(['Polygone', index + 1, p.lat, p.lng, `Point ${index + 1} du polygone`])
      })
    }
    
    // Données des marqueurs
    if (marqueurs.length > 0) {
      allData.push(['=== MARQUEURS ===', '', '', '', ''])
      marqueurs.forEach((m, index) => {
        allData.push(['Marqueur', index + 1, m.lat, m.lng, `Marqueur ${index + 1}`])
      })
    }
    
    // Métadonnées
    allData.push(['=== MÉTADONNÉES ===', '', '', '', ''])
    allData.push(['Date d\'export', '', '', '', new Date().toLocaleString('fr-FR')])
    allData.push(['Points du polygone', '', '', '', pointsPolygone.length])
    allData.push(['Marqueurs', '', '', '', marqueurs.length])
    allData.push(['Polygone fermé', '', '', '', polygoneFerme ? 'Oui' : 'Non'])

    // Créer la feuille de calcul
    const worksheet = XLSX.utils.aoa_to_sheet(allData)
    
    // Ajuster la largeur des colonnes
    worksheet['!cols'] = [
      { wch: 15 }, // Type
      { wch: 10 }, // ID/Point
      { wch: 15 }, // Latitude
      { wch: 15 }, // Longitude
      { wch: 25 }  // Description
    ]
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Données de la carte')
    XLSX.writeFile(workbook, `carte_donnees_${new Date().toISOString().split('T')[0]}.xlsx`)
  }, [pointsPolygone, marqueurs, polygoneFerme])

  const coordonneesPolygoneLisibles = useMemo(() => {
    return pointsPolygone.map((p, i) => `Point ${i + 1}: (${p.lat.toFixed(6)}, ${p.lng.toFixed(6)})`)
  }, [pointsPolygone])

  return (
    <div className="carte-wrapper">
      <div className="entete">
        <h1>Carte Interactive</h1>
        <div className="mode-indicator" style={{ 
          padding: '12px', 
          margin: '8px 0', 
          borderRadius: '6px', 
          backgroundColor: mode === 'draw' ? '#dbeafe' : '#f0f9ff',
          border: `2px solid ${mode === 'draw' ? '#2563eb' : '#0ea5e9'}`,
          fontWeight: '600'
        }}>
          {mode === 'draw' ? (
            <div>
              <span style={{ color: '#2563eb' }}>🔵 Mode Dessin Actif</span>
              {pointsPolygone.length === 0 && (
                <div style={{ fontSize: '14px', color: '#1e40af', marginTop: '4px' }}>
                  Cliquez sur la carte pour commencer à dessiner un polygone
                </div>
              )}
              {pointsPolygone.length > 0 && !polygoneFerme && (
                <div style={{ fontSize: '14px', color: '#1e40af', marginTop: '4px' }}>
                  {pointsPolygone.length < 3 
                    ? `Point ${pointsPolygone.length}/3 minimum - Continuez à cliquer pour ajouter des points`
                    : `Polygone en cours (${pointsPolygone.length} points) - Cliquez sur le point de départ pour fermer le polygone`
                  }
                </div>
              )}
            </div>
          ) : (
            <div>
              <span style={{ color: '#0ea5e9' }}>📍 Mode Marqueur Actif</span>
              <div style={{ fontSize: '14px', color: '#0c4a6e', marginTop: '4px' }}>
                Cliquez sur la carte pour ajouter des marqueurs
                {marqueurs.length > 0 && (
                  <span style={{ fontWeight: '600', marginLeft: '8px' }}>
                    ({marqueurs.length} marqueur{marqueurs.length > 1 ? 's' : ''} sur la carte)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="actions">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={reinitialiserDessin} aria-label="Réinitialiser le dessin">
              Réinitialiser le dessin
            </button>
            <button 
              onClick={reinitialiserMarqueurs} 
              aria-label="Réinitialiser les marqueurs"
              style={{ backgroundColor: '#dc2626', color: 'white' }}
            >
              Réinitialiser les marqueurs
            </button>
            <div style={{ display: 'inline-flex', gap: 8, marginLeft: 12 }}>
              <button
                onClick={() => setMode('draw')}
                aria-pressed={mode === 'draw'}
                aria-label="Mode dessin de polygone"
                style={{ 
                  fontWeight: mode === 'draw' ? 700 : 400,
                  backgroundColor: mode === 'draw' ? '#2563eb' : '#f3f4f6',
                  color: mode === 'draw' ? 'white' : '#374151',
                  border: '2px solid #2563eb'
                }}
              >
                Mode: Dessin
              </button>
              <button
                onClick={() => setMode('marker')}
                aria-pressed={mode === 'marker'}
                aria-label="Mode ajout de marqueur"
                style={{ 
                  fontWeight: mode === 'marker' ? 700 : 400,
                  backgroundColor: mode === 'marker' ? '#0ea5e9' : '#f3f4f6',
                  color: mode === 'marker' ? 'white' : '#374151',
                  border: '2px solid #0ea5e9'
                }}
              >
                Mode: Marqueur
              </button>
            </div>
          </div>
        </div>
      </div>

      <MapContainer center={centreInitial} zoom={13} className="carte" aria-label="Carte Leaflet">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <EventsBinder onMapClick={(e: LeafletMouseEvent) => gererClicCarte(e)} />

        {marqueurs.map((m, idx) => (
          <Marker key={`m-${idx}`} position={[m.lat, m.lng]} icon={maisonIcon}>
            <Popup>
              <div>
                <strong>Coordonnées</strong>
                <div>Lat: {m.lat.toFixed(6)}</div>
                <div>Lng: {m.lng.toFixed(6)}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Marqueur spécial pour le premier point du polygone */}
        {premierPointPolygone && !polygoneFerme && (
          <Marker position={[premierPointPolygone.lat, premierPointPolygone.lng]} icon={premierPointIcon}>
            <Popup>
              <div>
                <strong>Point de départ du polygone</strong>
                <div>Cliquez près de ce point pour fermer le polygone</div>
                <div>Lat: {premierPointPolygone.lat.toFixed(6)}</div>
                <div>Lng: {premierPointPolygone.lng.toFixed(6)}</div>
              </div>
            </Popup>
          </Marker>
        )}

        {pointsPolygone.length >= 2 && !polygoneFerme && (
          <Polygon positions={pointsPolygone.map((p) => [p.lat, p.lng]) as LatLngExpression[]} pathOptions={{ color: '#2563eb', dashArray: '6 6' }} />
        )}

        {polygoneFerme && pointsPolygone.length >= 3 && (
          <Polygon positions={pointsPolygone.map((p) => [p.lat, p.lng]) as LatLngExpression[]} pathOptions={{ color: '#16a34a' }} />
        )}
      </MapContainer>

      <section className="panneau-infos">
        <h2>Coordonnées du polygone</h2>
        {!polygoneFerme && pointsPolygone.length < 3 && (
          <p>Ajoutez au moins trois points pour former un polygone.</p>
        )}
        {pointsPolygone.length === 0 && (
          <p>Aucun point ajouté pour l'instant.</p>
        )}
        {pointsPolygone.length > 0 && (
          <div>
            <ul>
              {coordonneesPolygoneLisibles.map((txt, i) => (
                <li key={`c-${i}`}>{txt}</li>
              ))}
            </ul>
          </div>
        )}
        {polygoneFerme && (
          <div>
            <p className="statut-ferme">Polygone fermé. Basculez en mode "Marqueur" pour ajouter des marqueurs.</p>
            <div style={{ marginTop: 8 }}>
              <strong>Tableau des coordonnées du polygone (lat, lng):</strong>
              <pre style={{ background: '#f5f5f5', padding: 8, overflowX: 'auto' }}>
{JSON.stringify(pointsPolygone.map((p) => [p.lat, p.lng]), null, 2)}
              </pre>
            </div>
          </div>
        )}

        {marqueurs.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <strong>Tableau des coordonnées des marqueurs (lat, lng):</strong>
            <pre style={{ background: '#f5f5f5', padding: 8, overflowX: 'auto' }}>
{JSON.stringify(marqueurs.map((m) => [m.lat, m.lng]), null, 2)}
            </pre>
          </div>
        )}

        {/* Boutons d'export - toujours visibles si il y a des données */}
        {(pointsPolygone.length > 0 || marqueurs.length > 0) && (
          <div style={{ marginTop: 16, padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#374151' }}>Exporter les données</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button 
                onClick={exporterJSON}
                style={{ 
                  backgroundColor: '#059669', 
                  color: 'white', 
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                📄 Exporter JSON
              </button>
              <button 
                onClick={exporterExcel}
                style={{ 
                  backgroundColor: '#dc2626', 
                  color: 'white', 
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                📊 Exporter Excel
              </button>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
              Exporte {pointsPolygone.length > 0 ? `${pointsPolygone.length} point(s) du polygone` : ''}
              {pointsPolygone.length > 0 && marqueurs.length > 0 ? ' et ' : ''}
              {marqueurs.length > 0 ? `${marqueurs.length} marqueur(s)` : ''}
            </p>
          </div>
        )}
      </section>
    </div>
  )
}



