// Мини-валидация форм со своими всплывашками (FieldError) вместо системных браузерных
export function useFormCheck<T extends string>() {
  const errors = reactive({}) as Record<T, string | null>
  function check(rules: Partial<Record<T, () => string | null>>, focusPrefix = '') {
    let first: T | null = null
    for (const key of Object.keys(rules) as T[]) {
      const msg = rules[key]!()
      errors[key] = msg
      if (msg && !first) first = key
    }
    if (first && import.meta.client) {
      const el = document.querySelector<HTMLElement>(`[data-field="${focusPrefix}${first}"]`)
      el?.focus({ preventScroll: true })
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
    return !first
  }
  const clear = (key: T) => (errors[key] = null)
  return { errors, check, clear }
}
