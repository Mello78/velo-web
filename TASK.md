# TASK — Funzionalità da completare

> Prima leggi CONTEXT.md. Esegui i task nell'ordine indicato.

---

## TASK 1 — Navbar responsiva su tutte le pagine del sito

NavBar.tsx e SimpleNav.tsx esistono già in components/.
Vanno applicati alle pagine che usano ancora la navbar inline.

### fornitori/page.tsx
Aggiungere in cima: `'use client'` (servirà anche per TASK 3)
Sostituire la navbar inline con:
```tsx
import SimpleNav from '@/components/SimpleNav'
<SimpleNav locale={locale} backHref="/" backLabel="<- VELO"
  rightLabel={tr.nav.forVendors} rightHref="/vendor" />
```

### fornitori/[id]/page.tsx
```tsx
import SimpleNav from '@/components/SimpleNav'
<SimpleNav locale={locale} backHref="/fornitori" backLabel={tr.vendorDetail.back} />
```

### vendor/page.tsx
Nella VendorDashboard sostituire la navbar con SimpleNav.
Nella pagina login aggiungere SimpleNav senza backHref (solo logo + LangToggle).

```
git add -A && git commit -m "responsive-navbar-all-pages" && git push origin main
```

---

## TASK 2 — Geocoding automatico vendor

Quando un vendor salva la città, le coordinate lat/lng vengono salvate nel DB.

### Crea C:\Users\mello\VeloWedding\lib\geocoding.ts

```typescript
export function haversineKm(
  lat1: number, lng1: number, lat2: number, lng2: number
): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export async function geocodeCity(
  city: string, province?: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const q = encodeURIComponent(
      province ? `${city}, ${province}, Italia` : `${city}, Italia`
    )
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { 'User-Agent': 'VELOWedding/1.0' } }
    )
    const data = await res.json()
    if (data?.[0]) return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    }
    return null
  } catch { return null }
}
```

### app/vendor/onboarding.tsx

Importare: `import { geocodeCity } from '../../lib/geocoding'`

Prima dell'insert su vendor_accounts aggiungere:
```typescript
const coords = await geocodeCity(vendorCity)
// aggiungere al payload: lat: coords?.lat ?? null, lng: coords?.lng ?? null
```

### velo-web-temp/app/vendor/page.tsx

Aggiungere funzione standalone geocodeCity (stessa logica, senza import).
Nella funzione save() prima dell'update Supabase:
```typescript
if (vendor.location) {
  const coords = await geocodeCity(vendor.location)
  if (coords) { payload.lat = coords.lat; payload.lng = coords.lng }
}
```

```
git add -A && git commit -m "geocoding-automatico-vendor" && git push origin main
```

---

## TASK 3 — Ricerca vendor per distanza nel sito web

NOTA: fornitori/page.tsx deve essere 'use client' (fatto nel TASK 1).

### Aggiungere stati

```typescript
const [vendors, setVendors] = useState<any[]>([])
const [cityInput, setCityInput] = useState('')
const [citySearch, setCitySearch] = useState('')
const [searchCoords, setSearchCoords] = useState<{lat:number;lng:number}|null>(null)
const [searching, setSearching] = useState(false)
```

### Fetch vendor lato client

```typescript
useEffect(() => {
  supabase.from('public_vendors').select('*')
    .order('featured', { ascending: false })
    .order('rating', { ascending: false })
    .then(({ data }) => { if (data) setVendors(data) })
}, [])
```

### Funzioni nel file

```typescript
function haversineKm(lat1:number,lng1:number,lat2:number,lng2:number):number {
  const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLng=(lng2-lng1)*Math.PI/180
  const a=Math.sin(dLat/2)**2+
    Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
}

async function geocodeCity(city:string):Promise<{lat:number;lng:number}|null> {
  try {
    const q=encodeURIComponent(`${city}, Italia`)
    const res=await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      {headers:{'User-Agent':'VELOWedding/1.0'}}
    )
    const data=await res.json()
    if(data?.[0]) return{lat:parseFloat(data[0].lat),lng:parseFloat(data[0].lon)}
    return null
  } catch{return null}
}

const handleCitySearch = async () => {
  if (!cityInput.trim()) return
  setSearching(true)
  const coords = await geocodeCity(cityInput.trim())
  setSearchCoords(coords)
  setCitySearch(cityInput.trim())
  setSearching(false)
}
```

### Campo ricerca città (sopra i filtri)

