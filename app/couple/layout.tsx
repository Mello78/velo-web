import CoupleShell from '../../components/CoupleShell'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Area Coppie — VELO Wedding',
}

export default function CoupleLayout({ children }: { children: ReactNode }) {
  return <CoupleShell>{children}</CoupleShell>
}
