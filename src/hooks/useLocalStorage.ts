import { useState, useEffect } from 'react'

type SetValue<T> = T | ((val: T) => T)

/**
 * Hook customizado para gerenciar dados no localStorage
 * @param key - Chave do localStorage
 * @param initialValue - Valor inicial se não existir no localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
      return initialValue
    }
  })

  // Função para atualizar o valor no estado e no localStorage
  const setValue = (value: SetValue<T>) => {
    try {
      // Permite que o valor seja uma função, como no useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
    }
  }

  return [storedValue, setValue] as const
}
