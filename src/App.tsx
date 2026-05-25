import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  Car,
  ChevronRight,
  Clock3,
  MapPin,
  Navigation,
  Route,
  Train,
} from 'lucide-react'
import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './App.css'

type Phase = 'francia' | 'belgica' | 'costa' | 'sur' | 'espana'

type Stop = {
  id: string
  name: string
  country: string
  phase: Phase
  dates: string
  transport: 'Metro' | 'Tren' | 'Auto' | 'Ferry' | 'Caminata'
  position: LatLngExpression
  photo: string
  headline: string
  details: string[]
  highlights: string[]
}

type PreviewPhoto = {
  alt: string
  url: string
}

const phaseLabels: Record<Phase, string> = {
  francia: 'París y alrededores',
  belgica: 'Sprint belga',
  costa: 'Costa Azul',
  sur: 'Sur histórico',
  espana: 'España al límite',
}

const phaseColors: Record<Phase, string> = {
  francia: '#2563eb',
  belgica: '#d9480f',
  costa: '#008575',
  sur: '#8b5cf6',
  espana: '#c0262d',
}

const travelCards = [
  {
    title: 'París',
    icon: Train,
    body: 'Navigo Easy por persona con Carnet de 10 viajes t+. Para Versalles, ticket Origen-Destino a Zona 4.',
  },
  {
    title: 'Eurail',
    icon: Route,
    body: 'Reservar con anticipación todos los trenes marcados como “Requiere Reserva”. TER y SNCB no requieren reserva.',
  },
  {
    title: 'Barcelona',
    icon: Navigation,
    body: 'T-Casual por persona. Rinde 10 viajes y no se puede compartir simultáneamente.',
  },
  {
    title: 'Madrid',
    icon: MapPin,
    body: 'Tarjeta Multi para el grupo. Cargar con billete de 10 viajes Metrobús.',
  },
]

