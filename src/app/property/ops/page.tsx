'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ComplianceCheck,
  ConfidenceLevel,
  GroundsZone,
  Hazard,
  MediaEvidence,
  Structure,
  supabase,
  Utility,
  WorkOrder,
} from '@/lib/supabase'
import { getFocusStructure } from '@/lib/focus'

const CONFIDENCE_LEVELS: ConfidenceLevel[] = [
  'verified_on_site',
  'verified_by_owner',
  'verified_from_listing',
  'public_reference_inference',
  'unknown',
]

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>
      {children}
    </section>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] uppercase tracking-wide border border-slate-700 rounded-full px-2 py-1 text-slate-400">{children}</span>
}

export default function PropertyOpsPage() {
  const [structure, setStructure] = useState<Structure | null>(null)
  const [zones, setZones] = useState<GroundsZone[]>([])
  const [utilities, setUtilities] = useState<Utility[]>([])
  const [hazards, setHazards] = useState<Hazard[]>([])
  const [checks, setChecks] = useState<ComplianceCheck[]>([])
  const [evidence, setEvidence] = useState<MediaEvidence[]>([])
  const [tasks, setTasks] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)

  const [zoneForm, setZoneForm] = useState({ name: '', type: 'outdoor_experience', notes: '', confidence_level: 'verified_by_owner' as ConfidenceLevel })
  const [utilityForm, setUtilityForm] = useState({ name: '', category: 'water', notes: '', confidence_level: 'unknown' as ConfidenceLevel })
  const [hazardForm, setHazardForm] = useState({ title: '', severity: 'high', notes: '', zone_id: '', confidence_level: 'verified_by_owner' as ConfidenceLevel })
  const [checkForm, setCheckForm] = useState({ title: '', category: 'fire_safety', notes: '', due_date: '', confidence_level: 'public_reference_inference' as ConfidenceLevel })
  const [evidenceForm, setEvidenceForm] = useState({ title: '', type: 'document', url: '', notes: '', zone_id: '', confidence_level: 'verified_from_listing' as ConfidenceLevel })

  useEffect(() => {
    supabase.from('structures').select('*').order('priority').then(({ data }) => {
      const focus = getFocusStructure(data || [])
      setStructure(focus)
    })
  }, [])

  useEffect(() => {
    if (!structure) return
    Promise.all([
      supabase.from('grounds_zones').select('*').eq('structure_id', structure.id).order('created_at'),
      supabase.from('utilities').select('*').eq('structure_id', structure.id).order('created_at'),
      supabase.from('hazards').select('*').eq('structure_id', structure.id).order('created_at'),
      supabase.from('compliance_checks').select('*').eq('structure_id', structure.id).order('created_at'),
      supabase.from('media_evidence').select('*').eq('structure_id', structure.id).order('created_at'),
      supabase.from('work_orders').select('*').eq('structure_id', structure.id).order('created_at'),
    ]).then(([zoneRows, utilityRows, hazardRows, checkRows, evidenceRows, taskRows]) => {
      setZones((zoneRows.data || []) as GroundsZone[])
      setUtilities((utilityRows.data || []) as Utility[])
      setHazards((hazardRows.data || []) as Hazard[])
      setChecks((checkRows.data || []) as ComplianceCheck[])
      setEvidence((evidenceRows.data || []) as MediaEvidence[])
      setTasks((taskRows.data || []) as WorkOrder[])
      setLoading(false)
    })
  }, [structure])

  const zoneNames = useMemo(() => Object.fromEntries(zones.map(zone => [zone.id, zone.name])), [zones])

  const addZone = async () => {
    if (!structure || !zoneForm.name.trim()) return
    const { data } = await supabase.from('grounds_zones').insert({
      structure_id: structure.id,
      name: zoneForm.name.trim(),
      type: zoneForm.type,
      notes: zoneForm.notes.trim() || null,
      confidence_level: zoneForm.confidence_level,
      status: 'candidate',
      condition: 'unknown',
    }).select().single()
    if (data) setZones(prev => [...prev, data as GroundsZone])
    setZoneForm({ name: '', type: 'outdoor_experience', notes: '', confidence_level: 'verified_by_owner' })
  }

  const addUtility = async () => {
    if (!structure || !utilityForm.name.trim()) return
    const { data } = await supabase.from('utilities').insert({
      structure_id: structure.id,
      name: utilityForm.name.trim(),
      category: utilityForm.category,
      notes: utilityForm.notes.trim() || null,
      confidence_level: utilityForm.confidence_level,
    }).select().single()
    if (data) setUtilities(prev => [...prev, data as Utility])
    setUtilityForm({ name: '', category: 'water', notes: '', confidence_level: 'unknown' })
  }

  const addHazard = async () => {
    if (!structure || !hazardForm.title.trim()) return
    const { data } = await supabase.from('hazards').insert({
      structure_id: structure.id,
      zone_id: hazardForm.zone_id || null,
      title: hazardForm.title.trim(),
      severity: hazardForm.severity,
      notes: hazardForm.notes.trim() || null,
      confidence_level: hazardForm.confidence_level,
    }).select().single()
    if (data) setHazards(prev => [...prev, data as Hazard])
    setHazardForm({ title: '', severity: 'high', notes: '', zone_id: '', confidence_level: 'verified_by_owner' })
  }

  const addCheck = async () => {
    if (!structure || !checkForm.title.trim()) return
    const { data } = await supabase.from('compliance_checks').insert({
      structure_id: structure.id,
      title: checkForm.title.trim(),
      category: checkForm.category,
      notes: checkForm.notes.trim() || null,
      due_date: checkForm.due_date || null,
      confidence_level: checkForm.confidence_level,
    }).select().single()
    if (data) setChecks(prev => [...prev, data as ComplianceCheck])
    setCheckForm({ title: '', category: 'fire_safety', notes: '', due_date: '', confidence_level: 'public_reference_inference' })
  }

  const addEvidence = async () => {
    if (!structure || !evidenceForm.title.trim()) return
    const { data } = await supabase.from('media_evidence').insert({
      structure_id: structure.id,
      zone_id: evidenceForm.zone_id || null,
      title: evidenceForm.title.trim(),
      type: evidenceForm.type,
      url: evidenceForm.url.trim() || null,
      notes: evidenceForm.notes.trim() || null,
      confidence_level: evidenceForm.confidence_level,
    }).select().single()
    if (data) setEvidence(prev => [...prev, data as MediaEvidence])
    setEvidenceForm({ title: '', type: 'document', url: '', notes: '', zone_id: '', confidence_level: 'verified_from_listing' })
  }

  const updateZone = async (zone: GroundsZone, patch: Partial<GroundsZone>) => {
    await supabase.from('grounds_zones').update(patch).eq('id', zone.id)
    setZones(prev => prev.map(item => item.id === zone.id ? { ...item, ...patch } : item))
  }

  const updateUtility = async (utility: Utility, patch: Partial<Utility>) => {
    await supabase.from('utilities').update(patch).eq('id', utility.id)
    setUtilities(prev => prev.map(item => item.id === utility.id ? { ...item, ...patch } : item))
  }

  const updateHazard = async (hazard: Hazard, patch: Partial<Hazard>) => {
    await supabase.from('hazards').update(patch).eq('id', hazard.id)
    setHazards(prev => prev.map(item => item.id === hazard.id ? { ...item, ...patch } : item))
  }

  const updateCheck = async (check: ComplianceCheck, patch: Partial<ComplianceCheck>) => {
    await supabase.from('compliance_checks').update(patch).eq('id', check.id)
    setChecks(prev => prev.map(item => item.id === check.id ? { ...item, ...patch } : item))
  }

  const updateTask = async (task: WorkOrder, patch: Partial<WorkOrder>) => {
    await supabase.from('work_orders').update(patch).eq('id', task.id)
    setTasks(prev => prev.map(item => item.id === task.id ? { ...item, ...patch } : item))
  }

  if (loading || !structure) return <div className="p-6 text-slate-500">Loading...</div>

  return (
    <div className="p-4 space-y-4">
      <div className="pt-6">
        <p className="text-xs uppercase tracking-wide text-emerald-400">Farmhouse Ops</p>
        <h1 className="text-2xl font-bold mt-1">{structure.name}</h1>
        <p className="text-sm text-slate-400 mt-2">
          One launch-control surface for zones, hazards, utilities, compliance, evidence, and task intent.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-xl font-bold">{zones.length}</div>
          <div className="text-xs text-slate-500">Zones</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-xl font-bold">{hazards.filter(hazard => hazard.status !== 'closed').length}</div>
          <div className="text-xs text-slate-500">Open hazards</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-xl font-bold">{checks.filter(check => check.status !== 'pass').length}</div>
          <div className="text-xs text-slate-500">Open checks</div>
        </div>
      </div>

      <Section title="Grounds Zones" description="Define guest-facing and support zones instead of leaving the site as one vague property object.">
        <div className="space-y-3">
          {zones.map(zone => (
            <div key={zone.id} className="rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-medium">{zone.name}</div>
                  <div className="flex gap-2 mt-1">
                    <Badge>{zone.type}</Badge>
                    <Badge>{zone.confidence_level}</Badge>
                  </div>
                </div>
                <label className="text-xs text-slate-500">
                  Status
                  <select value={zone.status} onChange={e => updateZone(zone, { status: e.target.value as GroundsZone['status'], activated: e.target.value === 'active' })} className="mt-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs outline-none">
                    {['inactive', 'candidate', 'active', 'blocked'].map(value => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-slate-500">
                  Condition
                  <select value={zone.condition} onChange={e => updateZone(zone, { condition: e.target.value as GroundsZone['condition'] })} className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs outline-none">
                    {['excellent', 'good', 'fair', 'rough', 'unsafe', 'unknown'].map(value => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
                <label className="text-xs text-slate-500">
                  Activated
                  <select value={zone.activated ? 'yes' : 'no'} onChange={e => updateZone(zone, { activated: e.target.value === 'yes' })} className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs outline-none">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </label>
              </div>
              {zone.notes && <p className="text-xs text-slate-400">{zone.notes}</p>}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input value={zoneForm.name} onChange={e => setZoneForm(prev => ({ ...prev, name: e.target.value }))} placeholder="New zone name" className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none placeholder:text-slate-600" />
          <select value={zoneForm.type} onChange={e => setZoneForm(prev => ({ ...prev, type: e.target.value }))} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
            {['arrival', 'outdoor_experience', 'trail', 'parking', 'service', 'storage', 'recreation', 'pool', 'boundary', 'other'].map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
        <textarea value={zoneForm.notes} onChange={e => setZoneForm(prev => ({ ...prev, notes: e.target.value }))} rows={2} placeholder="Why this zone matters" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none resize-none placeholder:text-slate-600" />
        <div className="flex gap-2">
          <select value={zoneForm.confidence_level} onChange={e => setZoneForm(prev => ({ ...prev, confidence_level: e.target.value as ConfidenceLevel }))} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
            {CONFIDENCE_LEVELS.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
          <button onClick={addZone} className="bg-emerald-500 text-black font-semibold rounded-xl px-4 py-3 text-sm">Add zone</button>
        </div>
      </Section>

      <Section title="Utilities" description="Track water, septic, heat, power, and other systems per structure instead of burying them in notes.">
        <div className="space-y-3">
          {utilities.map(utility => (
            <div key={utility.id} className="rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-medium">{utility.name}</div>
                  <div className="flex gap-2 mt-1">
                    <Badge>{utility.category}</Badge>
                    <Badge>{utility.confidence_level}</Badge>
                  </div>
                </div>
                <select value={utility.status} onChange={e => updateUtility(utility, { status: e.target.value as Utility['status'] })} className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs outline-none">
                  {['working', 'partial', 'offline', 'unknown', 'needs_review'].map(value => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              {utility.notes && <p className="text-xs text-slate-400">{utility.notes}</p>}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input value={utilityForm.name} onChange={e => setUtilityForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Utility name" className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none placeholder:text-slate-600" />
          <select value={utilityForm.category} onChange={e => setUtilityForm(prev => ({ ...prev, category: e.target.value }))} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
            {['power', 'water', 'septic', 'heat', 'internet', 'lighting', 'security', 'other'].map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
        <textarea value={utilityForm.notes} onChange={e => setUtilityForm(prev => ({ ...prev, notes: e.target.value }))} rows={2} placeholder="What needs to be verified or fixed?" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none resize-none placeholder:text-slate-600" />
        <div className="flex gap-2">
          <select value={utilityForm.confidence_level} onChange={e => setUtilityForm(prev => ({ ...prev, confidence_level: e.target.value as ConfidenceLevel }))} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
            {CONFIDENCE_LEVELS.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
          <button onClick={addUtility} className="bg-emerald-500 text-black font-semibold rounded-xl px-4 py-3 text-sm">Add utility</button>
        </div>
      </Section>

      <Section title="Hazards" description="Make blocking issues explicit so guest readiness and sale readiness are not based on vague memory.">
        <div className="space-y-3">
          {hazards.map(hazard => (
            <div key={hazard.id} className="rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-medium">{hazard.title}</div>
                  <div className="flex gap-2 mt-1">
                    <Badge>{hazard.severity}</Badge>
                    <Badge>{hazard.zone_id ? zoneNames[hazard.zone_id] || 'linked zone' : 'structure-wide'}</Badge>
                  </div>
                </div>
                <select value={hazard.status} onChange={e => updateHazard(hazard, { status: e.target.value as Hazard['status'] })} className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs outline-none">
                  {['open', 'monitoring', 'mitigated', 'closed'].map(value => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              {hazard.notes && <p className="text-xs text-slate-400">{hazard.notes}</p>}
            </div>
          ))}
        </div>
        <input value={hazardForm.title} onChange={e => setHazardForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Hazard title" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none placeholder:text-slate-600" />
        <div className="grid grid-cols-2 gap-2">
          <select value={hazardForm.severity} onChange={e => setHazardForm(prev => ({ ...prev, severity: e.target.value }))} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
            {['low', 'medium', 'high', 'critical'].map(value => <option key={value} value={value}>{value}</option>)}
          </select>
          <select value={hazardForm.zone_id} onChange={e => setHazardForm(prev => ({ ...prev, zone_id: e.target.value }))} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
            <option value="">Structure-wide</option>
            {zones.map(zone => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
          </select>
        </div>
        <textarea value={hazardForm.notes} onChange={e => setHazardForm(prev => ({ ...prev, notes: e.target.value }))} rows={2} placeholder="Why this blocks readiness" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none resize-none placeholder:text-slate-600" />
        <div className="flex gap-2">
          <select value={hazardForm.confidence_level} onChange={e => setHazardForm(prev => ({ ...prev, confidence_level: e.target.value as ConfidenceLevel }))} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
            {CONFIDENCE_LEVELS.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
          <button onClick={addHazard} className="bg-emerald-500 text-black font-semibold rounded-xl px-4 py-3 text-sm">Add hazard</button>
        </div>
      </Section>

      <Section title="Compliance Checks" description="Track zoning, fire safety, permit-sensitive work, and listing accuracy as explicit gates.">
        <div className="space-y-3">
          {checks.map(check => (
            <div key={check.id} className="rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-medium">{check.title}</div>
                  <div className="flex gap-2 mt-1">
                    <Badge>{check.category}</Badge>
                    <Badge>{check.confidence_level}</Badge>
                  </div>
                </div>
                <select value={check.status} onChange={e => updateCheck(check, { status: e.target.value as ComplianceCheck['status'] })} className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs outline-none">
                  {['unknown', 'not_started', 'in_progress', 'review_needed', 'pass', 'fail'].map(value => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              {check.notes && <p className="text-xs text-slate-400">{check.notes}</p>}
              {check.due_date && <p className="text-xs text-slate-500">Due {check.due_date}</p>}
            </div>
          ))}
        </div>
        <input value={checkForm.title} onChange={e => setCheckForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Compliance check title" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none placeholder:text-slate-600" />
        <div className="grid grid-cols-2 gap-2">
          <select value={checkForm.category} onChange={e => setCheckForm(prev => ({ ...prev, category: e.target.value }))} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
            {['zoning', 'fire_safety', 'building', 'septic', 'water', 'insurance', 'tax', 'burn_permit', 'listing_accuracy', 'other'].map(value => <option key={value} value={value}>{value}</option>)}
          </select>
          <input value={checkForm.due_date} onChange={e => setCheckForm(prev => ({ ...prev, due_date: e.target.value }))} type="date" className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none" />
        </div>
        <textarea value={checkForm.notes} onChange={e => setCheckForm(prev => ({ ...prev, notes: e.target.value }))} rows={2} placeholder="What needs review, proof, or approval?" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none resize-none placeholder:text-slate-600" />
        <div className="flex gap-2">
          <select value={checkForm.confidence_level} onChange={e => setCheckForm(prev => ({ ...prev, confidence_level: e.target.value as ConfidenceLevel }))} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
            {CONFIDENCE_LEVELS.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
          <button onClick={addCheck} className="bg-emerald-500 text-black font-semibold rounded-xl px-4 py-3 text-sm">Add check</button>
        </div>
      </Section>

      <Section title="Media Evidence" description="Store proof, listing photos, walkthroughs, and source material for claims made by the app or LLM.">
        <div className="space-y-3">
          {evidence.map(item => (
            <div key={item.id} className="rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="flex gap-2 mt-1">
                    <Badge>{item.type}</Badge>
                    <Badge>{item.confidence_level}</Badge>
                  </div>
                </div>
                {item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400">Open</a> : <span className="text-xs text-slate-600">No URL</span>}
              </div>
              {item.notes && <p className="text-xs text-slate-400">{item.notes}</p>}
              {item.zone_id && <p className="text-xs text-slate-500">Zone: {zoneNames[item.zone_id] || 'linked zone'}</p>}
            </div>
          ))}
        </div>
        <input value={evidenceForm.title} onChange={e => setEvidenceForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Evidence title" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none placeholder:text-slate-600" />
        <div className="grid grid-cols-2 gap-2">
          <select value={evidenceForm.type} onChange={e => setEvidenceForm(prev => ({ ...prev, type: e.target.value }))} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
            {['listing_photo', 'walkthrough_video', 'site_photo', 'document', 'map', 'note', 'other'].map(value => <option key={value} value={value}>{value}</option>)}
          </select>
          <select value={evidenceForm.zone_id} onChange={e => setEvidenceForm(prev => ({ ...prev, zone_id: e.target.value }))} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
            <option value="">General</option>
            {zones.map(zone => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
          </select>
        </div>
        <input value={evidenceForm.url} onChange={e => setEvidenceForm(prev => ({ ...prev, url: e.target.value }))} placeholder="URL or source link" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none placeholder:text-slate-600" />
        <textarea value={evidenceForm.notes} onChange={e => setEvidenceForm(prev => ({ ...prev, notes: e.target.value }))} rows={2} placeholder="Why this evidence matters" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none resize-none placeholder:text-slate-600" />
        <div className="flex gap-2">
          <select value={evidenceForm.confidence_level} onChange={e => setEvidenceForm(prev => ({ ...prev, confidence_level: e.target.value as ConfidenceLevel }))} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-sm outline-none">
            {CONFIDENCE_LEVELS.map(value => <option key={value} value={value}>{value}</option>)}
          </select>
          <button onClick={addEvidence} className="bg-emerald-500 text-black font-semibold rounded-xl px-4 py-3 text-sm">Add evidence</button>
        </div>
      </Section>

      <Section title="Task Intent Tags" description="Mark each task by whether it helps sale readiness, guest readiness, or both.">
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="rounded-xl bg-slate-950 border border-slate-800 p-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/orders/${task.id}`} className="text-sm font-medium hover:text-emerald-400">{task.title}</Link>
                <div className="flex gap-2 mt-1">
                  <Badge>{task.priority}</Badge>
                  <Badge>{task.status}</Badge>
                  {task.zone_id && <Badge>{zoneNames[task.zone_id] || 'linked zone'}</Badge>}
                </div>
              </div>
              <div className="w-40 shrink-0 space-y-2">
                <select value={task.benefit_tag} onChange={e => updateTask(task, { benefit_tag: e.target.value as WorkOrder['benefit_tag'] })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs outline-none">
                  {['sale_helpful', 'guest_helpful', 'both'].map(value => <option key={value} value={value}>{value}</option>)}
                </select>
                <select value={task.confidence_level} onChange={e => updateTask(task, { confidence_level: e.target.value as ConfidenceLevel })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs outline-none">
                  {CONFIDENCE_LEVELS.map(value => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="flex gap-2">
        <Link href="/property" className="flex-1 text-center bg-slate-900 border border-slate-800 rounded-xl py-3 text-sm font-medium">
          Back to property
        </Link>
        <Link href="/property/intelligence" className="flex-1 text-center bg-emerald-500 text-black rounded-xl py-3 text-sm font-semibold">
          Intelligence pack
        </Link>
      </div>
    </div>
  )
}
