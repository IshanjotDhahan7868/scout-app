import Link from 'next/link'
import { PROPERTY_INTELLIGENCE } from '@/lib/property-intelligence'

function Section({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <h2 className="text-sm font-semibold text-white mb-3">{title}</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="text-sm text-slate-300 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2">
            {item}
          </div>
        ))}
      </div>
    </section>
  )
}

export default function PropertyIntelligencePage() {
  return (
    <div className="p-4 space-y-4">
      <div className="pt-6">
        <p className="text-xs uppercase tracking-wide text-emerald-400">Property Intelligence</p>
        <h1 className="text-2xl font-bold mt-1">{PROPERTY_INTELLIGENCE.title}</h1>
        <p className="text-sm text-slate-400 mt-2">{PROPERTY_INTELLIGENCE.address}</p>
      </div>

      <section className="bg-slate-900 border border-emerald-500/20 rounded-2xl p-4">
        <div className="text-xs uppercase tracking-wide text-emerald-400">Canonical Identity</div>
        <div className="text-sm text-slate-300 mt-3">System ID: <span className="font-mono">{PROPERTY_INTELLIGENCE.canonicalId}</span></div>
        <div className="flex flex-wrap gap-2 mt-3">
          {PROPERTY_INTELLIGENCE.aliases.map((alias) => (
            <span key={alias} className="text-xs rounded-full border border-slate-700 px-3 py-1 text-slate-300">
              {alias}
            </span>
          ))}
        </div>
        <p className="text-sm text-slate-300 mt-4">{PROPERTY_INTELLIGENCE.propertyProfile.positioning}</p>
      </section>

      <Section title="Likely Assets" items={PROPERTY_INTELLIGENCE.likelyAssets} />
      <Section title="Model Rules" items={PROPERTY_INTELLIGENCE.modelRules} />
      <Section title="Compliance Signals" items={PROPERTY_INTELLIGENCE.complianceSignals} />
      <Section title="Highest ROI Work" items={PROPERTY_INTELLIGENCE.highestRoiWork} />
      <Section title="Phased Approach" items={PROPERTY_INTELLIGENCE.phases} />
      <Section title="Immediate Next Inputs" items={PROPERTY_INTELLIGENCE.immediateNextInputs} />

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Operating Frames</h2>
        <div className="space-y-3">
          {PROPERTY_INTELLIGENCE.operatingFrames.map((frame) => (
            <div key={frame.id} className="rounded-xl bg-slate-950 border border-slate-800 p-3">
              <div className="text-sm font-medium text-white">{frame.title}</div>
              <p className="text-xs text-slate-400 mt-2">{frame.priorities.join(' · ')}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Confidence Levels</h2>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_INTELLIGENCE.confidenceLevels.map((level) => (
            <span key={level} className="text-xs rounded-full border border-slate-700 px-3 py-1 text-slate-300">
              {level}
            </span>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Summary</h2>
        <p className="text-sm text-slate-300 leading-relaxed">{PROPERTY_INTELLIGENCE.finalSummary}</p>
      </section>

      <Link href="/property" className="block text-center bg-emerald-500 text-black font-semibold rounded-xl py-3">
        Back to property
      </Link>
    </div>
  )
}