const stops: Stop[] = [
  {
    id: 'paris',
    name: 'París y Vanves',
    country: 'Francia',
    phase: 'francia',
    dates: '12-16 junio',
    transport: 'Metro',
    position: [48.8566, 2.3522],
    photo:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Base en Vanves, caminatas imperiales, Montmartre, techos panorámicos y el corazón histórico antes de bajar al sur.',
    highlights: [
      'Campos Elíseos y Arco de Triunfo iluminado',
      'Trocadéro, Torre Eiffel, Inválidos, Puente Alejandro III y Louvre',
      'Montmartre, Moulin Rouge, Place du Tertre y Sacré-Cœur',
      'Ópera Garnier, Galerías Lafayette, Le Marais e Île de la Cité',
    ],
    details: [
      '12/06 18:00 llegada a París, traslado a 72 Rue Jean Bleuzen en Vanves y check-in express.',
      '12/06 20:00 Línea 13 desde Malakoff - Plateau de Vanves hasta Champs-Élysées - Clemenceau. Recorrido a pie por Campos Elíseos hasta el Arco de Triunfo iluminado.',
      '13/06 08:30 metro a Trocadéro, fotos con la Torre Eiffel, jardines, Campo de Marte, Los Inválidos y Puente Alejandro III.',
      '13/06 12:00 Plaza de la Concordia, Jardines de las Tullerías y Pirámide del Louvre por exteriores.',
      '13/06 tarde/noche Montmartre: Moulin Rouge exterior, pared de Te Amo, Place du Tertre y atardecer en Sacré-Cœur.',
      '16/06 09:00 check-out, equipaje en consignas de Gare de Lyon. Île de la Cité, Notre Dame exterior, Sainte-Chapelle, Conciergerie, Barrio Latino, Sorbona, Panteón y Jardines de Luxemburgo.',
      '16/06 17:22 TGV directo a Niza con reserva. Luego TER hasta Cannes.',
    ],
  },
  {
    id: 'versailles',
    name: 'Versalles',
    country: 'Francia',
    phase: 'francia',
    dates: '14 junio',
    transport: 'Tren',
    position: [48.8049, 2.1204],
    photo:
      'https://images.unsplash.com/photo-1591289009723-aef0a1a8a211?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Palacio, jardines gigantes y regreso a París para mirar la ciudad desde las alturas.',
    highlights: [
      'Transilien Línea N desde Gare de Vanves - Malakoff',
      'Palacio de Versalles',
      'Jardines y Dominios de María Antonieta',
      'Regreso por Ópera Garnier y Galerías Lafayette',
    ],
    details: [
      '14/06 08:00 Transilien Línea N desde Gare de Vanves - Malakoff hasta Versailles Chantiers.',
      '14/06 09:00 entrada al Palacio de Versalles, recorrido interior y salida rápida a los jardines.',
      'Jardines a pie o en bicicleta hasta los Dominios de María Antonieta.',
      '14/06 15:00 regreso a París. Ópera Garnier y terraza gratuita de Galerías Lafayette.',
      '14/06 18:00 caminata por Le Marais: Plaza de los Vosgos, Centro Pompidou exterior y Hôtel de Ville.',
    ],
  },
  {
    id: 'brussels',
    name: 'Bruselas',
    country: 'Bélgica',
    phase: 'belgica',
    dates: '15 junio',
    transport: 'Tren',
    position: [50.8467, 4.3525],
    photo:
      'https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Primera mitad del maratón belga: Grand Place, figuras icónicas y galerías cubiertas.',
    highlights: [
      'TGV Eurostar Paris Nord a Bruselas',
      'Grand Place',
      'Manneken Pis y Jeanneke Pis',
      'Galerías Saint Hubert',
    ],
    details: [
      '15/06 07:23 - 08:45 TGV Eurostar Paris Nord a Bruselas. Requiere reserva.',
      'Caminata al centro desde la estación.',
      'Recorrido por Grand Place, Manneken Pis, Jeanneke Pis y Galerías Saint Hubert.',
      '15/06 14:07 tren intercity hacia Gante.',
    ],
  },
  {
    id: 'ghent',
    name: 'Gante',
    country: 'Bélgica',
    phase: 'belgica',
    dates: '15 junio',
    transport: 'Tren',
    position: [51.0543, 3.7174],
    photo:
      'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Núcleo histórico compacto, muelles medievales y castillo antes del regreso a París.',
    highlights: [
      'Tranvía 1 al centro histórico',
      'Muelles Graslei y Korenlei',
      'Puente de San Miguel',
      'Castillo de los Condes de Flandes',
    ],
    details: [
      '15/06 14:07 - 14:35 tren intercity a Gante.',
      'Tranvía 1 directo al núcleo histórico.',
      'Recorrido a pie por Graslei, Korenlei, puente de San Miguel y Castillo de los Condes de Flandes.',
      '15/06 18:00 tren de regreso a París con transbordo en Bruselas. Requiere reserva en el tramo internacional.',
    ],
  },
  {
    id: 'cannes',
    name: 'Cannes',
    country: 'Francia',
    phase: 'costa',
    dates: '16-18 junio',
    transport: 'Tren',
    position: [43.5528, 7.0174],
    photo:
      'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Base de la Costa Azul: llegada nocturna, trenes regionales y paseo por La Croisette.',
    highlights: [
      'Llegada desde Niza en TER',
      'Base para Menton, Mónaco, Niza y St. Raphael',
      'Boulevard de la Croisette',
      'Conexión final hacia Marsella',
    ],
    details: [
      '16/06 llegada a Niza a las 23:04 y traslado regional TER hasta Cannes para instalar el hotel base.',
      '17/06 salida 08:13 en TER desde Cannes a Menton.',
      '17/06 19:59 - 20:36 TER de regreso desde Niza a Cannes.',
      'Paseo nocturno por Boulevard de la Croisette.',
      '18/06 07:59 - 08:22 TER Cannes a St. Raphael Valescure.',
    ],
  },
  {
    id: 'menton',
    name: 'Menton',
    country: 'Francia',
    phase: 'costa',
    dates: '17 junio',
    transport: 'Tren',
    position: [43.7745, 7.4975],
    photo:
      'https://images.unsplash.com/photo-1610997686651-98492fd08159?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Casco antiguo pastel y subida rápida hasta la Basílica antes de saltar a Mónaco.',
    highlights: [
      'TER Cannes a Menton',
      'Casco antiguo de colores pastel',
      'Basílica de San Miguel Arcángel',
      'Tren regional a Mónaco',
    ],
    details: [
      '17/06 08:13 - 09:32 tren regional TER desde Cannes a Menton.',
      'Subida por el casco antiguo de colores pastel hasta la Basílica de San Miguel Arcángel.',
      '17/06 12:39 - 12:50 tren regional TER a Mónaco.',
    ],
  },
  {
    id: 'monaco',
    name: 'Mónaco',
    country: 'Mónaco',
    phase: 'costa',
    dates: '17 junio',
    transport: 'Tren',
    position: [43.7384, 7.4246],
    photo:
      'https://images.unsplash.com/photo-1570521462033-3015e76e7432?auto=format&fit=crop&w=1200&q=80',
    headline:
      'La Roca, puerto, circuito de F1 y Casino antes del atardecer en Niza.',
    highlights: [
      'Palacio del Príncipe',
      'Puerto de Hércules',
      'Trazado de Fórmula 1',
      'Casino de Montecarlo',
    ],
    details: [
      '17/06 12:39 - 12:50 TER desde Menton a Mónaco.',
      'Subida a La Roca para ver el Palacio del Príncipe.',
      'Bajada al Puerto de Hércules y caminata por el trazado de Fórmula 1.',
      'Recorrido hasta el Casino de Montecarlo.',
      '17/06 17:07 - 17:29 TER a Niza.',
    ],
  },
  {
    id: 'nice',
    name: 'Niza',
    country: 'Francia',
    phase: 'costa',
    dates: '17 junio',
    transport: 'Tren',
    position: [43.7102, 7.262],
    photo:
      'https://images.unsplash.com/photo-1533614767277-8781094e1525?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Paseo de los Ingleses y Colina del Castillo al atardecer.',
    highlights: [
      'Paseo de los Ingleses',
      'Colina del Castillo',
      'Ascensor gratuito',
      'Regreso nocturno a Cannes',
    ],
    details: [
      '17/06 17:07 - 17:29 TER desde Mónaco a Niza.',
      'Caminata por el Paseo de los Ingleses.',
      'Subida a la Colina del Castillo en ascensor gratuito para el atardecer.',
      '17/06 19:59 - 20:36 TER de regreso a Cannes.',
    ],
  },
  {
    id: 'saint-tropez',
    name: 'Saint-Tropez',
    country: 'Francia',
    phase: 'costa',
    dates: '18 junio',
    transport: 'Ferry',
    position: [43.2677, 6.6407],
    photo:
      'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Acceso por mar desde St. Raphael, puerto antiguo y subida a la Ciudadela.',
    highlights: [
      'TER a St. Raphael Valescure',
      'Ferry Bateaux Verts',
      'Sainte-Maxime',
      'Puerto antiguo y Ciudadela',
    ],
    details: [
      '18/06 07:59 - 08:22 TER de Cannes a St. Raphael Valescure.',
      'Correr al puerto de St. Raphael y tomar ferry rápido Bateaux Verts a Sainte-Maxime.',
      'Cruce directo a Saint-Tropez por mar.',
      'Explorar el puerto antiguo y subir a la Ciudadela.',
      'Regreso en ferry a St. Raphael.',
      '18/06 20:26 - 22:03 tren intercity desde St. Raphael hasta Marsella. Requiere reserva.',
    ],
  },
  {
    id: 'marseille',
    name: 'Marsella',
    country: 'Francia',
    phase: 'sur',
    dates: '18-19 junio',
    transport: 'Caminata',
    position: [43.2965, 5.3698],
    photo:
      'https://images.unsplash.com/photo-1590927032200-6180f03d80ef?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Vieux-Port, subida a Notre-Dame de la Garde y Le Panier antes de Cassis.',
    highlights: [
      'Vieux-Port',
      'Notre-Dame de la Garde',
      'Le Panier',
      'Tren local a Cassis',
    ],
    details: [
      '18/06 noche en Marsella tras llegar desde St. Raphael.',
      '19/06 08:00 caminata por el Vieux-Port.',
      'Subida fuerte hasta la Basílica de Notre-Dame de la Garde.',
      'Bajada por el barrio antiguo Le Panier.',
      'Mediodía tren local a Cassis.',
    ],
  },
  {
    id: 'cassis',
    name: 'Cassis',
    country: 'Francia',
    phase: 'sur',
    dates: '19 junio',
    transport: 'Caminata',
    position: [43.214, 5.5396],
    photo:
      'https://images.unsplash.com/photo-1600785495858-efcf98221c8e?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Puerto, trekking al Parque Nacional y Calanque de Port-Pin.',
    highlights: [
      'Puerto de Cassis',
      'Parque Nacional de Calanques',
      'Calanque de Port-Pin',
      'Tren nocturno a Aviñón',
    ],
    details: [
      '19/06 mediodía tren local desde Marsella a Cassis.',
      'Desde la estación, bajar al puerto.',
      'Inicio del trekking por el Parque Nacional hasta la Calanque de Port-Pin.',
      '19/06 18:32 - 19:46 tren de Cassis a Aviñón.',
    ],
  },
  {
    id: 'avignon',
    name: 'Aviñón',
    country: 'Francia',
    phase: 'sur',
    dates: '19-20 junio',
    transport: 'Tren',
    position: [43.9493, 4.8055],
    photo:
      'https://images.unsplash.com/photo-1596460987569-70515822e936?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Casco histórico iluminado y salida temprana hacia el acueducto romano.',
    highlights: [
      'Place de l’Horloge',
      'Palacio de los Papas',
      'Puente de Aviñón',
      'Bus liO hacia Pont du Gard',
    ],
    details: [
      '19/06 18:32 - 19:46 tren de Cassis a Aviñón.',
      'Check-in rápido.',
      'Noche por el casco histórico iluminado: Place de l’Horloge, Palacio de los Papas exterior y Puente de Aviñón.',
      '20/06 08:30 autobús Línea 115 Red liO desde Aviñón a Rond-Point Pont du Gard.',
    ],
  },
  {
    id: 'pont-du-gard',
    name: 'Pont du Gard',
    country: 'Francia',
    phase: 'sur',
    dates: '20 junio',
    transport: 'Caminata',
    position: [43.9476, 4.535],
    photo:
      'https://images.unsplash.com/photo-1621944047086-2e5ea49d1a24?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Acueducto romano colosal, dos horas de exploración y conexión en bus hacia Nimes.',
    highlights: [
      'Autobús Línea 115',
      'Rond-Point Pont du Gard',
      'Acueducto romano',
      'Autobús Línea 121 a Nimes',
    ],
    details: [
      '20/06 08:30 bus Línea 115 desde Aviñón.',
      'Bajada en Rond-Point Pont du Gard.',
      '20/06 09:45 - 11:45 exploración a pie del acueducto romano.',
      '20/06 12:00 bus Línea 121 Red liO hacia Nimes.',
    ],
  },
  {
    id: 'nimes',
    name: 'Nimes',
    country: 'Francia',
    phase: 'sur',
    dates: '20 junio',
    transport: 'Tren',
    position: [43.8367, 4.3601],
    photo:
      'https://images.unsplash.com/photo-1602715537742-402326fbfb48?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Speedrun romano antes del tren con reserva hacia Carcasona.',
    highlights: [
      'Arena de Nimes',
      'Maison Carrée',
      'Bulevar romano',
      'Tren a Carcasona',
    ],
    details: [
      '20/06 13:00 llegada a Nimes.',
      'Correr a la Arena de Nimes, anfiteatro romano.',
      'Subir por el bulevar para admirar la fachada de la Maison Carrée.',
      'Regreso rápido a la estación.',
      '20/06 14:36 - 16:31 tren desde Nimes a Carcasona. Requiere reserva.',
    ],
  },
  {
    id: 'carcassonne',
    name: 'Carcasona',
    country: 'Francia',
    phase: 'sur',
    dates: '20-21 junio',
    transport: 'Tren',
    position: [43.213, 2.3491],
    photo:
      'https://images.unsplash.com/photo-1603205855528-7eb577a2759f?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Ciudadela medieval amurallada, Pont Vieux y noche iluminada.',
    highlights: [
      'Cité de Carcassonne',
      'Pont Vieux',
      'Murallas medievales',
      'Salida a Collioure',
    ],
    details: [
      '20/06 14:36 - 16:31 tren desde Nimes a Carcasona.',
      'Ir directo a la Cité de Carcassonne.',
      'Cruzar el Pont Vieux y entrar en la ciudadela medieval amurallada.',
      'Quedarse a verla iluminada de noche.',
      '21/06 08:18 tren desde Carcasona a Collioure.',
    ],
  },
  {
    id: 'collioure',
    name: 'Collioure',
    country: 'Francia',
    phase: 'sur',
    dates: '21 junio',
    transport: 'Tren',
    position: [42.5251, 3.0832],
    photo:
      'https://images.unsplash.com/photo-1627211474321-c451c7f6322a?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Costa Bermeja, playa, iglesia frente al mar y castillo real.',
    highlights: [
      'Tren desde Carcasona',
      'Iglesia de Notre-Dame-des-Anges',
      'Castillo Real',
      'Tren regional a Perpiñán',
    ],
    details: [
      '21/06 08:18 - 10:11 tren desde Carcasona a Collioure.',
      'Caminata por la playa.',
      'Visita exterior de la Iglesia de Notre-Dame-des-Anges y Castillo Real.',
      '21/06 11:43 - 12:04 tren regional a Perpiñán.',
    ],
  },
  {
    id: 'perpignan',
    name: 'Perpiñán',
    country: 'Francia',
    phase: 'sur',
    dates: '21-22 junio',
    transport: 'Tren',
    position: [42.6887, 2.8948],
    photo:
      'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Última noche francesa: El Castillet y Palacio de los Reyes de Mallorca.',
    highlights: [
      'El Castillet',
      'Palacio de los Reyes de Mallorca',
      'Noche en Perpiñán',
      'Cruce a España en auto',
    ],
    details: [
      '21/06 11:43 - 12:04 tren regional desde Collioure.',
      'Tarde recorriendo El Castillet.',
      'Visita al Palacio de los Reyes de Mallorca.',
      'Noche en Perpiñán.',
      '22/06 09:00 retiro de auto alquilado y cruce de frontera hacia España.',
    ],
  },
  {
    id: 'cadaques',
    name: 'Cadaqués',
    country: 'España',
    phase: 'espana',
    dates: '22 junio',
    transport: 'Auto',
    position: [42.2888, 3.2779],
    photo:
      'https://images.unsplash.com/photo-1596119355957-72b0ba809186?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Roadtrip por la Costa Brava con parada en pueblo blanco frente al mar.',
    highlights: [
      'Cruce de frontera desde Perpiñán',
      'Pueblo blanco de Cadaqués',
      'Ruta costera',
      'Continuación a Tossa de Mar',
    ],
    details: [
      '22/06 09:00 retirar auto alquilado en Perpiñán.',
      'Cruzar la frontera hacia España.',
      'Conducir por ruta costera al pueblo blanco de Cadaqués.',
      'Recorrer el frente marítimo y calles del pueblo.',
      'Por la tarde continuar hacia Tossa de Mar.',
    ],
  },
  {
    id: 'tossa',
    name: 'Tossa de Mar',
    country: 'España',
    phase: 'espana',
    dates: '22 junio',
    transport: 'Auto',
    position: [41.7209, 2.9336],
    photo:
      'https://images.unsplash.com/photo-1599995491158-5bbcb9989d5f?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Muralla medieval junto a la arena antes de entrar a Barcelona.',
    highlights: [
      'Costa Brava',
      'Muralla medieval',
      'Playa y casco histórico',
      'Devolución de auto en Barcelona',
    ],
    details: [
      '22/06 tarde conducción desde Cadaqués hacia el sur.',
      'Parada en Tossa de Mar.',
      'Subida a la muralla medieval junto a la arena.',
      'Conducir a Barcelona de noche.',
      'Devolver el auto y hacer check-in.',
    ],
  },
  {
    id: 'barcelona',
    name: 'Barcelona',
    country: 'España',
    phase: 'espana',
    dates: '22-25 junio',
    transport: 'Metro',
    position: [41.3874, 2.1686],
    photo:
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Gaudí, Barrio Gótico, mar, Montjuïc y vistas de atardecer antes del AVE a Madrid.',
    highlights: [
      'Sagrada Familia',
      'Paseo de Gracia, La Pedrera y Casa Batlló',
      'Boquería, Gótico, El Born y Ciutadella',
      'Park Güell, Barceloneta, Montjuïc, MNAC y Búnkers del Carmel',
    ],
    details: [
      '22/06 noche llegada a Barcelona, devolución del auto y check-in.',
      '23/06 09:00 entrada a Sagrada Familia.',
      '23/06 11:30 Paseo de Gracia, fachadas de La Pedrera y Casa Batlló.',
      '23/06 13:00 Plaza Cataluña, Las Ramblas y Mercado de la Boquería.',
      '23/06 14:30 Barrio Gótico, Catedral, Plaza del Rei, El Born y Santa María del Mar.',
      '23/06 17:30 Parque de la Ciutadella y Arco de Triunfo. Atardecer en Búnkers del Carmel.',
      '24/06 08:30 Park Güell. 11:30 Barceloneta y Port Vell. 14:30 subida a Montjuïc, Anillo Olímpico y Castillo. 18:32 bajada a Plaza de España y atardecer desde MNAC.',
      '25/06 08:25 - 11:10 AVE Barcelona a Madrid-Puerta de Atocha. Requiere reserva.',
    ],
  },
  {
    id: 'madrid',
    name: 'Madrid',
    country: 'España',
    phase: 'espana',
    dates: '25-28 junio',
    transport: 'Metro',
    position: [40.4168, -3.7038],
    photo:
      'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Base final: Retiro, Palacio Real, Gran Vía, Debod, Rastro y salida por Barajas.',
    highlights: [
      'Puerta del Sol y Plaza Mayor',
      'Parque de El Retiro',
      'Palacio Real, Almudena y Gran Vía',
      'Templo de Debod, El Rastro, Bernabéu o Madrid Río',
    ],
    details: [
      '25/06 08:25 - 11:10 AVE Barcelona a Madrid-Puerta de Atocha. Requiere reserva.',
      '25/06 12:00 check-in express y compra de Tarjeta Multi.',
      '25/06 13:00 Puerta del Sol, Plaza Mayor y almuerzo rápido.',
      '25/06 15:00 Puerta de Alcalá y circuito por El Retiro: Estanque Grande, Palacio de Cristal, Palacio de Velázquez y Fuente del Ángel Caído.',
      '25/06 17:30 metro a Ópera, Palacio Real, Catedral de la Almudena y Jardines de Sabatini.',
      '25/06 19:00 Gran Vía hasta edificio Metrópolis. 20:30 Templo de Debod al atardecer.',
      '27/06 16:30 Museo del Prado o Reina Sofía. 18:30 Barrio de las Letras, Chueca y Malasaña. Noche en Círculo de Bellas Artes o Riu Plaza España.',
      '28/06 09:00 El Rastro. 13:00 bocadillo de calamares en La Campana. Tarde en Santiago Bernabéu o Madrid Río y Matadero. 20:00 salida al Aeropuerto Madrid-Barajas. 23:55 embarque.',
    ],
  },
  {
    id: 'toledo',
    name: 'Toledo',
    country: 'España',
    phase: 'espana',
    dates: '26 junio',
    transport: 'Tren',
    position: [39.8628, -4.0273],
    photo:
      'https://images.unsplash.com/photo-1558642084-fd07fae5282e?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Invasión medieval: Zocodover, Alcázar, Catedral y caminata dura al Mirador del Valle.',
    highlights: [
      'Avant desde Atocha',
      'Plaza Zocodover y Alcázar',
      'Catedral Primada',
      'Puente de San Martín y Mirador del Valle',
    ],
    details: [
      '26/06 10:15 - 10:48 tren Avant desde Atocha a Toledo. Requiere reserva.',
      'Día por Plaza Zocodover, Alcázar y Catedral Primada.',
      'Cruzar el Puente de San Martín.',
      'Senderismo bordeando el río Tajo hasta el Mirador del Valle.',
      '26/06 17:25 - 17:58 tren Avant de regreso a Madrid Atocha.',
      'Noche de tapeo por Calle Cava Baja en La Latina.',
    ],
  },
  {
    id: 'segovia',
    name: 'Segovia',
    country: 'España',
    phase: 'espana',
    dates: '27 junio',
    transport: 'Tren',
    position: [40.9429, -4.1088],
    photo:
      'https://images.unsplash.com/photo-1591289009723-aef0a1a8a211?auto=format&fit=crop&w=1200&q=80',
    headline:
      'Acueducto romano en plena calle, Catedral y Alcázar antes de volver a Madrid.',
    highlights: [
      'Madrid-Chamartín',
      'Acueducto de Segovia',
      'Catedral de Segovia',
      'Alcázar de Segovia',
    ],
    details: [
      '27/06 09:00 metro o Cercanías a Madrid-Chamartín.',
      '27/06 09:30 aprox. tren AVANT/AVE a Segovia-Guiomar. Requiere reserva.',
      'Bus urbano Línea 11 desde la estación hasta el Acueducto.',
      'Subida por Calle Real, Catedral de Segovia y Alcázar de Segovia.',
      '27/06 15:30 tren de alta velocidad de regreso a Madrid-Chamartín.',
    ],
  },
]

