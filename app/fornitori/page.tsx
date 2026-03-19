'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getT } from '@/lib/translations'
import LangToggle from '@/components/LangToggle'

const CATEGORIES_IT = ['Tutti', '📷 Fotografia', '🌸 Floral Design', '🍽️ Catering', '🎵 Musica', '🏛️ Location', '💌 Partecipazioni', '🎂 Torta']
const CATEGORIES_EN = ['All', '📷 Photography', '🌸 Floral Design', '🍽️ Catering', '🎵 Music', '🏛️ Venue', '💌 Stationery', '🎂 Cake']
const REGIONS = ['Tutte / All', 'Toscana', 'Langhe & Piemonte', 'Amalfi Coast', 'Lago di Como', 'Roma & Lazio', 'Venezia & Veneto', 'Puglia', 'Umbria']

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(`${city}, Italia`)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { 'User-Agent': 'VELOWedding/1.0' } }
    )
    const data = await res.json()
    if (data && data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
    return null
  } catch {
    return null
  }
}

export default function FornitoriPage() {
  const [vendors, setVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [locale, setLocale] = useState('it')
  const [activeRegion, setActiveRegion] = useState('Tutte')
  const [activeCategory, setActiveCategory] = useState('Tutti')
  const [citySearch, setCitySearch] = useState('')
  const [cityCoords, setCityCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [searchCity, setSearchCity] = useState('')

  useEffect(() => {
    const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
    if (match) {
      setLocale(match[1])
      setActiveRegion(match[1] === 'en' ? 'All' : 'Tutte')
      setActiveCategory(match[1] === 'en' ? 'All' : 'Tutti')
    } else if (navigator.language.startsWith('en')) {
      setLocale('en')
      setActiveRegion('All')
      setActiveCategory('All')
    }
  }, [])

  useEffect(() => {
    supabase.from('public_vendors').select('*')
      .order('featured', { ascending: false })
      .order('rating', { ascending: false })
      .then(({ data }) => {
        setVendors(data || [])
        setLoading(false)
      })
  }, [])

  const tr = getT(locale)
  const categories = locale === 'en' ? CATEGORIES_EN : CATEGORIES_IT
  const allLabel = locale === 'en' ? 'All' : 'Tutte'
  const allCatLabel = locale === 'en' ? 'All' : 'Tutti'

  const handleCitySearch = async () => {
    if (!citySearch.trim()) return
    const coords = await geocodeCity(citySearch.trim())
    setCityCoords(coords)
    setSearchCity(citySearch.trim())
  }

  const clearCitySearch = () => {
    setCitySearch('')
    setCityCoords(null)
    setSearchCity('')
  }
