'use client'

import Image from 'next/image'
import { useWizardStore } from '@/lib/wizard-store'
import { STEP_LABELS } from '@/types/wizard'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export function StepNav() {
  const { currentStep, goToStep } = useWizardStore()
  const total = STEP_LABELS.length
  const progress = ((currentStep + 1) / total) * 100

  return (
    <nav className="flex h-full flex-col border-r bg-muted/10 px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Image
            src="/align-icon.svg"
            alt=""
            width={28}
            height={28}
            className="shrink-0 rounded-md"
            aria-hidden="true"
          />
          <h1 className="text-base font-bold leading-tight">AlignDev</h1>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Build with AI. Ship with standards.</p>
      </div>

      <div className="mb-6">
        <Progress value={progress} className="h-1.5" />
        <p className="mt-1.5 text-xs text-muted-foreground">
          {currentStep + 1} / {total}
        </p>
      </div>

      <ol className="flex flex-col gap-1">
        {STEP_LABELS.map((label, idx) => {
          const isCompleted = idx < currentStep
          const isActive = idx === currentStep

          return (
            <li key={idx}>
              <button
                type="button"
                onClick={() => goToStep(idx)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors cursor-pointer',
                  isActive && 'bg-primary/10 text-primary font-medium',
                  isCompleted && 'text-foreground hover:bg-muted',
                  !isActive && !isCompleted && 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors',
                    isActive && 'bg-primary text-primary-foreground',
                    isCompleted && 'bg-primary/20 text-primary',
                    !isActive && !isCompleted && 'bg-muted text-muted-foreground',
                  )}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                </span>
                <span className="leading-tight">{label}</span>
              </button>
            </li>
          )
        })}
      </ol>

      <div className="mt-auto space-y-3 pt-6 border-t">
        <a
          href="https://github.com/razr001/aligndev"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            aria-hidden="true"
            fill="currentColor"
          >
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.01c-3.2.7-3.88-1.38-3.88-1.38-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18A11.1 11.1 0 0 1 12 6.16c.98 0 1.96.13 2.88.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.82 1.19 3.08 0 4.42-2.7 5.4-5.27 5.68.42.36.78 1.06.78 2.14v3.04c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
          </svg>
          GitHub
        </a>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Once every category is selected, click &ldquo;Generate Standards&rdquo; to get the full document and a SKILL.md.
        </p>
      </div>
    </nav>
  )
}