const routeStopIds = [
  'paris',
  'versailles',
  'paris',
  'brussels',
  'ghent',
  'paris',
  'cannes',
  'menton',
  'monaco',
  'nice',
  'cannes',
  'saint-tropez',
  'marseille',
  'cassis',
  'avignon',
  'pont-du-gard',
  'nimes',
  'carcassonne',
  'collioure',
  'perpignan',
  'cadaques',
  'tossa',
  'barcelona',
  'madrid',
  'toledo',
  'madrid',
  'segovia',
  'madrid',
]

const stopsById = new Map(stops.map((stop) => [stop.id, stop]))
const route = routeStopIds
  .map((id) => stopsById.get(id)?.position)
  .filter((position): position is LatLngExpression => Boolean(position))

const photoQueries: Record<string, string> = {
  paris: 'paris,eiffel,france',
  versailles: 'versailles,palace,france',
  brussels: 'brussels,grand-place,belgium',
  ghent: 'ghent,belgium,canal',
  cannes: 'cannes,france,riviera',
  menton: 'menton,france,riviera',
  monaco: 'monaco,monte-carlo',
  nice: 'nice,france,promenade',
  'saint-tropez': 'saint-tropez,france',
  marseille: 'marseille,france,port',
  cassis: 'cassis,calanques,france',
  avignon: 'avignon,france,palace',
  'pont-du-gard': 'pont-du-gard,france',
  nimes: 'nimes,france,roman',
  carcassonne: 'carcassonne,france,castle',
  collioure: 'collioure,france,sea',
  perpignan: 'perpignan,france',
  cadaques: 'cadaques,spain,costa-brava',
  tossa: 'tossa-de-mar,spain',
  barcelona: 'barcelona,spain,gaudi',
  madrid: 'madrid,spain,city',
  toledo: 'toledo,spain,medieval',
  segovia: 'segovia,spain,aqueduct',
}

