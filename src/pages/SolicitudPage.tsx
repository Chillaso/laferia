import { useState, type ReactNode } from 'react'
import { Controller, useForm, useWatch, type Control } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { Check, CircleCheck, Loader2, MapPin, Sparkles, Tent } from 'lucide-react'
import { FileDropzone, MAX_FILE_BYTES } from '@/components/form/FileDropzone'
import { Button } from '@/components/ui/button'
import { buttonClasses } from '@/components/ui/buttonClasses'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input, Textarea } from '@/components/ui/input'
import { StatusBadge } from '@/components/ui/badge'
import { Toldo } from '@/components/ui/toldo'
import { isValidCif, normalizeCif } from '@/lib/cif'
import { cn } from '@/lib/utils'
import { casetaRepository } from '@/services/casetaService'
import type { SubmissionResult } from '@/types/caseta'

const FORM_ID = 'solicitud-caseta'
const DESCRIPTION_MIN = 20
const DESCRIPTION_MAX = 600

const pdfFile = (label: string) =>
  z
    .custom<File | undefined>()
    .refine((f): f is File => f instanceof File, `Adjunta el documento de ${label}`)
    .refine((f) => !f || f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'), 'El archivo debe ser PDF')
    .refine((f) => !f || f.size <= MAX_FILE_BYTES, 'El archivo supera los 10 MB')

const schema = z.object({
  name: z.string().trim().min(3, 'Indica el nombre de la caseta (mín. 3 caracteres)').max(80),
  cif: z
    .string()
    .trim()
    .min(1, 'El CIF es obligatorio')
    .refine(isValidCif, 'CIF no válido. Debe ser letra, 7 dígitos y control, p. ej. G11234564'),
  description: z
    .string()
    .trim()
    .min(DESCRIPTION_MIN, `Describe la caseta con al menos ${DESCRIPTION_MIN} caracteres`)
    .max(DESCRIPTION_MAX, `Máximo ${DESCRIPTION_MAX} caracteres`),
  traditional: z.boolean({ error: 'Indica el tipo de caseta' }),
  estatutos: pdfFile('Estatutos'),
  memoria: pdfFile('Memoria'),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

const TYPE_OPTIONS = [
  {
    value: true,
    title: 'Tradicional',
    description: 'Toldo a rayas, farolillos y ambiente de feria clásico.',
    icon: Tent,
  },
  {
    value: false,
    title: 'No tradicional',
    description: 'Formato libre: temática, comercial u otra ambientación.',
    icon: Sparkles,
  },
]

export function SolicitudPage() {
  const [result, setResult] = useState<SubmissionResult>()
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', cif: '', description: '', traditional: undefined },
  })

  const descriptionLength = useWatch({ control, name: 'description' })?.length ?? 0
  const cifField = register('cif')

  const onSubmit = async (data: FormOutput) => {
    try {
      const submitted = await casetaRepository.submit({ ...data, cif: normalizeCif(data.cif) })
      setResult(submitted)
      toast.success('Solicitud enviada')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No se pudo enviar la solicitud. Inténtalo de nuevo.')
    }
  }

  if (result) {
    return (
      <SubmissionSuccess
        result={result}
        onNew={() => {
          reset()
          setResult(undefined)
        }}
      />
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="max-w-2xl">
        <h1 className="font-cartel text-4xl leading-[1.05] font-extrabold text-tinta sm:text-5xl">
          Solicitud de caseta
        </h1>
        <p className="mt-3 text-[17px] leading-relaxed text-tinta-2">
          Registra tu entidad para montar caseta en el Real de la Feria 2027 y adjunta los Estatutos y la
          Memoria. Los técnicos municipales revisarán la documentación.
        </p>
      </div>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Card className="divide-y divide-linea">
            <FormSection step={1} title="Entidad" description="Datos de la asociación, peña o hermandad titular.">
              <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_12rem]">
                <Field id="name" label="Nombre de la caseta" required error={errors.name?.message}>
                  <Input
                    id="name"
                    placeholder="Peña Flamenca El Albero"
                    autoComplete="organization"
                    aria-invalid={Boolean(errors.name)}
                    {...register('name')}
                  />
                </Field>
                <Field id="cif" label="CIF" required error={errors.cif?.message} hint="Letra, 7 dígitos y control">
                  <Input
                    id="cif"
                    placeholder="G11234564"
                    className="tabular tracking-wide uppercase"
                    maxLength={11}
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={Boolean(errors.cif)}
                    {...cifField}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase()
                      return cifField.onChange(e)
                    }}
                  />
                </Field>
              </div>
              <Field
                id="description"
                label="Descripción"
                required
                error={errors.description?.message}
                hint={
                  <span className="flex justify-between gap-4">
                    <span>Ambiente, actividades y público al que se dirige.</span>
                    <span className="tabular shrink-0">
                      {descriptionLength}/{DESCRIPTION_MAX}
                    </span>
                  </span>
                }
              >
                <Textarea
                  id="description"
                  maxLength={DESCRIPTION_MAX}
                  placeholder="Caseta familiar con cocina tradicional y actuaciones de flamenco en directo."
                  aria-invalid={Boolean(errors.description)}
                  {...register('description')}
                />
              </Field>
            </FormSection>

            <FormSection step={2} title="Tipo de caseta" description="Determina las normas de decoración que se aplicarán.">
              <Controller
                control={control}
                name="traditional"
                render={({ field }) => (
                  <div role="radiogroup" aria-label="Tipo de caseta" className="grid gap-3 sm:grid-cols-2">
                    {TYPE_OPTIONS.map(({ value, title, description, icon: Icon }) => {
                      const checked = field.value === value
                      return (
                        <label
                          key={title}
                          className={cn(
                            'relative flex cursor-pointer gap-3 rounded-control border p-4 transition-[border-color,background-color,box-shadow] duration-150',
                            'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-anil-600',
                            checked
                              ? 'border-anil-600 bg-anil-50 shadow-[0_0_0_1px_var(--color-anil-600)]'
                              : errors.traditional
                                ? 'border-status-error bg-white'
                                : 'border-linea bg-white hover:border-linea-fuerte',
                          )}
                        >
                          <input
                            type="radio"
                            name={field.name}
                            className="sr-only"
                            checked={checked}
                            onChange={() => field.onChange(value)}
                            onBlur={field.onBlur}
                          />
                          <Icon
                            className={cn('mt-0.5 size-5 shrink-0', checked ? 'text-anil-700' : 'text-tinta-4')}
                            aria-hidden
                          />
                          <span className="pr-6">
                            <span className="block text-[15px] font-semibold text-tinta">{title}</span>
                            <span className="mt-0.5 block text-[13px] leading-snug text-tinta-3">{description}</span>
                          </span>
                          <span
                            aria-hidden
                            className={cn(
                              'absolute top-4 right-4 grid size-[18px] place-items-center rounded-full border transition-colors',
                              checked ? 'border-anil-700 bg-anil-700 text-white' : 'border-linea-fuerte bg-white',
                            )}
                          >
                            {checked && <Check className="size-3" strokeWidth={3} />}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
              />
              {errors.traditional && (
                <p role="alert" className="text-[13px] text-status-error">
                  {errors.traditional.message}
                </p>
              )}
            </FormSection>

            <FormSection step={3} title="Documentación" description="Un PDF por documento, de 10 MB como máximo.">
              <div className="grid gap-5 sm:grid-cols-2">
                <Controller
                  control={control}
                  name="estatutos"
                  render={({ field }) => (
                    <FileDropzone
                      id="estatutos"
                      label="Estatutos"
                      description="Inscritos en el registro de asociaciones"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.estatutos?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="memoria"
                  render={({ field }) => (
                    <FileDropzone
                      id="memoria"
                      label="Memoria"
                      description="Descripción de la caseta y actividades"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.memoria?.message}
                    />
                  )}
                />
              </div>
            </FormSection>
          </Card>

          <div className="mt-6 flex flex-col gap-3 lg:hidden">
            <SubmitButton submitting={isSubmitting} />
            <Button variant="ghost" onClick={() => reset()} disabled={isSubmitting}>
              Vaciar formulario
            </Button>
          </div>
        </form>

        <aside className="hidden lg:sticky lg:top-28 lg:block">
          <Progress control={control} />
          <div className="mt-5 flex flex-col gap-2">
            <SubmitButton submitting={isSubmitting} />
            <Button variant="ghost" size="sm" onClick={() => reset()} disabled={isSubmitting}>
              Vaciar formulario
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}

function FormSection({
  step,
  title,
  description,
  children,
}: {
  step: number
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="grid gap-5 p-6 sm:p-8" aria-labelledby={`seccion-${step}`}>
      <header className="flex gap-3">
        <span className="font-cartel tabular grid size-7 shrink-0 place-items-center rounded-full bg-anil-50 text-sm font-bold text-anil-700">
          {step}
        </span>
        <div>
          <h2 id={`seccion-${step}`} className="text-lg leading-7 font-bold text-tinta">
            {title}
          </h2>
          <p className="text-sm text-tinta-3">{description}</p>
        </div>
      </header>
      <div className="grid gap-5 sm:pl-10">{children}</div>
    </section>
  )
}

function SubmitButton({ submitting }: { submitting: boolean }) {
  return (
    <Button type="submit" form={FORM_ID} size="lg" disabled={submitting} className="w-full">
      {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {submitting ? 'Enviando…' : 'Enviar solicitud'}
    </Button>
  )
}

/** Live checklist of what the form still needs, mirroring the validation rules. */
function Progress({ control }: { control: Control<FormInput, unknown, FormOutput> }) {
  const values = useWatch({ control })
  const items = [
    { label: 'Nombre de la caseta', done: (values.name?.trim().length ?? 0) >= 3 },
    { label: 'CIF válido', done: isValidCif(values.cif ?? '') },
    { label: 'Descripción', done: (values.description?.trim().length ?? 0) >= DESCRIPTION_MIN },
    { label: 'Tipo de caseta', done: values.traditional !== undefined },
    { label: 'Estatutos', done: values.estatutos instanceof File },
    { label: 'Memoria', done: values.memoria instanceof File },
  ]
  const completed = items.filter((i) => i.done).length

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-bold text-tinta">Tu solicitud</h2>
        <span className="tabular text-[13px] text-tinta-3">
          {completed} de {items.length}
        </span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-cal-hondo"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={items.length}
        aria-valuenow={completed}
        aria-label="Campos completados"
      >
        <div
          className="h-full rounded-full bg-anil-600 transition-[width] duration-300 ease-(--ease-out-snap)"
          style={{ width: `${(completed / items.length) * 100}%` }}
        />
      </div>
      <ul className="mt-4 flex flex-col gap-2.5">
        {items.map(({ label, done }) => (
          <li key={label} className={cn('flex items-center gap-2.5 text-sm', done ? 'text-tinta' : 'text-tinta-3')}>
            <span
              className={cn(
                'grid size-4 shrink-0 place-items-center rounded-full transition-colors duration-150',
                done ? 'bg-status-approved text-white' : 'border border-linea-fuerte',
              )}
            >
              {done && <Check className="size-2.5" strokeWidth={3.5} aria-hidden />}
            </span>
            {label}
            <span className="sr-only">{done ? 'completado' : 'pendiente'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SubmissionSuccess({ result, onNew }: { result: SubmissionResult; onNew: () => void }) {
  const { caseta, reference } = result
  return (
    <div className="rise-in mx-auto max-w-lg">
      <Card className="overflow-hidden">
        <Toldo />
        <div className="px-6 pt-8 pb-6 text-center sm:px-10">
          <CircleCheck className="mx-auto size-9 text-status-approved" aria-hidden />
          <h1 className="font-cartel mt-3 text-3xl font-extrabold text-tinta">Solicitud enviada</h1>
          <p className="mt-2 text-tinta-2">
            Hemos recibido la documentación de <strong className="font-semibold text-tinta">{caseta.name}</strong>.
            Los técnicos municipales la revisarán.
          </p>

          <div className="mt-6 flex items-center gap-4 rounded-panel bg-cal p-4 text-left">
            <div className="text-center">
              <span className="block text-[11px] font-semibold text-tinta-3">Caseta</span>
              <span className="font-cartel tabular block text-4xl leading-none font-extrabold text-anil-700">
                {caseta.number}
              </span>
            </div>
            <dl className="grid flex-1 gap-1.5 border-l border-linea pl-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-tinta-3">Referencia</dt>
                <dd className="tabular font-semibold">{reference}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-tinta-3">CIF</dt>
                <dd className="tabular">{caseta.cif}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-tinta-3">Estado</dt>
                <dd>
                  <StatusBadge status={caseta.status} />
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 flex flex-col-reverse justify-center gap-2 sm:flex-row">
            <Button variant="ghost" onClick={onNew}>
              Nueva solicitud
            </Button>
            <Link to={`/gestion?caseta=${caseta.number}`} className={buttonClasses('primary', 'md')}>
              <MapPin className="size-4" aria-hidden />
              Ver en el mapa
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
