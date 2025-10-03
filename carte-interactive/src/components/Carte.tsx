import { useCallback, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { LatLngExpression, LeafletMouseEvent } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerPng from 'leaflet/dist/images/marker-icon.png'
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png'

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
      } else {
        setPointsPolygone((prev) => [...prev, nouveauPoint])
      }
    } else {
      // Polygone fermé: en mode dessin, on n'ajoute pas de marqueurs
      return
    }
  }, [mode, polygoneFerme, pointsPolygone, estProcheDuPremierPoint])

  const reinitialiserDessin = useCallback(() => {
    setPointsPolygone([])
    setPolygoneFerme(false)
    setMode('draw')
  }, [])

  const coordonneesPolygoneLisibles = useMemo(() => {
    return pointsPolygone.map((p, i) => `Point ${i + 1}: (${p.lat.toFixed(6)}, ${p.lng.toFixed(6)})`)
  }, [pointsPolygone])

  return (
    <div className="carte-wrapper">
      <div className="entete">
        <h1>Carte Interactive</h1>
        <p>
          - Mode "Dessiner": cliquez pour tracer un polygone (au moins 3 points). Re-cliquez près du premier point pour le fermer.
          - Mode "Marqueur": cliquez sur la carte pour ajouter un marqueur avec icône personnalisée.
        </p>
        <div className="actions">
          <button onClick={reinitialiserDessin} aria-label="Réinitialiser le dessin">
            Réinitialiser le dessin
          </button>
          <div style={{ display: 'inline-flex', gap: 8, marginLeft: 12 }}>
            <button
              onClick={() => setMode('draw')}
              aria-pressed={mode === 'draw'}
              aria-label="Mode dessin de polygone"
              style={{ fontWeight: mode === 'draw' ? 700 : 400 }}
            >
              Mode: Dessiner
            </button>
            <button
              onClick={() => setMode('marker')}
              aria-pressed={mode === 'marker'}
              aria-label="Mode ajout de marqueur"
              style={{ fontWeight: mode === 'marker' ? 700 : 400 }}
            >
              Mode: Marqueur
            </button>
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
          <ul>
            {coordonneesPolygoneLisibles.map((txt, i) => (
              <li key={`c-${i}`}>{txt}</li>
            ))}
          </ul>
        )}
        {polygoneFerme && (
          <div>
            <p className="statut-ferme">Polygone fermé. Basculez en mode "Marqueur" pour ajouter des marqueurs.</p>
            <div style={{ marginTop: 8 }}>
              <strong>Tableau des coordonnées (lat, lng):</strong>
              <pre style={{ background: '#f5f5f5', padding: 8, overflowX: 'auto' }}>
{JSON.stringify(pointsPolygone.map((p) => [p.lat, p.lng]), null, 2)}
              </pre>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}