function getStopPhotos(stop: Stop): PreviewPhoto[] {
  const query = photoQueries[stop.id] ?? `${stop.name},${stop.country}`

  return [
    {
      alt: `Foto principal de ${stop.name}`,
      url: stop.photo,
    },
    {
      alt: `Segunda foto de ${stop.name}`,
      url: `https://loremflickr.com/1200/800/${query}?lock=${stop.id.length * 37 + 11}`,
    },
    {
      alt: `Tercera foto de ${stop.name}`,
      url: `https://loremflickr.com/1200/800/${query}?lock=${stop.id.length * 53 + 29}`,
    },
  ]
}

function MapFocusController({ stop }: { stop: Stop }) {
  const map = useMap()

  useEffect(() => {
    map.invalidateSize({ pan: false })
    window.requestAnimationFrame(() => {
      map.flyTo(stop.position, Math.max(map.getZoom(), 7), {
        duration: 0.65,
        easeLinearity: 0.2,
      })
    })
  }, [map, stop])

  return null
}

function App() {
  const [selectedId, setSelectedId] = useState(stops[0].id)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [phaseFilter, setPhaseFilter] = useState<Phase | 'all'>('all')
  const [photoIndexes, setPhotoIndexes] = useState<Record<string, number>>({})

  const selectedStop = stops.find((stop) => stop.id === selectedId) ?? stops[0]
  const hoveredStop = stops.find((stop) => stop.id === hoveredId)
  const previewStop = hoveredStop ?? selectedStop
  const previewPhotos = getStopPhotos(previewStop)
  const selectedPhotos = getStopPhotos(selectedStop)
  const previewPhotoIndex = photoIndexes[previewStop.id] ?? 0
  const selectedPhotoIndex = photoIndexes[selectedStop.id] ?? 0
  const previewPhoto = previewPhotos[previewPhotoIndex] ?? previewPhotos[0]
  const selectedPhoto = selectedPhotos[selectedPhotoIndex] ?? selectedPhotos[0]
  const visibleStops =
    phaseFilter === 'all'
      ? stops
      : stops.filter((stop) => stop.phase === phaseFilter)

  function selectStop(stopId: string) {
    const scrollPosition = { left: window.scrollX, top: window.scrollY }
    setSelectedId(stopId)

    window.requestAnimationFrame(() => {
      window.scrollTo(scrollPosition)
    })
  }

  function changePhoto(stopId: string, direction: -1 | 1) {
    setPhotoIndexes((current) => {
      const stop = stopsById.get(stopId)
      if (!stop) {
        return current
      }

      const photoCount = getStopPhotos(stop).length
      const nextIndex =
        ((current[stopId] ?? 0) + direction + photoCount) % photoCount

      return {
        ...current,
        [stopId]: nextIndex,
      }
    })
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">12 al 28 de junio</p>
          <h1>Viaje Europa: Francia, Bélgica y España</h1>
          <p className="intro">
            Recorrido interactivo con ruta completa, fotos al posar el cursor y
            el itinerario interno de cada ciudad al seleccionarla.
          </p>
        </div>
        <div className="trip-stats" aria-label="Resumen del viaje">
          <span>
            <CalendarDays size={18} /> 17 días
          </span>
          <span>
            <MapPin size={18} /> {stops.length} paradas
          </span>
          <span>
            <Train size={18} /> tren, metro, ferry y auto
          </span>
        </div>
      </section>

      <section className="travel-notes" aria-label="Notas de transporte">
        {travelCards.map(({ title, body, icon: Icon }) => (
          <article className="travel-card" key={title}>
            <Icon aria-hidden="true" size={20} />
            <div>
              <h2>{title}</h2>
              <p>{body}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="workspace">
        <aside className="sidebar" aria-label="Lista de ciudades">
          <div className="sidebar-header">
            <div>
              <p className="eyebrow">Explorar</p>
              <h2>Paradas del viaje</h2>
            </div>
          </div>

          <div className="phase-filter" aria-label="Filtrar por fase">
            <button
              className={phaseFilter === 'all' ? 'active' : ''}
              onClick={() => setPhaseFilter('all')}
              type="button"
            >
              Todo
            </button>
            {Object.entries(phaseLabels).map(([phase, label]) => (
              <button
                className={phaseFilter === phase ? 'active' : ''}
                key={phase}
                onClick={() => setPhaseFilter(phase as Phase)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="stop-list">
            {visibleStops.map((stop) => (
              <button
                className={`stop-button ${
                  selectedStop.id === stop.id ? 'selected' : ''
                }`}
                key={stop.id}
                onClick={() => selectStop(stop.id)}
                onMouseEnter={() => setHoveredId(stop.id)}
                onMouseLeave={() => setHoveredId(null)}
                type="button"
              >
                <span
                  className="phase-dot"
                  style={{ backgroundColor: phaseColors[stop.phase] }}
                />
                <span className="stop-copy">
                  <strong>{stop.name}</strong>
                  <small>
                    {stop.dates} · {stop.country}
                  </small>
                </span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            ))}
          </div>
        </aside>

        <section className="map-stage" aria-label="Mapa del recorrido">
          <MapContainer
            center={[45.6, 2.3]}
            zoom={5}
            minZoom={4}
            keyboard={false}
            scrollWheelZoom
            className="travel-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline
              positions={route}
              pathOptions={{ color: '#1f2937', weight: 3, opacity: 0.5 }}
            />
            <Polyline
              positions={route}
              pathOptions={{
                color: '#f43f5e',
                weight: 6,
                opacity: 0.72,
                dashArray: '10 12',
              }}
            />

            {stops.map((stop) => (
              <CircleMarker
                center={stop.position}
                eventHandlers={{
                  click: () => selectStop(stop.id),
                  mouseout: () => setHoveredId(null),
                  mouseover: () => setHoveredId(stop.id),
                }}
                key={stop.id}
                pathOptions={{
                  color:
                    selectedStop.id === stop.id
                      ? '#111827'
                      : phaseColors[stop.phase],
                  fillColor: phaseColors[stop.phase],
                  fillOpacity: selectedStop.id === stop.id ? 0.95 : 0.76,
                  opacity: 1,
                  weight: selectedStop.id === stop.id ? 4 : 2,
                }}
                radius={selectedStop.id === stop.id ? 10 : 7}
              >
                <Tooltip direction="top" offset={[0, -8]}>
                  <strong>{stop.name}</strong>
                  <span>{stop.dates}</span>
                </Tooltip>
              </CircleMarker>
            ))}
            <MapFocusController stop={selectedStop} />
          </MapContainer>

          <div className="map-legend">
            {Object.entries(phaseLabels).map(([phase, label]) => (
              <span key={phase}>
                <i style={{ backgroundColor: phaseColors[phase as Phase] }} />
                {label}
              </span>
            ))}
          </div>

          {previewStop && (
            <article className="hover-preview">
              <div className="preview-photo-frame">
                <img alt={previewPhoto.alt} src={previewPhoto.url} />
                <div
                  aria-label={`Fotos de ${previewStop.name}`}
                  className="photo-switcher"
                >
                  <button
                    aria-label="Foto anterior"
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      changePhoto(previewStop.id, -1)
                    }}
                    type="button"
                  >
                    <ArrowLeft size={15} />
                  </button>
                  <span>
                    {previewPhotoIndex + 1}/{previewPhotos.length}
                  </span>
                  <button
                    aria-label="Foto siguiente"
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      changePhoto(previewStop.id, 1)
                    }}
                    type="button"
                  >
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
              <div className="preview-copy">
                <span>
                  <Camera size={15} /> Vista previa
                </span>
                <strong>{previewStop.name}</strong>
                <p>{previewStop.headline}</p>
              </div>
            </article>
          )}
        </section>

        <aside className="detail-panel" aria-label="Itinerario seleccionado">
          <img
            alt={`Foto de presentación de ${selectedStop.name}`}
            className="detail-photo"
            src={selectedPhoto.url}
          />
          <div className="detail-body">
            <p className="eyebrow">{phaseLabels[selectedStop.phase]}</p>
            <h2>{selectedStop.name}</h2>
            <div className="detail-meta">
              <span>
                <CalendarDays size={16} /> {selectedStop.dates}
              </span>
              <span>
                {selectedStop.transport === 'Auto' ? (
                  <Car size={16} />
                ) : (
                  <Train size={16} />
                )}{' '}
                {selectedStop.transport}
              </span>
            </div>
            <p className="headline">{selectedStop.headline}</p>

            <div className="highlight-grid">
              {selectedStop.highlights.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>

            <div className="timeline">
              <h3>
                <Clock3 size={18} /> Itinerario interno
              </h3>
              <ol>
                {selectedStop.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ol>
            </div>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default App
