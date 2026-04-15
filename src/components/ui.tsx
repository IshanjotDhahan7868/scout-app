// Shared UI primitives using the earthy design system

export const card = "rounded-2xl px-4 py-3"
export const cardStyle = { background: '#241C14', border: '1px solid #3A2D20' }
export const inputStyle = {
  background: '#2E2318',
  border: '1px solid #3A2D20',
  color: '#F0E8D8',
  borderRadius: '14px',
  padding: '12px 16px',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
}
export const selectStyle = { ...inputStyle }
export const labelStyle = { color: '#8A7968', fontSize: '12px', fontWeight: 500 }
export const headingStyle = { color: '#F0E8D8' }
export const mutedStyle = { color: '#8A7968' }
export const goldStyle = { color: '#C4A265' }
export const btnPrimary = {
  background: 'linear-gradient(135deg, #2B5A3E, #3A7A54)',
  color: '#F0E8D8',
  border: 'none',
  borderRadius: '14px',
  padding: '14px 20px',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer',
  width: '100%',
}
export const btnGold = {
  background: 'linear-gradient(135deg, #7C5C3A, #A07848)',
  color: '#F0E8D8',
  border: 'none',
  borderRadius: '14px',
  padding: '14px 20px',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer',
  width: '100%',
}
export const pill = (active: boolean) => ({
  background: active ? 'rgba(196,162,101,0.15)' : '#2E2318',
  color: active ? '#C4A265' : '#8A7968',
  border: `1px solid ${active ? 'rgba(196,162,101,0.3)' : '#3A2D20'}`,
  borderRadius: '999px',
  padding: '6px 14px',
  fontSize: '12px',
  fontWeight: 500,
  cursor: 'pointer',
})

export const STATUS_DOT: Record<string, string> = {
  untouched: '#DC2626',
  in_progress: '#D97706',
  ready: '#2563EB',
  revenue: '#16A34A',
}

export const STATUS_LABEL: Record<string, string> = {
  untouched: 'Not started',
  in_progress: 'In progress',
  ready: 'Ready',
  revenue: 'Live',
}

export const PRIORITY_COLOR: Record<string, string> = {
  urgent: '#DC2626',
  high: '#EA580C',
  medium: '#D97706',
  low: '#8A7968',
}