```tsx
<div className="mb-6">
  <div className="flex gap-2">
    <input type="text" value={cityInput}
      onChange={e=>setCityInput(e.target.value)}
      onKeyDown={e=>e.key==='Enter'&&handleCitySearch()}
      placeholder={locale==='en'
        ?'Search near a city...'
        :'Cerca vicino a una città...'}
      className="flex-1 bg-dark border border-border rounded-2xl px-5 py-3.5
        text-cream placeholder-muted focus:outline-none focus:border-gold text-sm" />
    <button onClick={handleCitySearch}
      disabled={searching||!cityInput.trim()}
      className="bg-gold text-bg font-semibold px-5 py-3.5 rounded-2xl
        hover:opacity-90 disabled:opacity-40 text-sm whitespace-nowrap">
      {searching?'...':(locale==='en'?'Search':'Cerca')}
    </button>
  </div>
  {citySearch && (
    <div className="flex items-center gap-2 mt-2 px-1">
      <span className="text-muted text-xs">
        📍 {locale==='en'
          ?`Results near ${citySearch}`
          :`Risultati vicino a ${citySearch}`}
      </span>
      <button
        onClick={()=>{setCityInput('');setCitySearch('');setSearchCoords(null)}}
        className="text-gold text-xs hover:opacity-70">✕</button>
    </div>
  )}
</div>
```

### Ordinamento per distanza

Nel calcolo dei vendor filtrati, dopo i filtri esistenti:
```typescript
if (searchCoords) {
  sorted = sorted.map(v => ({
    ...v,
    _distKm: (v.lat && v.lng)
      ? haversineKm(searchCoords.lat, searchCoords.lng, v.lat, v.lng)
      : 9999
  })).sort((a:any, b:any) => a._distKm - b._distKm)
}
```

### Badge distanza sulle card

```tsx
{(v as any)._distKm && (v as any)._distKm < 9999 && (
  <span className="text-xs text-muted border border-border rounded-full px-2 py-0.5">
    📍 {Math.round((v as any)._distKm)} km
  </span>
)}
```

```
git add -A && git commit -m "ricerca-per-distanza-sito" && git push origin main
```

---

## TASK 4 — Ricerca per distanza nell'app mobile

**File:** C:\Users\mello\VeloWedding\app\(tabs)\vendors.tsx

### Importare

```typescript
import { geocodeCity, haversineKm } from '../../lib/geocoding'
import { cercaComuni } from '../../lib/data/comuni'
```

### Aggiungere stati

```typescript
const [citySearch, setCitySearch] = useState('')
const [cityCoords, setCityCoords] = useState<{lat:number;lng:number}|null>(null)
const [cityDropdown, setCityDropdown] = useState<any[]>([])
```

### Campo cerca città (sopra i filtri nel tab discover)

```tsx
<View style={{margin:16, marginBottom:0}}>
  <TextInput style={styles.searchInput}
    placeholder="Cerca vicino a una città..."
    placeholderTextColor="#5A5040"
    value={citySearch}
    onChangeText={v=>{
      setCitySearch(v)
      setCityDropdown(cercaComuni(v))
    }} />
  {cityDropdown.length > 0 && (
    <View style={styles.suggestBox}>
      {cityDropdown.map((c, i) => (
        <TouchableOpacity key={i} style={styles.suggestItem}
          onPress={async () => {
            setCitySearch(c.nome)
            setCityDropdown([])
            const coords = await geocodeCity(c.nome, c.provincia)
            setCityCoords(coords)
          }}>
          <Text style={styles.suggestNome}>{c.nome}</Text>
          <Text style={styles.suggestProv}>{c.provincia} · {c.regione}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )}
  {cityCoords && (
    <TouchableOpacity
      onPress={() => { setCityCoords(null); setCitySearch('') }}>
      <Text style={{color:'#C9A84C',fontSize:11,marginTop:6}}>
        📍 {citySearch} · ✕ Rimuovi
      </Text>
    </TouchableOpacity>
  )}
</View>
```

### Ordinamento per distanza

Dopo i filtri esistenti in filteredPublic:
```typescript
if (cityCoords) {
  result = result.map((v: any) => ({
    ...v,
    _distKm: (v.lat && v.lng)
      ? haversineKm(cityCoords.lat, cityCoords.lng, v.lat, v.lng)
      : 9999
  })).sort((a: any, b: any) => a._distKm - b._distKm)
}
```

### Badge distanza sulle card

Sotto il nome vendor:
```tsx
{(v as any)._distKm && (v as any)._distKm < 500 && (
  <Text style={{fontSize:11, color:'#8A7E6A'}}>
    📍 {Math.round((v as any)._distKm)} km
  </Text>
)}
```

*(Nessun commit per l'app — Mello ricarica su Expo Go)*

---

## Stato attuale (marzo 2026)

### Completato
- Google OAuth configurato su Supabase ✅
- Bottone Google (e Apple su iOS) gia' presenti in auth.tsx ✅
- Coordinate lat/lng aggiunte al DB ✅
- 24 vendor esistenti con coordinate popolate ✅
- Navbar responsiva su home page ✅
- Traduzione IT/EN completa sito ✅
- Autocomplete comuni nell'onboarding ✅

### Da fare (questi task)
- TASK 1: Navbar responsiva su fornitori, dettaglio, vendor
- TASK 2: Geocoding automatico al salvataggio profilo vendor
- TASK 3: Campo ricerca citta' + distanza nel sito
- TASK 4: Campo ricerca citta' + distanza nell'app

### In attesa di Mello
- Immagini Vision (da scegliere insieme)
- Test onboarding completo su Expo Go
- Prima build TestFlight (Apple Developer $99)
