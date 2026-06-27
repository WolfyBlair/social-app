import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

import * as persisted from '#/state/persisted'

type StateContext = persisted.Schema['nostrPubkey']
type SetContext = (v: persisted.Schema['nostrPubkey']) => void

const stateContext = createContext<StateContext>(persisted.defaults.nostrPubkey)
stateContext.displayName = 'NostrPubkeyStateContext'
const setContext = createContext<SetContext>(
  (_: persisted.Schema['nostrPubkey']) => {},
)
setContext.displayName = 'NostrPubkeySetContext'

export function Provider({children}: React.PropsWithChildren<{}>) {
  const [state, setState] = useState(persisted.get('nostrPubkey'))

  const setStateWrapped = useCallback(
    (nostrPubkey: persisted.Schema['nostrPubkey']) => {
      setState(nostrPubkey)
      void persisted.write('nostrPubkey', nostrPubkey)
    },
    [setState],
  )

  useEffect(() => {
    return persisted.onUpdate('nostrPubkey', nextNostrPubkey => {
      setState(nextNostrPubkey)
    })
  }, [setStateWrapped])

  return (
    <stateContext.Provider value={state}>
      <setContext.Provider value={setStateWrapped}>
        {children}
      </setContext.Provider>
    </stateContext.Provider>
  )
}

export function useNostrPubkey() {
  return useContext(stateContext)
}

export function useSetNostrPubkey() {
  return useContext(setContext)
}
